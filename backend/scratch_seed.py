import re

file_path = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/backend/seed_dummy.js"
with open(file_path, "r") as f:
    content = f.read()

content = content.replace("aoiWatchPath", "postAoiWatchPath")
content = content.replace("'AOI'", "'POST_AOI'")
content = content.replace("AOI-01", "POST-AOI-01")

with open(file_path, "w") as f:
    f.write(content)
