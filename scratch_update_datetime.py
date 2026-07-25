import re

# 1. Update inspectionController.ts to respect time
file_ctrl = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/backend/src/controllers/inspectionController.ts"
with open(file_ctrl, "r") as f:
    content = f.read()

old_end = """      if (endDate) {
        const end = new Date(String(endDate));
        end.setHours(23, 59, 59, 999);
        whereClause.inspectionTime.lte = end;
      }"""
new_end = """      if (endDate) {
        const end = new Date(String(endDate));
        if (!String(endDate).includes('T')) {
          end.setHours(23, 59, 59, 999);
        }
        whereClause.inspectionTime.lte = end;
      }"""
content = content.replace(old_end, new_end)
with open(file_ctrl, "w") as f:
    f.write(content)

# 2. Update BarcodeHistory.tsx to use datetime-local
file_hist = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/BarcodeHistory.tsx"
with open(file_hist, "r") as f:
    content = f.read()

content = content.replace('type="date"', 'type="datetime-local"')
with open(file_hist, "w") as f:
    f.write(content)

# 3. Update Analytics.tsx and Reports.tsx defaults
files = [
    "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/Analytics.tsx",
    "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/Reports.tsx"
]

for file_path in files:
    with open(file_path, "r") as f:
        content = f.read()
    
    content = content.replace("const [startDate, setStartDate] = useState('');", "const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);")
    content = content.replace("const [endDate, setEndDate] = useState('');", "const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);")
    
    with open(file_path, "w") as f:
        f.write(content)

