const fs = require('fs');

const filepath = 'src/pages/BarcodeHistory.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const exportContainerRegex = /(<div className="export-dropdown-container">[\s\S]*?<\/div>\s*)<\/div>\s*<\/div>\s*\{error &&/;
const match = content.match(exportContainerRegex);

if (match) {
  const exportContainerHtml = match[1];

  // Remove it from its original location
  content = content.replace(exportContainerHtml, '');
  // Because it was in toolbar-actions, which might be empty now:
  content = content.replace(/<div className="toolbar-actions">\s*<\/div>/, '');

  // Add it to the page-header-card
  const headerRegex = /(<div className="page-header-card">\s*<div className="title-area">\s*<h1>.*?<\/h1>\s*<div className="subtitle">.*?<\/div>\s*<\/div>)/;
  content = content.replace(headerRegex, `$1\n\n        ${exportContainerHtml.trim()}`);

  fs.writeFileSync(filepath, content, 'utf8');
  console.log('Successfully updated BarcodeHistory.tsx');
} else {
  console.log('Could not find the export container in BarcodeHistory.tsx');
}
