const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');

const files = [
  'Dashboard.tsx',
  'LineManagement.tsx',
  'BarcodeHistory.tsx',
  'DefectSearch.tsx',
  'Reports.tsx',
  'Analytics.tsx',
  'UserManagement.tsx',
  'ActivityLogs.tsx'
];

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  if (file === 'Dashboard.tsx') {
    content = content.replace(
      /<div className="dashboard-header" style={{[^}]*}}>\s*<div>\s*<h1[^>]*>\{t\('menu\.dashboard'\)\}<\/h1>\s*<div className="subtitle">\s*([\s\S]*?)\s*<\/div>\s*<\/div>/,
      `<div className="page-header-card">
          <div className="title-area">
            <h1>{t('menu.dashboard')}</h1>
            <div className="subtitle">
              $1
            </div>
          </div>`
    );
  } else {
    // Replace the opening tag
    content = content.replace(
      /<div className="dashboard-header"[^>]*>/,
      '<div className="page-header-card">'
    );

    // Replace the title wrapper div with title-area
    content = content.replace(
      /<div>\s*<h1 className="premium-heading-gradient"[^>]*>(.*?)<\/h1>\s*<div className="subtitle">(.*?)<\/div>\s*<\/div>/s,
      `<div className="title-area">
          <h1>$1</h1>
          <div className="subtitle">$2</div>
        </div>`
    );

    // Some files might not have subtitle but a simple h1.
    if (!content.includes('title-area')) {
      content = content.replace(
        /<div>\s*<h1 className="premium-heading-gradient"[^>]*>(.*?)<\/h1>\s*<\/div>/s,
        `<div className="title-area">
            <h1>$1</h1>
          </div>`
      );
    }
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Updated ${file}`);
}
