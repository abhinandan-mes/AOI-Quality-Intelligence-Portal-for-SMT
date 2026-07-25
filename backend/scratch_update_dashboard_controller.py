import re

file_path = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/backend/src/controllers/dashboardController.ts"
with open(file_path, "r") as f:
    content = f.read()

# Replace the defects findMany select block
old_find_many = """    const defects = await prisma.defect.findMany({
      where: { inspection: baseWhere },
      select: { componentName: true, defectType: true }
    });"""

new_find_many = """    const defects = await prisma.defect.findMany({
      where: { inspection: baseWhere },
      select: { 
        componentName: true, 
        defectType: true,
        inspection: { select: { machine: { select: { line: { select: { name: true } } } } } }
      }
    });"""

content = content.replace(old_find_many, new_find_many)

# Replace the compCount logic
old_comp = """    const compCount: Record<string, { type: string, count: number }> = {};
    defects.forEach(d => {
      const comp = d.componentName || 'Unknown';
      if (!compCount[comp]) compCount[comp] = { type: d.defectType, count: 0 };
      compCount[comp].count++;
    });"""

new_comp = """    const compCount: Record<string, { type: string, count: number }> = {};
    const lineCount: Record<string, number> = {};
    defects.forEach(d => {
      const comp = d.componentName || 'Unknown';
      if (!compCount[comp]) compCount[comp] = { type: d.defectType, count: 0 };
      compCount[comp].count++;
      
      const lineName = d.inspection?.machine?.line?.name || 'Unknown';
      lineCount[lineName] = (lineCount[lineName] || 0) + 1;
    });
    
    const topLines = Object.keys(lineCount)
      .map(line => ({ line, count: lineCount[line] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);"""

content = content.replace(old_comp, new_comp)

# Return topLines in json
old_json = """    res.json({
      trendData,
      distData,
      topComponents,
      recentInspections: recentFormatted
    });"""

new_json = """    res.json({
      trendData,
      distData,
      topComponents,
      topLines,
      recentInspections: recentFormatted
    });"""

content = content.replace(old_json, new_json)

with open(file_path, "w") as f:
    f.write(content)

