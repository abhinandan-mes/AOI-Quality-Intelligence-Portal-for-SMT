import re

files = [
    "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/SpiDashboard.tsx",
    "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/PreAoiDashboard.tsx",
    "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/PostAoiDashboard.tsx"
]

for file_path in files:
    with open(file_path, "r") as f:
        content = f.read()
    
    # We want to remove the block that appears BEFORE `<div className="dashboard-sidebar">`
    # The block is a `<div className="chart-card" style={{ marginTop: '24px', paddingBottom: '24px' }}>` 
    # and ends with `</div>\n        </div>\n      </div>\n\n      <div className="dashboard-sidebar">`
    
    # Let's just find the first occurrence of the chart block and delete it.
    # The first occurrence is right after the Recent Inspections table, and right before the sidebar.
    
    block_regex = re.compile(r'\n\n\s*<div className="chart-card" style={{ marginTop: \'24px\', paddingBottom: \'24px\' }}>\s*<div className="chart-card-title">\{t\(\'dashboard\.topLines\'\) \|\| \'Top 5 Lines by Defects\'\}</div>.*?</div>\s*</div>', re.DOTALL)
    
    # Find all matches
    matches = list(block_regex.finditer(content))
    if len(matches) > 1:
        # Replace only the first occurrence (which is the one in the main section)
        first_match = matches[0]
        content = content[:first_match.start()] + content[first_match.end():]
        
    with open(file_path, "w") as f:
        f.write(content)

