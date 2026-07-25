import re

files = [
    "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/SpiDashboard.tsx",
    "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/PreAoiDashboard.tsx",
    "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/PostAoiDashboard.tsx"
]

for file_path in files:
    with open(file_path, "r") as f:
        content = f.read()
    
    # Fix the `t` function calls
    content = content.replace("t('dashboard.topLines', 'Top 5 Lines by Defects')", "t('dashboard.topLines') || 'Top 5 Lines by Defects'")
    content = content.replace("t('dashboard.topLinesDesc', 'Manufacturing lines with highest defect contribution')", "t('dashboard.topLinesDesc') || 'Manufacturing lines with highest defect contribution'")
    
    with open(file_path, "w") as f:
        f.write(content)

