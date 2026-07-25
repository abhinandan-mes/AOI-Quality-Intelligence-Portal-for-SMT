import re

files = [
    "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/Reports.tsx",
    "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/Analytics.tsx"
]

for file_path in files:
    with open(file_path, "r") as f:
        content = f.read()
    
    # Check if Cell is imported from recharts, if not, add it
    if "Cell" not in content and "recharts" in content:
        content = content.replace("Bar,", "Bar, Cell,")

    # The array of colors for Pareto
    color_array_code = """
  const paretoColors = ['#dc2626', '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#06b6d4', '#3b82f6'];
"""
    
    if "const paretoColors" not in content:
        # Insert after component declaration
        if "export default function Reports() {" in content:
            content = content.replace("export default function Reports() {", "export default function Reports() {" + color_array_code)
        if "export default function Analytics() {" in content:
            content = content.replace("export default function Analytics() {", "export default function Analytics() {" + color_array_code)

    # Replace <Bar ... /> with <Bar ...><Cell ... /></Bar>
    
    # Reports.tsx:
    # <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Occurrences">
    #   <LabelList dataKey="count" position="top" fill="#64748b" fontSize={12} />
    # </Bar>
    
    bar_pattern = re.compile(r'<Bar dataKey="count" fill="#3b82f6" radius=\{\[4, 4, 0, 0\]\} name="Occurrences">\s*<LabelList dataKey="count" position="top" fill="#64748b" fontSize=\{12\} />\s*</Bar>')
    
    new_bar = """<Bar dataKey="count" radius={[4, 4, 0, 0]} name="Occurrences">
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={paretoColors[index % paretoColors.length]} />
                ))}
                <LabelList dataKey="count" position="top" fill="#64748b" fontSize={12} />
              </Bar>"""
              
    content = bar_pattern.sub(new_bar, content)

    # In Analytics.tsx it might be slightly different:
    bar_pattern_analytics = re.compile(r'<Bar dataKey="count" fill="#3b82f6" radius=\{\[4, 4, 0, 0\]\}>\s*<LabelList dataKey="count" position="top" fill="#64748b" fontSize=\{12\} />\s*</Bar>')
    
    new_bar_analytics = """<Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={paretoColors[index % paretoColors.length]} />
                ))}
                <LabelList dataKey="count" position="top" fill="#64748b" fontSize={12} />
              </Bar>"""
    
    content = bar_pattern_analytics.sub(new_bar_analytics, content)

    with open(file_path, "w") as f:
        f.write(content)

