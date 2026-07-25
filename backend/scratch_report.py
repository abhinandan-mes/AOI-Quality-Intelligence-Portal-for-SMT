import re

file_path = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/backend/src/controllers/reportController.ts"
with open(file_path, "r") as f:
    content = f.read()

# Update getDefectPareto
old_pareto = """    const { startDate, endDate, lineName } = req.query;

    const whereClause: any = {};
    if (startDate || endDate || lineName) {
      whereClause.inspection = { machine: {} };"""
new_pareto = """    const { startDate, endDate, lineName, machineType } = req.query;

    const whereClause: any = {};
    if (startDate || endDate || lineName || machineType) {
      whereClause.inspection = { machine: {} };"""
content = content.replace(old_pareto, new_pareto)

old_line_pareto = """      if (lineName) {
        whereClause.inspection.machine.line = { name: String(lineName) };
      }
    }"""
new_line_pareto = """      if (lineName) {
        whereClause.inspection.machine.line = { name: String(lineName) };
      }
      if (machineType) {
        whereClause.inspection.machine.type = String(machineType);
      }
    }"""
content = content.replace(old_line_pareto, new_line_pareto)

# Update getYieldTrend
old_yield = """    const { startDate, endDate, lineName } = req.query;"""
new_yield = """    const { startDate, endDate, lineName, machineType } = req.query;"""
content = content.replace(old_yield, new_yield)

old_yield_where = """    if (lineName) {
      whereClause.machine = {
        line: { name: String(lineName) },
        type: { not: 'PRE_AOI' } // Exclude PRE_AOI machines from FPY
      };
    } else {
      whereClause.machine = {
        type: { not: 'PRE_AOI' } // Exclude PRE_AOI machines from FPY
      };
    }"""
new_yield_where = """    whereClause.machine = {};
    if (lineName) {
      whereClause.machine.line = { name: String(lineName) };
    }
    if (machineType) {
      whereClause.machine.type = String(machineType);
    } else {
      whereClause.machine.type = { not: 'PRE_AOI' };
    }"""
content = content.replace(old_yield_where, new_yield_where)

with open(file_path, "w") as f:
    f.write(content)
