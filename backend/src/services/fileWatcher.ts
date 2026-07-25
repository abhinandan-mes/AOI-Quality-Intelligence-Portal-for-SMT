import * as chokidar from 'chokidar';
import fs from 'fs';
import AdmZip from 'adm-zip';
import crypto from 'crypto';
import path from 'path';
import xml2js from 'xml2js';
import prisma from '../prismaClient';
import { io } from '../server';

let activeWatchers: chokidar.FSWatcher[] = [];

// Helper to ensure archive and error dirs exist in the target path



export const startFileWatcher = async () => {
  console.log('Initializing dynamic file watchers...');
  try {
    const lines = await prisma.line.findMany({
      where: { isInstalled: true }
    });

    lines.forEach(line => {
      if (line.postAoiWatchPath) setupWatcher(line.postAoiWatchPath, 'POST_AOI', line.name);
      if (line.spiWatchPath) setupWatcher(line.spiWatchPath, 'SPI', line.name);
      if (line.preAoiWatchPath) {
        setupWatcher(line.preAoiWatchPath, 'PRE_AOI', line.name);
        const preTstPath = line.preAoiWatchPath.replace('PREAOI', 'PRE TST');
        if (fs.existsSync(preTstPath)) {
          setupWatcher(preTstPath, 'PRE_TST' as any, line.name);
        }
      }
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

const setupWatcher = (watchPath: string, type: 'POST_AOI' | 'SPI' | 'PRE_AOI' | 'PRE_TST', lineName: string) => {
  if (!fs.existsSync(watchPath)) {
    console.error(`Watch path does not exist for Line ${lineName} (${type}): ${watchPath}`);
    return;
  }

  const watcher = chokidar.watch(watchPath, {
    ignored: /(^|[\\/\\])\../,
    persistent: true,
    awaitWriteFinish: { stabilityThreshold: 2000, pollInterval: 100 }
  });

  watcher.on('add', async (filePath) => {
    // Check if already processed
    try {
      const existing = await prisma.fileImportLog.findUnique({ where: { filePath } });
      if (existing && existing.status === 'SUCCESS') return; // Skip
    } catch(e) {}
    
    console.log(`[${lineName} ${type}] New file detected: ${filePath}. Added to queue.`);
    fileQueue.push({ filePath, type, lineName });
    processQueue();
  });

  activeWatchers.push(watcher);
  console.log(`Watching ${type} for Line ${lineName} at ${watchPath}`);
};

interface QueueItem {
  filePath: string;
  type: 'POST_AOI' | 'SPI' | 'PRE_AOI' | 'PRE_TST';
  lineName: string;
}

const fileQueue: QueueItem[] = [];
let isProcessingQueue = false;

const processQueue = async () => {
  if (isProcessingQueue) return;
  isProcessingQueue = true;

  while (fileQueue.length > 0) {
    const item = fileQueue.shift();
    if (!item) continue;
    
    const { filePath, type, lineName } = item;
    const ext = path.extname(filePath).toLowerCase();
    
    try {
      if (ext === '.zip') {
        await processZipFile(filePath, type as any, lineName);
      } else if ((type === 'POST_AOI' || type === 'PRE_AOI') && (ext === '.rst' || ext === '.json' || ext === '.txt')) {
        await processAOIFile(filePath, lineName, type);
      } else if (type === 'SPI' && ext === '.xml') {
        await processSPIFile(filePath, lineName);
      } else if (type === 'PRE_AOI' && ext === '.xml') {
        await processViscomXML(filePath, lineName, type);
      } else if (type === 'PRE_TST' && ext === '.vis') {
        await processVISFile(filePath);
      } else if (['.jpeg', '.jpg', '.png', '.bmp', '.ois'].includes(ext) || ext === '.tst') {
        // Silently skip images, raw sensor files, and binary tst files
      } else {
        throw new Error(`Unsupported file extension ${ext} for ${type}`);
      }

      if (!['.jpeg', '.jpg', '.png', '.bmp', '.ois', '.tst'].includes(ext)) {
        await logImport(filePath, 'SUCCESS', 'Imported successfully');
        io.emit('new_inspection', { message: 'New inspection data imported.' });
      }
    } catch (error: any) {
      console.error(`Error processing file ${filePath}:`, error.message);
      await logImport(filePath, 'ERROR', error.message);
    }
  }

  isProcessingQueue = false;
};

const processViscomXML = async (filePath: string, lineName: string, type: 'POST_AOI' | 'SPI' | 'PRE_AOI') => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const parser = new xml2js.Parser({ explicitArray: false });
  const result = await parser.parseStringPromise(content);

  const infos = result.boost_serialization?.infos;
  if (!infos) throw new Error('Invalid Viscom XML format: Missing infos block');

  const barcode = infos.panelIdCode || infos.subPanelIdCode || 'UNKNOWN';
  const modelName = infos.productName || infos.modelFamilyName || 'UNKNOWN';
  const inspTimeStr = infos.creationDate; // "2026/07/25_11:10:05"
  let inspTime = new Date();
  if (inspTimeStr) {
    const cleanStr = inspTimeStr.replace('_', ' ').replace(/\//g, '-');
    inspTime = new Date(cleanStr);
  }

  const defectsNode = result.boost_serialization?.defects;
  let status = 'PASS';
  const defectsList: { componentName: string, defectType: string }[] = [];
  
  if (defectsNode) {
    const compName = infos.topology || 'Unknown';
    const defectType = [];
    for (const key of Object.keys(defectsNode)) {
      if (key.startsWith('AOI_has') && defectsNode[key] === '1') {
        defectType.push(key.replace('AOI_has', '').replace('Defect', ''));
        status = 'FAIL';
      }
    }
    if (defectType.length > 0) {
      defectsList.push({
        componentName: compName,
        defectType: defectType.join(', ')
      });
    }
  }

  let side = null;
  if (filePath.match(/[-_\/\\]TOP[-_\/\\]/i)) side = 'TOP';
  else if (filePath.match(/[-_\/\\]BOTTOM[-_\/\\]/i)) side = 'BOTTOM';

  await saveOrUpdateInspection(barcode, modelName, 'Viscom', lineName, type, inspTime, status, filePath, { side }, defectsList);
};

const processZipFile = async (filePath: string, type: 'POST_AOI' | 'SPI' | 'PRE_AOI', lineName: string) => {
  const zip = new AdmZip(filePath);
  const zipEntries = zip.getEntries();
  const tempDir = path.join('/tmp', `aoi_zip_${crypto.randomUUID()}`);
  fs.mkdirSync(tempDir, { recursive: true });

  try {
    zip.extractAllTo(tempDir, true);
    for (const entry of zipEntries) {
      if (entry.isDirectory) continue;
      const extractedPath = path.join(tempDir, entry.entryName);
      const ext = path.extname(extractedPath).toLowerCase();
      
      if ((type === 'POST_AOI' || type === 'PRE_AOI') && (ext === '.rst' || ext === '.json' || ext === '.txt')) {
        await processAOIFile(extractedPath, lineName, type);
      } else if (type === 'SPI' && ext === '.xml') {
        await processSPIFile(extractedPath, lineName);
      } else if (type === 'PRE_AOI' && ext === '.xml') {
        // Parse the IPC-2547 XML file
        await processIPC2547XML(extractedPath, lineName, type);
      }
    }
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
};

const processIPC2547XML = async (filePath: string, lineName: string, type: 'POST_AOI' | 'SPI' | 'PRE_AOI') => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const parser = new xml2js.Parser({ explicitArray: false });
  const result = await parser.parseStringPromise(content);

  const event = result.IPC2547Event;
  if (!event) throw new Error('Invalid IPC2547 format: Missing IPC2547Event block');

  const start = event.ProcessSessionStart;
  const barcode = event.ItemProcessStatus?.$.itemInstanceId || 'UNKNOWN';
  const modelName = start?.Product?.$.itemType || 'UNKNOWN';
  const machineId = start?.Entity?.$.stationId || 'VI-L402';
  const inspTime = new Date(event.ItemProcessStatus?.$.dateTime || new Date());
  
  const status = event.ItemProcessStatus?.$.status === 'PASSED' ? 'PASS' : 'FAIL';
  
  const defectsList: { componentName: string, defectType: string }[] = [];
  const steps = event.ProcessStepStatus;
  
  if (steps) {
    const stepsArray = Array.isArray(steps) ? steps : [steps];
    for (const step of stepsArray) {
      if (step.$.status === 'FAILED') {
        const indictments = step.Indictment;
        if (indictments) {
          const indArray = Array.isArray(indictments) ? indictments : [indictments];
          for (const ind of indArray) {
            // Find component name in Measurement tag
            let compName = 'Unknown';
            if (step.Measurement) {
              const ms = Array.isArray(step.Measurement) ? step.Measurement : [step.Measurement];
              for (const m of ms) {
                if (m.Component && m.Component.$ && m.Component.$.designator) {
                  compName = m.Component.$.designator;
                  break;
                }
              }
            }
            defectsList.push({
              componentName: compName,
              defectType: ind.$.indictmentKey || 'Defect'
            });
          }
        }
      }
    }
  }

  await saveOrUpdateInspection(barcode, modelName, machineId, lineName, type, inspTime, status, filePath, {}, defectsList);
};

// Processing logic remains largely similar but we pass lineName 
// instead of letting the machine ID dictate the line if line is already known.

const processAOIFile = async (filePath: string, lineName: string, type: 'POST_AOI' | 'SPI' | 'PRE_AOI') => {
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
  
  await saveOrUpdateInspection(barcode, modelName, machineId, lineName, type, inspTime, result, filePath, { side });
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
  type: 'POST_AOI' | 'SPI' | 'PRE_AOI',
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

  // Create history instead of merging
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
};

const logImport = async (filePath: string, status: string, message: string, machineId?: string) => {
  await prisma.fileImportLog.upsert({
    where: { filePath },
    update: { status, errorMessage: message },
    create: {
      filePath,
      fileName: path.basename(filePath),
      fileType: path.extname(filePath).toUpperCase().replace('.', ''),
      machineId: machineId || null,
      status: status,
      errorMessage: message
    }
  });
};

const processVISFile = async (filePath: string) => {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  let modelName = 'UNKNOWN';
  let boardsPerPanel = 1;
  
  const pMatch = content.match(/PANEL_NAME\s+(.*)/);
  if (pMatch) modelName = pMatch[1].trim();
  
  const bMatch = content.match(/NB_BOARD\s+(\d+)/);
  if (bMatch) boardsPerPanel = parseInt(bMatch[1].trim(), 10) || 1;

  let inComp = false;
  let componentsPerBoard = 0;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('COMP 1')) {
      inComp = true;
    } else if (inComp && trimmed.startsWith('COMP 2')) {
      break;
    } else if (inComp && trimmed !== '') {
      componentsPerBoard++;
    }
  }

  if (modelName !== 'UNKNOWN') {
    await (prisma.productModel as any).upsert({
      where: { name: modelName },
      update: { componentsPerBoard, boardsPerPanel },
      create: { name: modelName, componentsPerBoard, boardsPerPanel }
    });
  }
};
