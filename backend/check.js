const fs = require('fs');
const { parseStringPromise } = require('xml2js');

(async () => {
  const dir = 'E:\\Line-401\\401_SPI\\Archive';
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.xml'));
  for (const file of files) {
    const content = fs.readFileSync(dir + '\\' + file, 'utf8');
    if (content.includes('resultcode="5"') || content.includes('resultcode="3"')) {
      const result = await parseStringPromise(content, { explicitArray: false });
      const panel = result.PARMI?.Panel;
      if (panel && panel.Boards?.Board) {
        const boards = Array.isArray(panel.Boards.Board) ? panel.Boards.Board : [panel.Boards.Board];
        for (const board of boards) {
          if (board.Components?.Component) {
            const comps = Array.isArray(board.Components.Component) ? board.Components.Component : [board.Components.Component];
            for (const comp of comps) {
              if (comp.$.inspresult !== '0') {
                console.log(JSON.stringify(comp, null, 2));
                return;
              }
            }
          }
        }
      }
    }
  }
})();
