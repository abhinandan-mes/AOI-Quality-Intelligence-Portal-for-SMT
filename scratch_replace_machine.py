import re

with open("/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/BarcodeHistory.tsx", "r") as f:
    content = f.read()

# State
content = content.replace(
    "const [machineName, setMachineName] = useState('');",
    "const [machineTypes, setMachineTypes] = useState<string[]>([]);\n  const [showMachineDropdown, setShowMachineDropdown] = useState(false);"
)

# Params
content = content.replace(
    "if (machineName) params.append('machineName', machineName);",
    "if (machineTypes.length > 0) params.append('machineType', machineTypes.join(','));"
)

# UI Replacement
old_filter = """          <div className="filter-group">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="filter-icon"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>
            <input 
              type="text" 
              placeholder={'Machine (e.g. SPI-1)'}
              value={machineName} 
              onChange={(e) => setMachineName(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{ width: '130px' }}
            />
          </div>"""

new_filter = """          <div className="filter-group" style={{ position: 'relative' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="filter-icon"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>
            <div 
              onClick={() => setShowMachineDropdown(!showMachineDropdown)}
              style={{ width: '150px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: machineTypes.length > 0 ? '#0f172a' : '#94a3b8', fontSize: '14px', userSelect: 'none' }}
            >
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {machineTypes.length === 0 ? 'All Machines' : machineTypes.map(t => t.replace('_', ' ')).join(', ')}
              </span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
            {showMachineDropdown && (
              <div 
                style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', zIndex: 50, minWidth: '180px', padding: '8px 0', overflow: 'hidden' }}
                onMouseLeave={() => setShowMachineDropdown(false)}
              >
                <label style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', cursor: 'pointer', transition: 'background 0.2s' }} className="hover-bg-slate">
                  <input type="checkbox" checked={machineTypes.length === 0} onChange={() => { setMachineTypes([]); setShowMachineDropdown(false); handleSearch(); }} style={{ marginRight: '8px' }} />
                  <span style={{ fontSize: '14px', color: '#334155' }}>All Machines</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', cursor: 'pointer', transition: 'background 0.2s' }} className="hover-bg-slate">
                  <input type="checkbox" checked={machineTypes.includes('SPI')} onChange={(e) => {
                    if (e.target.checked) setMachineTypes([...machineTypes, 'SPI']);
                    else setMachineTypes(machineTypes.filter(t => t !== 'SPI'));
                  }} style={{ marginRight: '8px' }} />
                  <span style={{ fontSize: '14px', color: '#334155' }}>SPI</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', cursor: 'pointer', transition: 'background 0.2s' }} className="hover-bg-slate">
                  <input type="checkbox" checked={machineTypes.includes('PRE_AOI')} onChange={(e) => {
                    if (e.target.checked) setMachineTypes([...machineTypes, 'PRE_AOI']);
                    else setMachineTypes(machineTypes.filter(t => t !== 'PRE_AOI'));
                  }} style={{ marginRight: '8px' }} />
                  <span style={{ fontSize: '14px', color: '#334155' }}>PRE AOI</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', cursor: 'pointer', transition: 'background 0.2s' }} className="hover-bg-slate">
                  <input type="checkbox" checked={machineTypes.includes('POST_AOI')} onChange={(e) => {
                    if (e.target.checked) setMachineTypes([...machineTypes, 'POST_AOI']);
                    else setMachineTypes(machineTypes.filter(t => t !== 'POST_AOI'));
                  }} style={{ marginRight: '8px' }} />
                  <span style={{ fontSize: '14px', color: '#334155' }}>POST AOI</span>
                </label>
              </div>
            )}
          </div>"""

content = content.replace(old_filter, new_filter)

with open("/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/BarcodeHistory.tsx", "w") as f:
    f.write(content)

