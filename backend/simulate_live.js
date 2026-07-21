const fs = require('fs');
const path = require('path');

const targetDir = 'E:\\\\Line-401\\\\401_SPI';

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log(`Created directory: ${targetDir}`);
}

const generateRandomXML = () => {
  const barcode = Math.floor(1000000000 + Math.random() * 9000000000).toString();
  // Generate random pass or fail. 80% pass (resultcode="0"), 20% fail (resultcode="3" or "5")
  const isPass = Math.random() > 0.2;
  const resultCode = isPass ? "0" : (Math.random() > 0.5 ? "3" : "5");
  
  const now = new Date().toISOString();
  
  let boardsXml = "";
  if (!isPass) {
    const compNum = Math.floor(Math.random() * 9000) + 1000;
    boardsXml = `
    <Boards>
      <Board id="1">
        <Components>
          <Component name="C${compNum}" inspresult="${resultCode}" />
        </Components>
      </Board>
    </Boards>`;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<PARMI>
  <Panel barcode="${barcode}" ModelName="PD2577FEXM-0-A-00" MachineName="MACHINE001" start_Insptime="${now}" resultcode="${resultCode}">
    <Value>
      <Height data="${(0.08 + Math.random() * 0.01).toFixed(3)}"/>
      <Area per="${(0.15 + Math.random() * 0.02).toFixed(3)}"/>
      <Volume per="${(0.01 + Math.random() * 0.005).toFixed(3)}"/>
    </Value>${boardsXml}
  </Panel>
</PARMI>`;
};

console.log("Starting Live Production Simulator...");
console.log(`Dropping a new SPI inspection XML into ${targetDir} every 5 seconds...`);

setInterval(() => {
  try {
    const xml = generateRandomXML();
    const filename = `SPI_SIM_${Date.now()}.xml`;
    const filepath = path.join(targetDir, filename);
    
    fs.writeFileSync(filepath, xml, 'utf8');
    console.log(`[SIMULATOR] Dropped file: ${filename}`);
  } catch (err) {
    console.error("Error dropping file:", err.message);
  }
}, 5000);
