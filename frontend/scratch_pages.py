import re
import os

pages = [
    "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/BarcodeHistory.tsx",
    "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/Reports.tsx"
]

for file_path in pages:
    if os.path.exists(file_path):
        with open(file_path, "r") as f:
            content = f.read()
        
        # Replace explicit "AOI" enum references
        content = content.replace("=== 'AOI'", "=== 'POST_AOI'")
        content = content.replace("value=\"AOI\"", "value=\"POST_AOI\"")
        content = content.replace("type === 'AOI'", "type === 'POST_AOI'")
        content = content.replace("'AOI'", "'POST_AOI'") # careful with this
        content = content.replace(">AOI<", ">Post AOI<")
        
        with open(file_path, "w") as f:
            f.write(content)

