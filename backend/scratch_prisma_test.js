import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function test() {
  const machineTypes = ['SPI'];
  try {
    const baseWhere = {
      machine: { type: { in: machineTypes } }
    };
    const count = await prisma.inspection.count({ where: baseWhere });
    console.log("Count with SPI:", count);
  } catch (e) {
    console.error("Error:", e.message);
  }
}
test().catch(console.error).finally(() => prisma.$disconnect());
