import re
import os

files = [
    "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/SpiDashboard.tsx",
    "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/PreAoiDashboard.tsx",
    "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/PostAoiDashboard.tsx"
]

for file_path in files:
    with open(file_path, "r") as f:
        content = f.read()
    
    # 1. Add LabelList to Recharts imports if not present
    if "LabelList" not in content:
        content = re.sub(r'ResponsiveContainer, PieChart, Pie, Cell', r'ResponsiveContainer, PieChart, Pie, Cell, LabelList', content)

    # 2. Add topLines state
    if "const [topLines, setTopLines] = useState" not in content:
        content = content.replace(
            "const [topComponents, setTopComponents] = useState<any[]>([]);",
            "const [topComponents, setTopComponents] = useState<any[]>([]);\n  const [topLines, setTopLines] = useState<any[]>([]);"
        )
    
    # 3. Add setTopLines
    if "setTopLines(dataRes.data.topLines);" not in content:
        content = content.replace(
            "setTopComponents(dataRes.data.topComponents);",
            "setTopComponents(dataRes.data.topComponents);\n      setTopLines(dataRes.data.topLines || []);"
        )

    # 4. Add Top 5 Lines chart right below Output Trend chart
    top_lines_chart = """
        <div className="chart-card" style={{ marginTop: '24px' }}>
          <div className="chart-card-title">{t('dashboard.topLines', 'Top 5 Lines by Defects')}</div>
          <div className="chart-card-subtitle">{t('dashboard.topLinesDesc', 'Manufacturing lines with highest defect contribution')}</div>
          <div style={{ height: 300, width: '100%' }}>
            {!loading && topLines.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={topLines} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="line" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={60}>
                    <LabelList dataKey="count" position="top" fill="#64748b" fontSize={12} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>{t('dashboard.noDefectData') || 'No Data'}</div>
            )}
          </div>
        </div>
"""
    # Insert it right before the Recent Inspections table card
    if 'Top 5 Lines by Defects' not in content:
        content = content.replace(
            '<div className="table-card" style={{ padding: \'20px 24px\' }}>',
            top_lines_chart + '\n        <div className="table-card" style={{ padding: \'20px 24px\' }}>',
            1 # Only replace the first occurrence (Recent Inspections)
        )
    
    # 5. Add LabelList to Output Trend Bar
    if '<LabelList dataKey="count" position="top" fill="#64748b" fontSize={12} />' not in content:
        content = re.sub(
            r'<Bar dataKey="count" fill="#6366f1" radius={\[4, 4, 0, 0\]} maxBarSize={60} />',
            r'<Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={60}>\n                    <LabelList dataKey="count" position="top" fill="#64748b" fontSize={12} />\n                  </Bar>',
            content
        )

    # 6. Add label to PieChart
    if 'label={{ fill:' not in content:
        content = re.sub(
            r'stroke="none"',
            r'stroke="none"\n                    label={{ fill: \'#475569\', fontSize: 12, fontWeight: 600 }}\n                    labelLine={false}',
            content
        )

    with open(file_path, "w") as f:
        f.write(content)

