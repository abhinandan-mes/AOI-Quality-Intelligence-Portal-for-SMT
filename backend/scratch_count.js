import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.inspection.count();
  console.log("Total Inspections in DB:", count);
}
main().catch(console.error).finally(() => prisma.$disconnect());
