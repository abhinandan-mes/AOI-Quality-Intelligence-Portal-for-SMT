import re

file_path = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/LineManagement.tsx"

with open(file_path, "r") as f:
    content = f.read()

# Fix interface
content = content.replace("  spiWatchPath: string | null;\n}", "  spiWatchPath: string | null;\n  preAoiWatchPath: string | null;\n}")

# Fix modal input addition
new_inputs = """              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>{t('lines.labelSpiPath') || 'SPI Watch Path'}</label>
                <input 
                  type="text" 
                  value={formData.spiWatchPath} 
                  onChange={(e) => setFormData({...formData, spiWatchPath: e.target.value})} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', fontFamily: 'monospace' }}
                  placeholder="e.g., \\\\10.172.9.200\\shared\\SPI"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>{t('lines.preAoiWatchPath') || 'PRE AOI Watch Path'}</label>
                <input 
                  type="text" 
                  value={formData.preAoiWatchPath} 
                  onChange={(e) => setFormData({...formData, preAoiWatchPath: e.target.value})} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', fontFamily: 'monospace' }}
                  placeholder="e.g., \\\\10.172.9.200\\shared\\PRE_AOI"
                />
              </div>"""

content = re.sub(r'<div>\s*<label.*?\{t\(\'lines\.labelSpiPath\'\)\}</label>\s*<input.*?</div>', new_inputs, content, flags=re.DOTALL)

with open(file_path, "w") as f:
    f.write(content)
