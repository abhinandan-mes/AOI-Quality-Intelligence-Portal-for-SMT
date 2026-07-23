import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seed() {
  const line = await prisma.line.upsert({
    where: { name: 'Line 1' },
    update: {},
    create: { name: 'Line 1', postAoiWatchPath: '/dummy/aoi', spiWatchPath: '/dummy/spi', preAoiWatchPath: '/dummy/pre' }
  });

  const machineAoi = await prisma.machine.upsert({
    where: { machineId: 'POST-AOI-01' },
    update: { type: 'POST_AOI' },
    create: { machineId: 'POST-AOI-01', name: 'AOI Machine 1', type: 'POST_AOI', lineId: line.id }
  });
  
  const machineSpi = await prisma.machine.upsert({
    where: { machineId: 'SPI-01' },
    update: { type: 'SPI' },
    create: { machineId: 'SPI-01', name: 'SPI Machine 1', type: 'SPI', lineId: line.id }
  });

  const machinePreAoi = await prisma.machine.upsert({
    where: { machineId: 'PRE-POST-AOI-01' },
    update: { type: 'PRE_AOI' },
    create: { machineId: 'PRE-POST-AOI-01', name: 'PRE AOI Machine 1', type: 'PRE_AOI', lineId: line.id }
  });

  const model = await prisma.productModel.upsert({
    where: { name: 'TEST-MODEL' },
    update: {},
    create: { name: 'TEST-MODEL' }
  });

  const barcodes = ['BARCODE-1', 'BARCODE-2', 'BARCODE-3'];

  // Insert SPI
  for (let i = 0; i < 3; i++) {
    await prisma.inspection.create({
      data: {
        barcode: barcodes[i],
        modelId: model.id,
        machineId: machineSpi.id,
        status: i === 0 ? 'PASS' : 'FAIL',
        inspectionTime: new Date(Date.now() - 3000000 + i * 1000)
      }
    });
  }
  
  // Insert Pre AOI
  for (let i = 0; i < 3; i++) {
    await prisma.inspection.create({
      data: {
        barcode: barcodes[i],
        modelId: model.id,
        machineId: machinePreAoi.id,
        status: i === 1 ? 'PASS' : 'FAIL',
        inspectionTime: new Date(Date.now() - 2000000 + i * 1000)
      }
    });
  }

  // Insert Pre AOI - Second attempt for Barcode 2 to show history!
  await prisma.inspection.create({
    data: {
      barcode: barcodes[1],
      modelId: model.id,
      machineId: machinePreAoi.id,
      status: 'PASS',
      inspectionTime: new Date(Date.now() - 1500000)
    }
  });

  // Insert AOI
  for (let i = 0; i < 3; i++) {
    await prisma.inspection.create({
      data: {
        barcode: barcodes[i],
        modelId: model.id,
        machineId: machineAoi.id,
        status: i === 2 ? 'PASS' : 'FAIL',
        inspectionTime: new Date(Date.now() - 1000000 + i * 1000)
      }
    });
  }

  console.log('Dummy data seeded!');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
