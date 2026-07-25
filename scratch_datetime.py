import re

files = [
    "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/Reports.tsx",
    "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/Analytics.tsx"
]

for file_path in files:
    with open(file_path, "r") as f:
        content = f.read()

    # Change initial state to datetime format
    content = content.replace(
        "useState(new Date().toISOString().split('T')[0]);",
        "useState(new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16));"
    )

    if "Analytics.tsx" in file_path:
        # Analytics has simple inputs, let's wrap them in styled containers like BarcodeHistory and Reports
        
        # Replace the old raw inputs with styled ones
        old_inputs = """          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '4px' }}/>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '4px' }}/>"""
        
        new_inputs = """          <div className="filter-group date-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '2px 8px' }}>
              <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', color: '#475569', fontSize: '0.85rem' }}/>
            </div>
            <span className="date-separator" style={{ margin: '0', fontSize: '14px' }}>{t('history.to') || 'to'}</span>
            <div style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '2px 8px' }}>
              <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', color: '#475569', fontSize: '0.85rem' }}/>
            </div>
          </div>"""
        content = content.replace(old_inputs, new_inputs)

    with open(file_path, "w") as f:
        f.write(content)

