import re

file_path = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/LineManagement.tsx"

with open(file_path, "r") as f:
    content = f.read()

# Add PRE AOI column header
content = content.replace("                  <th>{t('lines.spiWatchPath')}</th>", "                  <th>{t('lines.spiWatchPath')}</th>\n                  <th>{t('lines.preAoiWatchPath')}</th>")

# Add PRE AOI column data
content = content.replace("                    <td>\n                      {line.spiWatchPath ? (", "                    <td>\n                      {line.spiWatchPath ? (\n                        <code style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', color: '#475569' }}>\n                          {line.spiWatchPath}\n                        </code>\n                      ) : (\n                        <span className=\"text-muted\">{t('lines.notConfigured')}</span>\n                      )}\n                    </td>\n                    <td>\n                      {line.preAoiWatchPath ? (")
content = content.replace("line.spiWatchPath}", "line.spiWatchPath}")

# Add preAoiWatchPath to the form state
content = content.replace("aoiWatchPath: '', spiWatchPath: ''", "aoiWatchPath: '', spiWatchPath: '', preAoiWatchPath: ''")
content = content.replace("aoiWatchPath: line.aoiWatchPath || '', spiWatchPath: line.spiWatchPath || ''", "aoiWatchPath: line.aoiWatchPath || '', spiWatchPath: line.spiWatchPath || '', preAoiWatchPath: line.preAoiWatchPath || ''")

# Add preAoiWatchPath to the input modal
new_input = """              <div className="form-group">
                <label>{t('lines.spiWatchPath')}</label>
                <input type="text" className="vivo-input" value={formData.spiWatchPath} onChange={(e) => setFormData({ ...formData, spiWatchPath: e.target.value })} placeholder={t('lines.spiWatchPathPlaceholder') || "e.g., \\\\\\\\192.168.1.100\\\\SPI_Output"} />
              </div>

              <div className="form-group">
                <label>{t('lines.preAoiWatchPath')}</label>
                <input type="text" className="vivo-input" value={formData.preAoiWatchPath} onChange={(e) => setFormData({ ...formData, preAoiWatchPath: e.target.value })} placeholder={t('lines.preAoiWatchPathPlaceholder') || "e.g., \\\\\\\\192.168.1.100\\\\PRE_AOI_Output"} />
              </div>"""

content = re.sub(r'<div className="form-group">\s*<label>\{t\(\'lines\.spiWatchPath\'\)\}</label>\s*<input.*?</div>', new_input, content, flags=re.DOTALL)

with open(file_path, "w") as f:
    f.write(content)

print("LineManagement.tsx updated")
