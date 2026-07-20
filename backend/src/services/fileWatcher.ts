import chokidar from 'chokidar';
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
    depth: 0,
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
  const fileName = path.basename(filePath);
  fs.renameSync(filePath, path.join(targetDir, fileName));
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
  
  await saveOrUpdateInspection(barcode, modelName, machineId, lineName, 'AOI', inspTime, result, filePath);
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
  const status = panel.$.resultcode === "1" ? 'PASS' : 'FAIL'; 

  const values = panel.Value;
  const spiHeightAvg = parseFloat(values?.Height?.$.data || "0");
  const spiAreaAvg = parseFloat(values?.Area?.$.data || "0");
  const spiVolumeAvg = parseFloat(values?.Volume?.$.data || "0");

  await saveOrUpdateInspection(barcode, modelName, machineId, lineName, 'SPI', inspTime, status, filePath, {
    spiHeightAvg, spiAreaAvg, spiVolumeAvg
  });
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
  extraData: any = {}
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
    if (existing.inspectionTime < inspTime) {
      await prisma.inspection.update({
        where: { id: existing.id },
        data: { status, inspectionTime: inspTime, ...extraData }
      });
      await logImport(filePath, 'MERGED', `Updated existing barcode ${barcode}`, machine.id);
    } else {
      await logImport(filePath, 'DUPLICATE', `Older or duplicate barcode ${barcode}`, machine.id);
    }
  } else {
    await prisma.inspection.create({
      data: {
        barcode, modelId: model.id, machineId: machine.id,
        inspectionTime: inspTime, status, ...extraData
      }
    });
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
