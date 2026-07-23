import re

file_path = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/backend/src/controllers/lineController.ts"
with open(file_path, "r") as f:
    content = f.read()

content = content.replace("aoiWatchPath", "postAoiWatchPath")

with open(file_path, "w") as f:
    f.write(content)
