"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startFileWatcher = void 0;
const chokidar_1 = __importDefault(require("chokidar"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const xml2js_1 = __importDefault(require("xml2js"));
const prismaClient_1 = __importDefault(require("../prismaClient"));
const server_1 = require("../server");
const WATCH_DIR = path_1.default.join(__dirname, '../../../watch_folder');
const ARCHIVE_DIR = path_1.default.join(WATCH_DIR, 'Archive');
const ERROR_DIR = path_1.default.join(WATCH_DIR, 'Error');
// Ensure directories exist
[WATCH_DIR, ARCHIVE_DIR, ERROR_DIR].forEach((dir) => {
    if (!fs_1.default.existsSync(dir)) {
        fs_1.default.mkdirSync(dir, { recursive: true });
    }
});
const startFileWatcher = () => {
    console.log(`Starting file watcher on: ${WATCH_DIR}`);
    const watcher = chokidar_1.default.watch(WATCH_DIR, {
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
        if (filePath.includes('Archive') || filePath.includes('Error'))
            return;
        console.log(`New file detected: ${filePath}`);
        const ext = path_1.default.extname(filePath).toLowerCase();
        try {
            if (ext === '.rst' || ext === '.json' || ext === '.txt') {
                await processAOIFile(filePath);
            }
            else if (ext === '.xml') {
                await processSPIFile(filePath);
            }
            else {
                throw new Error('Unsupported file extension');
            }
            await moveToArchive(filePath);
            server_1.io.emit('new_inspection', { message: 'New inspection data imported.' });
        }
        catch (error) {
            console.error(`Error processing file ${filePath}:`, error.message);
            await moveToError(filePath);
            await logImport(filePath, 'ERROR', error.message);
        }
    });
};
exports.startFileWatcher = startFileWatcher;
const processAOIFile = async (filePath) => {
    const content = fs_1.default.readFileSync(filePath, 'utf-8');
    let data;
    try {
        data = JSON.parse(content);
    }
    catch (e) {
        throw new Error('Invalid JSON/RST format');
    }
    const panel = data.PanelInsp;
    if (!panel)
        throw new Error('Missing PanelInsp block');
    const barcode = panel.ReadingBarcode;
    const modelName = panel.ModelName;
    const machineId = panel.MachineID;
    const inspTime = new Date(panel.InspDateTime);
    const result = panel.InspectResult === 64 || panel.InspectResult === 1 ? 'PASS' : 'FAIL'; // Simplification based on typical AOI codes
    await saveOrUpdateInspection(barcode, modelName, machineId, inspTime, result, filePath);
};
const processSPIFile = async (filePath) => {
    const content = fs_1.default.readFileSync(filePath, 'utf-8');
    const parser = new xml2js_1.default.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(content);
    const panel = result.PARMI?.Panel;
    if (!panel)
        throw new Error('Invalid SPI XML format: Missing PARMI.Panel');
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
const saveOrUpdateInspection = async (barcode, modelName, machineId, inspTime, status, filePath, extraData = {}) => {
    if (!barcode)
        throw new Error('Barcode is empty');
    // Ensure Line and Machine exist (mocking Line creation for simplicity)
    const line = await prismaClient_1.default.line.upsert({
        where: { name: 'Line-1' },
        update: {},
        create: { name: 'Line-1', description: 'Auto-created line' }
    });
    const machine = await prismaClient_1.default.machine.upsert({
        where: { machineId: machineId },
        update: {},
        create: {
            machineId: machineId,
            name: machineId,
            type: filePath.endsWith('.xml') ? 'SPI' : 'AOI',
            lineId: line.id
        }
    });
    const model = await prismaClient_1.default.productModel.upsert({
        where: { name: modelName },
        update: {},
        create: { name: modelName }
    });
    // Check for duplicates/merge logic
    const existing = await prismaClient_1.default.inspection.findFirst({
        where: {
            barcode: barcode,
            machineId: machine.id
        },
        orderBy: { inspectionTime: 'desc' }
    });
    if (existing) {
        if (existing.inspectionTime < inspTime) {
            // Update with newer inspection
            await prismaClient_1.default.inspection.update({
                where: { id: existing.id },
                data: {
                    status,
                    inspectionTime: inspTime,
                    ...extraData
                }
            });
            await logImport(filePath, 'MERGED', `Updated existing barcode ${barcode}`, machine.id);
        }
        else {
            await logImport(filePath, 'DUPLICATE', `Older or duplicate barcode ${barcode}`, machine.id);
        }
    }
    else {
        await prismaClient_1.default.inspection.create({
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
const moveToArchive = async (filePath) => {
    const fileName = path_1.default.basename(filePath);
    fs_1.default.renameSync(filePath, path_1.default.join(ARCHIVE_DIR, fileName));
};
const moveToError = async (filePath) => {
    const fileName = path_1.default.basename(filePath);
    fs_1.default.renameSync(filePath, path_1.default.join(ERROR_DIR, fileName));
};
const logImport = async (filePath, status, message, machineId) => {
    await prismaClient_1.default.fileImportLog.create({
        data: {
            fileName: path_1.default.basename(filePath),
            fileType: path_1.default.extname(filePath).toUpperCase().replace('.', ''),
            machineId: machineId,
            status: status,
            errorMessage: message
        }
    });
};
//# sourceMappingURL=fileWatcher.js.map