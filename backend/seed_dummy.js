import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function seed() {
  await prisma.defect.deleteMany({});
  await prisma.inspection.deleteMany({});
  await prisma.productModel.deleteMany({});
  await prisma.machine.deleteMany({});
  await prisma.line.deleteMany({});
  
  const line = await prisma.line.create({
    data: { name: 'Line 1', postAoiWatchPath: '/dummy/post', spiWatchPath: '/dummy/spi', preAoiWatchPath: '/dummy/pre' }
  });

  const machineAoi = await prisma.machine.create({
    data: { machineId: 'POST-AOI-01', name: 'POST AOI Machine 1', type: 'POST_AOI', lineId: line.id }
  });
  
  const machineSpi = await prisma.machine.create({
    data: { machineId: 'SPI-01', name: 'SPI Machine 1', type: 'SPI', lineId: line.id }
  });

  const machinePreAoi = await prisma.machine.create({
    data: { machineId: 'PRE-AOI-01', name: 'PRE AOI Machine 1', type: 'PRE_AOI', lineId: line.id }
  });

  const model = await prisma.productModel.create({
    data: { name: 'TEST-MODEL-X', componentsPerBoard: 120, boardsPerPanel: 2 }
  });

  const createInspections = async (machine, count, failRate) => {
    for (let i = 0; i < count; i++) {
      const isFail = Math.random() < failRate;
      const inspTime = new Date(Date.now() - Math.floor(Math.random() * 86400000)); // Within last 24 hrs
      
      const insp = await prisma.inspection.create({
        data: {
          barcode: `BOARD-${machine.type}-${Math.floor(Math.random()*10000)}`,
          modelId: model.id,
          machineId: machine.id,
          status: isFail ? 'FAIL' : 'PASS',
          inspectionTime: inspTime,
        }
      });

      if (isFail) {
        await prisma.defect.create({
          data: {
            inspectionId: insp.id,
            componentName: `C${Math.floor(Math.random()*20)}`,
            defectType: 'SolderBridging'
          }
        });
        if (Math.random() > 0.5) {
          await prisma.defect.create({
            data: {
              inspectionId: insp.id,
              componentName: `R${Math.floor(Math.random()*50)}`,
              defectType: 'Missing'
            }
          });
        }
      }
    }
  };

  await createInspections(machineSpi, 55, 0.2);
  await createInspections(machinePreAoi, 42, 0.3);
  await createInspections(machineAoi, 80, 0.1);

  console.log('Dummy data seeded!');
}

seed().catch(console.error).finally(() => prisma.$disconnect());
