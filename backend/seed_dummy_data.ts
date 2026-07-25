import { PrismaClient, MachineType, InspectionStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding dummy data...');

  // Create Product Model
  const model = await prisma.productModel.upsert({
    where: { name: 'DummyModel' },
    update: {},
    create: {
      name: 'DummyModel',
      description: 'Dummy Model for Testing',
      componentsPerBoard: 50,
      boardsPerPanel: 2
    }
  });

  // Create Lines
  const lineNames = ['Line 1', 'Line 2', 'Line 3', 'Line 4', 'Line 5'];
  const lines = [];
  for (const name of lineNames) {
    const line = await prisma.line.upsert({
      where: { name },
      update: {},
      create: { name }
    });
    lines.push(line);
  }

  // Create Machines
  const machineTypes = [MachineType.SPI, MachineType.PRE_AOI, MachineType.POST_AOI];
  const machines = [];
  for (const line of lines) {
    for (const type of machineTypes) {
      const machineId = `${line.name.replace(' ', '')}_${type}`;
      const machine = await prisma.machine.upsert({
        where: { machineId },
        update: {},
        create: {
          machineId,
          name: `${line.name} ${type} Machine`,
          type,
          lineId: line.id
        }
      });
      machines.push(machine);
    }
  }

  // Generate Inspections and Defects over the last 30 days
  const now = new Date();
  const components = ['R1', 'R2', 'C1', 'C2', 'U1', 'U2', 'IC1', 'D1', 'Q1', 'L1', 'R10', 'C10'];
  const defectTypes = ['Missing', 'Shift', 'Tombstone', 'Solder Bridge', 'Insufficient Solder', 'Excess Solder'];
  
  let inspectionCount = 0;
  let defectCount = 0;

  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Generate some random number of inspections for this day (10 to 30)
    const numInspections = Math.floor(Math.random() * 20) + 10;
    
    for (let j = 0; j < numInspections; j++) {
      // Random hour between 0 and 23
      const hour = Math.floor(Math.random() * 24);
      const min = Math.floor(Math.random() * 60);
      const inspectionTime = new Date(date);
      inspectionTime.setHours(hour, min, 0, 0);

      const machine = machines[Math.floor(Math.random() * machines.length)];
      const side = Math.random() > 0.5 ? 'Top' : 'Bottom';
      const isFail = Math.random() > 0.85; // 15% fail rate
      const status = isFail ? InspectionStatus.FAIL : (machine.type === 'SPI' ? InspectionStatus.GOOD : InspectionStatus.PASS);

      const inspection = await prisma.inspection.create({
        data: {
          barcode: `BOARD_${machine.type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          modelId: model.id,
          machineId: machine.id,
          inspectionTime,
          status,
          side,
          cycleTime: 12.5 + Math.random() * 5
        }
      });
      inspectionCount++;

      if (isFail) {
        // Generate 1-3 defects
        const numDefects = Math.floor(Math.random() * 3) + 1;
        for (let k = 0; k < numDefects; k++) {
          const component = components[Math.floor(Math.random() * components.length)];
          const defectType = defectTypes[Math.floor(Math.random() * defectTypes.length)];
          
          await prisma.defect.create({
            data: {
              inspectionId: inspection.id,
              componentName: component,
              defectType,
              defectCount: 1,
              repairStatus: 'PENDING'
            }
          });
          defectCount++;
        }
      }
    }
  }

  console.log(`Successfully generated ${inspectionCount} inspections and ${defectCount} defects across ${lines.length} lines.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
