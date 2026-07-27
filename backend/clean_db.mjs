
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function cleanDB() {
  console.log('Cleaning up old transactional data...');
  const spcCount = await prisma.spiSpcData.deleteMany({});
  console.log('Deleted SpiSpcData:', spcCount.count);
  
  const defectCount = await prisma.defect.deleteMany({});
  console.log('Deleted Defects:', defectCount.count);
  
  const inspCount = await prisma.inspection.deleteMany({});
  console.log('Deleted Inspections:', inspCount.count);
  
  const actCount = await prisma.activityLog.deleteMany({});
  console.log('Deleted ActivityLogs:', actCount.count);
  
  console.log('Database cleanup complete!');
}

cleanDB().catch(console.error).finally(() => prisma.$disconnect());

