import * as chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import xml2js from 'xml2js';
import prisma from '../prismaClient';
import { io } from '../server';

let activeWatchers: chokidar.FSWatcher[] = [];

// Helper to ensure archive and error dirs exist in the target path
const ensureDirs = (basePath: string) => {
  const archiveDir = path.join(basePath, 'Archive');
  const errorDir = path.join(basePath, 'Error');
  if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });
  if (!fs.existsSync(errorDir)) fs.mkdirSync(errorDir, { recursive: true });
  return { archiveDir, errorDir };
};

export const startFileWatcher = async () => {
  console.log('Initializing dynamic file watchers...');
  try {
    const lines = await prisma.line.findMany({
      where: { isInstalled: true }
    });

    lines.forEach(line => {
      if (line.aoiWatchPath) setupWatcher(line.aoiWatchPath, 'AOI', line.name);
      if (line.spiWatchPath) setupWatcher(line.spiWatchPath, 'SPI', line.name);
    });
  } catch (error) {
    console.error('Error starting file watchers:', error);
  }
};

export const reloadWatchers = async () => {
  console.log('Reloading file watchers...');
  // Close all existing watchers
  for (const watcher of activeWatchers) {
    await watcher.close();
  }
  activeWatchers = [];
  // Restart
  await startFileWatcher();
};

const setupWatcher = (watchPath: string, type: 'AOI' | 'SPI', lineName: string) => {
  if (!fs.existsSync(watchPath)) {
    console.error(`Watch path does not exist for Line ${lineName} (${type}): ${watchPath}`);
    return;
  }

  const { archiveDir, errorDir } = ensureDirs(watchPath);

  const watcher = chokidar.watch(watchPath, {
    ignored: /(^|[\/\\])\../,
    persistent: true,
    awaitWriteFinish: { stabilityThreshold: 2000, pollInterval: 100 }
  });

  watcher.on('add', async (filePath) => {
    if (filePath.includes('Archive') || filePath.includes('Error')) return;
    
    console.log(`[${lineName} ${type}] New file detected: ${filePath}`);
    const ext = path.extname(filePath).toLowerCase();
    
    try {
      if (type === 'AOI' && (ext === '.rst' || ext === '.json' || ext === '.txt')) {
        await processAOIFile(filePath, lineName);
      } else if (type === 'SPI' && ext === '.xml') {
        await processSPIFile(filePath, lineName);
      } else {
        throw new Error(`Unsupported file extension ${ext} for ${type}`);
      }

      await moveToDir(filePath, archiveDir);
      io.emit('new_inspection', { message: 'New inspection data imported.' });
    } catch (error: any) {
      console.error(`Error processing file ${filePath}:`, error.message);
      await moveToDir(filePath, errorDir);
      await logImport(filePath, 'ERROR', error.message);
    }
  });

  activeWatchers.push(watcher);
  console.log(`Watching ${type} for Line ${lineName} at ${watchPath}`);
};

const moveToDir = async (filePath: string, targetDir: string) => {
  const ext = path.extname(filePath);
  const baseName = path.basename(filePath, ext);
  const timestamp = new Date().getTime();
  const newFileName = `${baseName}_${timestamp}${ext}`;
  fs.renameSync(filePath, path.join(targetDir, newFileName));
};

// Processing logic remains largely similar but we pass lineName 
// instead of letting the machine ID dictate the line if line is already known.

const processAOIFile = async (filePath: string, lineName: string) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  let data;
  try {
    data = JSON.parse(content);
  } catch (e) {
    throw new Error('Invalid JSON/RST format');
  }

  const panel = data.PanelInsp;
  if (!panel) throw new Error('Missing PanelInsp block');

  const barcode = panel.ReadingBarcode;
  const modelName = panel.ModelName;
  const machineId = panel.MachineID;
  const inspTime = new Date(panel.InspDateTime);
  const result = panel.InspectResult === 64 || panel.InspectResult === 1 ? 'PASS' : 'FAIL';
  let side: string | null = null;
  if (filePath.match(/[-_\\/]A[-_\\/]/i) || filePath.match(/[-_\\/]TOP[-_\\/]/i)) side = 'TOP';
  else if (filePath.match(/[-_\\/]B[-_\\/]/i) || filePath.match(/[-_\\/]BOTTOM[-_\\/]/i)) side = 'BOTTOM';
  
  await saveOrUpdateInspection(barcode, modelName, machineId, lineName, 'AOI', inspTime, result, filePath, { side });
};

const processSPIFile = async (filePath: string, lineName: string) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const parser = new xml2js.Parser({ explicitArray: false });
  const result = await parser.parseStringPromise(content);

  const panel = result.PARMI?.Panel;
  if (!panel) throw new Error('Invalid SPI XML format: Missing PARMI.Panel');

  const barcode = panel.$.barcode;
  const modelName = panel.$.ModelName;
  const machineId = panel.$.MachineName;
  const inspTime = new Date(panel.$.start_Insptime);
  
  let status = 'FAIL';
  if (panel.$.resultcode === "0" || panel.$.resultcode === "1") status = 'GOOD';
  else if (panel.$.resultcode === "2" || panel.$.resultcode === "5") status = 'PASS';
  else if (panel.$.resultcode === "3") status = 'NG';

  const values = panel.Value;
  const spiHeightAvg = parseFloat(values?.Height?.$.data || "0");
  const spiAreaAvg = parseFloat(values?.Area?.$.per || "0");
  const spiVolumeAvg = parseFloat(values?.Volume?.$.per || "0");

  let side: string | null = null;
  if (modelName?.match(/-A-/i) || filePath.match(/[-_\\/]A[-_\\/]/i) || filePath.match(/[-_\\/]TOP[-_\\/]/i)) side = 'TOP';
  else if (modelName?.match(/-B-/i) || filePath.match(/[-_\\/]B[-_\\/]/i) || filePath.match(/[-_\\/]BOTTOM[-_\\/]/i)) side = 'BOTTOM';

  // Extract defects
  const defects: { componentName: string; defectType: string; blockId?: string }[] = [];
  
  // Only extract locations if there are alarms (which happens in NG and Operator PASS)
  if (panel.Boards?.Board) {
    const boards = Array.isArray(panel.Boards.Board) ? panel.Boards.Board : [panel.Boards.Board];
    for (const board of boards) {
      const blockId = board.$.id || board.$.orderid;
      if (board.Components?.Component) {
        const comps = Array.isArray(board.Components.Component) ? board.Components.Component : [board.Components.Component];
        for (const comp of comps) {
          if (comp.$.inspresult !== "0") {
            if (!defects.find(d => d.componentName === comp.$.name)) {
              let defectType = 'SPI Defect';
              const code = parseInt(comp.$.inspresult, 10);
              if (!isNaN(code) && code > 0) {
                const types = [];
                if (code & 1) types.push('Height Excess');
                if (code & 2) types.push('Height Insuff');
                if (code & 4) types.push('Area Excess');
                if (code & 8) types.push('Area Insuff');
                if (code & 16) types.push('Volume Excess');
                if (code & 32) types.push('Volume Insuff');
                if (code & 64) types.push('Offset X');
                if (code & 128) types.push('Offset Y');
                if (code & 256) types.push('Bridge');
                if (code & 512) types.push('Shape');
                if (types.length > 0) defectType = types.join(', ');
              }

              defects.push({ 
                componentName: comp.$.name || 'Unknown', 
                defectType: defectType,
                blockId: blockId
              });
            }
          }
        }
      }
    }
  }

  await saveOrUpdateInspection(barcode, modelName, machineId, lineName, 'SPI', inspTime, status, filePath, {
    spiHeightAvg, spiAreaAvg, spiVolumeAvg, side
  }, defects);
};

const saveOrUpdateInspection = async (
  barcode: string, 
  modelName: string, 
  machineId: string,
  lineName: string,
  type: 'AOI' | 'SPI',
  inspTime: Date, 
  status: any, 
  filePath: string,
  extraData: any = {},
  defects: { componentName: string; defectType: string; blockId?: string }[] = []
) => {
  if (!barcode) throw new Error('Barcode is empty');

  const line = await prisma.line.upsert({
    where: { name: lineName },
    update: {},
    create: { name: lineName }
  });

  const machine = await prisma.machine.upsert({
    where: { machineId: machineId },
    update: { type: type, lineId: line.id },
    create: { machineId, name: machineId, type, lineId: line.id }
  });

  const model = await prisma.productModel.upsert({
    where: { name: modelName },
    update: {},
    create: { name: modelName }
  });

  const existing = await prisma.inspection.findFirst({
    where: { barcode: barcode, machineId: machine.id },
    orderBy: { inspectionTime: 'desc' }
  });

  if (existing) {
    if (existing.inspectionTime <= inspTime) {
      await prisma.inspection.update({
        where: { id: existing.id },
        data: { status, inspectionTime: inspTime, ...extraData }
      });
      if (defects && defects.length > 0) {
        await prisma.defect.deleteMany({ where: { inspectionId: existing.id } });
        await prisma.defect.createMany({
          data: defects.map(d => ({
            inspectionId: existing.id,
            componentName: d.componentName,
            defectType: d.defectType,
            blockId: d.blockId
          }))
        });
      }
      await logImport(filePath, 'MERGED', `Updated existing barcode ${barcode}`, machine.id);
    } else {
      await logImport(filePath, 'DUPLICATE', `Older or duplicate barcode ${barcode}`, machine.id);
    }
  } else {
    const newInsp = await prisma.inspection.create({
      data: {
        barcode, modelId: model.id, machineId: machine.id,
        inspectionTime: inspTime, status, ...extraData
      }
    });
    if (defects.length > 0) {
      await prisma.defect.createMany({
        data: defects.map(d => ({ 
          inspectionId: newInsp.id, 
          componentName: d.componentName, 
          defectType: d.defectType,
          blockId: d.blockId
        }))
      });
    }
    await logImport(filePath, 'SUCCESS', 'Imported successfully', machine.id);
  }
};

const logImport = async (filePath: string, status: string, message: string, machineId?: string) => {
  await prisma.fileImportLog.create({
    data: {
      fileName: path.basename(filePath),
      fileType: path.extname(filePath).toUpperCase().replace('.', ''),
      machineId: machineId || null,
      status: status,
      errorMessage: message
    }
  });
};
