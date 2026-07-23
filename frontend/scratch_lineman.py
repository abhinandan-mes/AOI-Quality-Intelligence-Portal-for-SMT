import re

file_path = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/LineManagement.tsx"
with open(file_path, "r") as f:
    content = f.read()

content = content.replace("aoiWatchPath", "postAoiWatchPath")
content = content.replace("aoiConfigs", "postAoiConfigs")
content = content.replace("aoiPaths", "postAoiPaths")

with open(file_path, "w") as f:
    f.write(content)
