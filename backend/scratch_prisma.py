import re

file_path = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/backend/prisma/schema.prisma"
with open(file_path, "r") as f:
    content = f.read()

content = content.replace("aoiWatchPath", "postAoiWatchPath")
content = content.replace("enum MachineType {\n  AOI\n  SPI\n  PRE_AOI\n}", "enum MachineType {\n  POST_AOI\n  SPI\n  PRE_AOI\n}")

with open(file_path, "w") as f:
    f.write(content)
