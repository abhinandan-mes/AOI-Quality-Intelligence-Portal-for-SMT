import re

files = [
    "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/SpiDashboard.tsx",
    "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/PreAoiDashboard.tsx",
    "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/PostAoiDashboard.tsx"
]

for file_path in files:
    with open(file_path, "r") as f:
        content = f.read()
    
    # Fix the literally escaped backslashes
    content = content.replace("label={{ fill: \\'#475569\\', fontSize: 12, fontWeight: 600 }}", "label={{ fill: '#475569', fontSize: 12, fontWeight: 600 }}")
    
    with open(file_path, "w") as f:
        f.write(content)

