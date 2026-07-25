import re

with open("/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/backend/src/controllers/inspectionController.ts", "r") as f:
    content = f.read()

# Change how machineType is handled to support multiple comma-separated values
old_code = """    if (machineType) {
      whereClause.machine = { type: String(machineType) };
    }"""

new_code = """    if (machineType) {
      const types = String(machineType).split(',');
      if (types.length === 1) {
        whereClause.machine = { ...whereClause.machine, type: types[0] };
      } else {
        whereClause.machine = { ...whereClause.machine, type: { in: types } };
      }
    }"""

content = content.replace(old_code, new_code)

with open("/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/backend/src/controllers/inspectionController.ts", "w") as f:
    f.write(content)

