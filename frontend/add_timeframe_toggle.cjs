const fs = require('fs');

function updateFile(file) {
  let content = fs.readFileSync(file, 'utf8');

  // 1. Add import if missing
  if (!content.includes('TimeframeToggle')) {
    content = content.replace(
      /import { useLanguage } from '\.\.\/contexts\/LanguageContext';/,
      `import { useLanguage } from '../contexts/LanguageContext';\nimport TimeframeToggle from '../components/TimeframeToggle';`
    );
  }

  // 2. Inject toggle into action-area (or the div holding the date pickers)
  if (file.includes('Analytics.tsx')) {
    content = content.replace(
      /<div style={{ display: 'flex', gap: '12px', background: 'white', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>/,
      `<div className="action-area" style={{ display: 'flex', gap: '12px', background: 'white', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', alignItems: 'center' }}>
          <TimeframeToggle 
            currentStart={startDate} 
            currentEnd={endDate} 
            onDatesChange={(start, end) => { setStartDate(start); setEndDate(end); }} 
          />
          <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0', margin: '0 4px' }}></div>`
    );
  } else if (file.includes('Reports.tsx')) {
    content = content.replace(
      /<div className="filter-group">\s*<label>{t\('reports\.startDate'\)}<\/label>\s*<input\s*type="date"\s*value=\{startDate\}\s*onChange=\{\(e\) => setStartDate\(e\.target\.value\)\}\s*\/>\s*<\/div>/,
      `<div className="filter-group" style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: '4px' }}>
              <TimeframeToggle 
                currentStart={startDate} 
                currentEnd={endDate} 
                onDatesChange={(start, end) => { setStartDate(start); setEndDate(end); }} 
              />
            </div>
            <div className="filter-group">
              <label>{t('reports.startDate')}</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>`
    );
  } else if (file.includes('BarcodeHistory.tsx')) {
    content = content.replace(
      /<div className="filter-group">\s*<input\s*type="date"\s*value=\{startDate\}/,
      `<div className="filter-group">
            <TimeframeToggle 
              currentStart={startDate} 
              currentEnd={endDate} 
              onDatesChange={(start, end) => { setStartDate(start); setEndDate(end); }} 
            />
          </div>
          <div className="filter-divider"></div>
          <div className="filter-group">
            <input type="date" value={startDate}`
    );
  }

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated ${file}`);
}

updateFile('src/pages/Analytics.tsx');
updateFile('src/pages/Reports.tsx');
updateFile('src/pages/BarcodeHistory.tsx');
