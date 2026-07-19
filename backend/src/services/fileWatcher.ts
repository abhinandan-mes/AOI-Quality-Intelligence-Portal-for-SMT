import chokidar from 'chokidar';
import fs from 'fs';
import path from 'path';
import xml2js from 'xml2js';
import prisma from '../prismaClient';
import { io } from '../server';

const WATCH_DIR = path.join(__dirname, '../../../watch_folder');
const ARCHIVE_DIR = path.join(WATCH_DIR, 'Archive');
const ERROR_DIR = path.join(WATCH_DIR, 'Error');

// Ensure directories exist
[WATCH_DIR, ARCHIVE_DIR, ERROR_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

export const startFileWatcher = () => {
  console.log(`Starting file watcher on: ${WATCH_DIR}`);
  
  const watcher = chokidar.watch(WATCH_DIR, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true,
    depth: 0,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 100
    }
  });

  watcher.on('add', async (filePath) => {
    // Ignore files added inside Archive or Error
    if (filePath.includes('Archive') || filePath.includes('Error')) return;
    
    console.log(`New file detected: ${filePath}`);
    const ext = path.extname(filePath).toLowerCase();
    
    try {
      if (ext === '.rst' || ext === '.json' || ext === '.txt') {
        await processAOIFile(filePath);
      } else if (ext === '.xml') {
        await processSPIFile(filePath);
      } else {
        throw new Error('Unsupported file extension');
      }

      await moveToArchive(filePath);
      io.emit('new_inspection', { message: 'New inspection data imported.' });
      
    } catch (error: any) {
      console.error(`Error processing file ${filePath}:`, error.message);
      await moveToError(filePath);
      await logImport(filePath, 'ERROR', error.message);
    }
  });
};

const processAOIFile = async (filePath: string) => {
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
  const result = panel.InspectResult === 64 || panel.InspectResult === 1 ? 'PASS' : 'FAIL'; // Simplification based on typical AOI codes
  
  await saveOrUpdateInspection(barcode, modelName, machineId, inspTime, result, filePath);
};

const processSPIFile = async (filePath: string) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const parser = new xml2js.Parser({ explicitArray: false });
  const result = await parser.parseStringPromise(content);

  const panel = result.PARMI?.Panel;
  if (!panel) throw new Error('Invalid SPI XML format: Missing PARMI.Panel');

  const barcode = panel.$.barcode;
  const modelName = panel.$.ModelName;
  const machineId = panel.$.MachineName;
  const inspTime = new Date(panel.$.start_Insptime);
  
  // Checking resultcode or inspresult
  const status = panel.$.resultcode === "1" ? 'PASS' : 'FAIL'; 

  // Extract average values for the panel
  const values = panel.Value;
  const spiHeightAvg = parseFloat(values?.Height?.$.data || "0");
  const spiAreaAvg = parseFloat(values?.Area?.$.data || "0");
  const spiVolumeAvg = parseFloat(values?.Volume?.$.data || "0");

  await saveOrUpdateInspection(barcode, modelName, machineId, inspTime, status, filePath, {
    spiHeightAvg,
    spiAreaAvg,
    spiVolumeAvg
  });
};

const saveOrUpdateInspection = async (
  barcode: string, 
  modelName: string, 
  machineId: string, 
  inspTime: Date, 
  status: any, 
  filePath: string,
  extraData: any = {}
) => {
  if (!barcode) throw new Error('Barcode is empty');

  // Ensure Line and Machine exist (mocking Line creation for simplicity)
  const line = await prisma.line.upsert({
    where: { name: 'Line-1' },
    update: {},
    create: { name: 'Line-1', description: 'Auto-created line' }
  });

  const machine = await prisma.machine.upsert({
    where: { machineId: machineId },
    update: {},
    create: {
      machineId: machineId,
      name: machineId,
      type: filePath.endsWith('.xml') ? 'SPI' : 'AOI',
      lineId: line.id
    }
  });

  const model = await prisma.productModel.upsert({
    where: { name: modelName },
    update: {},
    create: { name: modelName }
  });

  // Check for duplicates/merge logic
  const existing = await prisma.inspection.findFirst({
    where: {
      barcode: barcode,
      machineId: machine.id
    },
    orderBy: { inspectionTime: 'desc' }
  });

  if (existing) {
    if (existing.inspectionTime < inspTime) {
      // Update with newer inspection
      await prisma.inspection.update({
        where: { id: existing.id },
        data: {
          status,
          inspectionTime: inspTime,
          ...extraData
        }
      });
      await logImport(filePath, 'MERGED', `Updated existing barcode ${barcode}`, machine.id);
    } else {
      await logImport(filePath, 'DUPLICATE', `Older or duplicate barcode ${barcode}`, machine.id);
    }
  } else {
    await prisma.inspection.create({
      data: {
        barcode,
        modelId: model.id,
        machineId: machine.id,
        inspectionTime: inspTime,
        status,
        ...extraData
      }
    });
    await logImport(filePath, 'SUCCESS', 'Imported successfully', machine.id);
  }
};

const moveToArchive = async (filePath: string) => {
  const fileName = path.basename(filePath);
  fs.renameSync(filePath, path.join(ARCHIVE_DIR, fileName));
};

const moveToError = async (filePath: string) => {
  const fileName = path.basename(filePath);
  fs.renameSync(filePath, path.join(ERROR_DIR, fileName));
};

const logImport = async (filePath: string, status: string, message: string, machineId?: string) => {
  await prisma.fileImportLog.create({
    data: {
      fileName: path.basename(filePath),
      fileType: path.extname(filePath).toUpperCase().replace('.', ''),
      machineId: machineId,
      status: status,
      errorMessage: message
    }
  });
};
