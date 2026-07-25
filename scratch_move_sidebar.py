import re

# 1. Update translations
lang_file = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/contexts/LanguageContext.tsx"
with open(lang_file, "r") as f:
    lang_content = f.read()

if "'dashboard.topLines'" not in lang_content:
    new_trans = """  'dashboard.topLines': { en: 'Top 5 Lines by Defects', zh: '缺陷排名前5的产线' },
  'dashboard.topLinesDesc': { en: 'Manufacturing lines with highest defect contribution', zh: '缺陷率最高的生产线' },
"""
    lang_content = lang_content.replace("// Dashboard Additions", "// Dashboard Additions\n" + new_trans)
    with open(lang_file, "w") as f:
        f.write(lang_content)

# 2. Update the 3 dashboard pages
files = [
    "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/SpiDashboard.tsx",
    "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/PreAoiDashboard.tsx",
    "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/PostAoiDashboard.tsx"
]

for file_path in files:
    with open(file_path, "r") as f:
        content = f.read()
    
    # Extract the Top 5 Lines block
    top_lines_regex = re.compile(r'(<div className="chart-card" style={{ marginTop: \'24px\' }}>\s*<div className="chart-card-title">\{t\(\'dashboard\.topLines\'\) \|\| \'Top 5 Lines by Defects\'\}</div>.*?</div>\s*</div>)', re.DOTALL)
    match = top_lines_regex.search(content)
    
    if match:
        top_lines_block = match.group(1)
        
        # Adjust its style for the sidebar
        sidebar_block = top_lines_block.replace("style={{ marginTop: '24px' }}", "style={{ marginTop: '24px', paddingBottom: '24px' }}")
        sidebar_block = sidebar_block.replace("height: 300", "height: 260")
        
        # Remove it from the main area
        content = content.replace(top_lines_block, "")
        
        # Inject it into the sidebar right under Top Defective Components table
        # We look for the closing div of the Top Defective Components table card.
        # It ends right before `</div>\n    </div>\n  );`
        
        # Wait, the sidebar ends with:
        #           </table>
        #         </div>
        #       </div>
        #     </div>
        #   );
        # Let's insert it after `</table>\n        </div>` inside `dashboard-sidebar`
        
        sidebar_injection_target = "          </table>\n        </div>"
        if sidebar_injection_target in content:
            content = content.replace(
                sidebar_injection_target,
                sidebar_injection_target + "\n\n        " + sidebar_block
            )
        
        with open(file_path, "w") as f:
            f.write(content)

