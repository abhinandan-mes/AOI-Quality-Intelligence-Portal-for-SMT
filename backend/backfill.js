const fs = require('fs');
const { parseStringPromise } = require('xml2js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  const dir = 'E:\\Line-401\\401_SPI\\Archive';
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.xml')).map(f => dir + '\\' + f);
  let c = 0;
  for (const filePath of files) {
    try {
      const xml = fs.readFileSync(filePath, 'utf8');
      const result = await parseStringPromise(xml);
      const panel = result.PARMI?.Panel;
      if (!panel) continue;
      
      const barcode = panel.$.barcode;
      const machine = await prisma.machine.findFirst({ where: { machineId: panel.$.MachineName } });
      if (!machine) continue;
      
      const existing = await prisma.inspection.findFirst({ where: { barcode, machineId: machine.id }});
      if (!existing) continue;
      
      const defects = [];
      if (panel.Boards?.[0]?.Board) {
        for (const board of panel.Boards[0].Board) {
          const blockId = board.$.id || board.$.orderid;
          if (board.Components?.[0]?.Component) {
            for (const comp of board.Components[0].Component) {
              if (comp.$.inspresult !== '0' && !defects.find(d => d.componentName === comp.$.name)) {
                defects.push({ inspectionId: existing.id, componentName: comp.$.name, defectType: 'SPI Defect', blockId });
              }
            }
          }
        }
      }
      
      if (defects.length > 0) {
        await prisma.defect.deleteMany({ where: { inspectionId: existing.id } });
        await prisma.defect.createMany({ data: defects });
        c++;
      }
    } catch (e) {
      console.error(e.message);
    }
  }
  console.log('Updated defects for ' + c + ' files');
})();
