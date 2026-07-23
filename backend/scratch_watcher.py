import re

file_path = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/backend/src/services/fileWatcher.ts"
with open(file_path, "r") as f:
    content = f.read()

# Replace all AOI types and watch paths to POST_AOI and postAoiWatchPath EXCEPT PRE_AOI
content = content.replace("line.aoiWatchPath", "line.postAoiWatchPath")
content = content.replace("'AOI' | 'SPI' | 'PRE_AOI'", "'POST_AOI' | 'SPI' | 'PRE_AOI'")
content = content.replace("type === 'AOI'", "type === 'POST_AOI'")
content = content.replace("'AOI', line.name", "'POST_AOI', line.name")

with open(file_path, "w") as f:
    f.write(content)
