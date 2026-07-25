import re

file_path = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/Dashboard.tsx"
with open(file_path, "r") as f:
    content = f.read()

card_to_remove = """          <div className="summary-card purple">
            <div className="summary-card-title">Components Tested</div>
            <div className="summary-card-value">{summary.totalComponentsTested.toLocaleString()}</div>
            <div className="summary-card-subtitle">Total tested parts</div>
          </div>"""

content = content.replace(card_to_remove, "")

with open(file_path, "w") as f:
    f.write(content)

file_path2 = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/Dashboard.css"
with open(file_path2, "r") as f:
    content2 = f.read()

content2 = content2.replace("grid-template-columns: repeat(5, 1fr);", "grid-template-columns: repeat(4, 1fr);")

with open(file_path2, "w") as f:
    f.write(content2)
