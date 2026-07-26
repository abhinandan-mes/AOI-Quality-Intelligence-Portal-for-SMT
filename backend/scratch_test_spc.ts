import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import xml2js from 'xml2js';
import path from 'path';

const prisma = new PrismaClient();

async function processSPIFile(filePath: string, lineName: string) {
  console.log(`Processing ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf-8');
  const parser = new xml2js.Parser({ explicitArray: false });
  const result = await parser.parseStringPromise(content);

  const panel = result.PARMI?.Panel;
  if (!panel) throw new Error('Invalid SPI XML format: Missing PARMI.Panel');

  const barcode = panel.$.barcode;
  const modelName = panel.$.ModelName;
  const machineId = panel.$.MachineName;
  const inspTime = new Date(panel.$.start_Insptime);
  let status = 'PASS';
  
  const values = panel.Value;
  const spiHeightAvg = parseFloat(values?.Height?.$.data || "0");
  const spiAreaAvg = parseFloat(values?.Area?.$.per || "0");
  const spiVolumeAvg = parseFloat(values?.Volume?.$.per || "0");

  const defects: any[] = [];
  const spcData: any[] = [];

  if (panel.Boards?.Board) {
    const boards = Array.isArray(panel.Boards.Board) ? panel.Boards.Board : [panel.Boards.Board];
    for (const board of boards) {
      const blockId = board.$.id || board.$.orderid;
      if (board.Components?.Component) {
        const comps = Array.isArray(board.Components.Component) ? board.Components.Component : [board.Components.Component];
        for (const comp of comps) {
          if (comp.$.inspresult !== "0") {
            defects.push({ componentName: comp.$.name, defectType: 'SPI Defect', blockId });
          }
          if (comp.Value) {
            spcData.push({
              componentName: comp.$.name || 'Unknown',
              height: parseFloat(comp.Value.Height?.$.data || "0"),
              area: parseFloat(comp.Value.Area?.$.data || "0"),
              volume: parseFloat(comp.Value.Volume?.$.data || "0"),
              offsetX: parseFloat(comp.Value.Offset?.$.data_x || "0"),
              offsetY: parseFloat(comp.Value.Offset?.$.data_y || "0"),
            });
          }
        }
      }
    }
  }

  console.log(`Parsed ${spcData.length} SPC records. Adding to DB...`);
  
  const line = await prisma.line.upsert({
    where: { name: lineName },
    update: {},
    create: { name: lineName }
  });

  const machine = await prisma.machine.upsert({
    where: { machineId: machineId },
    update: { type: 'SPI', lineId: line.id },
    create: { machineId, name: machineId, type: 'SPI', lineId: line.id }
  });

  const model = await prisma.productModel.upsert({
    where: { name: modelName },
    update: {},
    create: { name: modelName }
  });

  const newInsp = await prisma.inspection.create({
    data: {
      barcode, modelId: model.id, machineId: machine.id,
      inspectionTime: inspTime, status, spiHeightAvg, spiAreaAvg, spiVolumeAvg
    }
  });

  if (spcData.length > 0) {
    await prisma.spiSpcData.createMany({
      data: spcData.map(d => ({
        inspectionId: newInsp.id,
        componentName: d.componentName,
        height: d.height,
        area: d.area,
        volume: d.volume,
        offsetX: d.offsetX,
        offsetY: d.offsetY
      }))
    });
    console.log(`Inserted ${spcData.length} SpiSpcData records into DB.`);
  }
}

processSPIFile('/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/InspResultData.xml', 'Line 1')
  .then(() => {
    console.log('Success');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
