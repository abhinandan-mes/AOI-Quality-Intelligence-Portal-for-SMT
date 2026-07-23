import re

reports_file = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/Reports.tsx"
analytics_file = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/Analytics.tsx"
context_path = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/contexts/LanguageContext.tsx"

with open(reports_file, "r") as f:
    r_content = f.read()

r_replacements = {
    'Top 10 Defects (Pareto)': "{t('reports.topDefects')}",
    'Loading chart...': "{t('reports.loadingChart')}",
    'No defect data available': "{t('reports.noDefectData')}",
    'Production Yield Trend': "{t('reports.yieldTrend')}",
    'No yield data available': "{t('reports.noYieldData')}",
    'Yield Summary Table': "{t('reports.yieldTable')}",
    '<th>Date</th>': "<th>{t('reports.colDate')}</th>",
    '<th>Total Inspections</th>': "<th>{t('reports.colTotal')}</th>",
    '<th>Passed</th>': "<th>{t('reports.colPassed')}</th>",
    '<th>Failed</th>': "<th>{t('reports.colFailed')}</th>",
    '<th>Yield Rate</th>': "<th>{t('reports.colYieldRate')}</th>",
    'No yield data to display': "{t('reports.noYieldTableData')}"
}

for old, new in r_replacements.items():
    r_content = r_content.replace(old, new)

with open(reports_file, "w") as f:
    f.write(r_content)


with open(analytics_file, "r") as f:
    a_content = f.read()

a_replacements = {
    'Overall Pass Rate': "{t('analytics.passRate')}",
    'Defective Units': "{t('analytics.defectiveUnits')}",
    'Average Yield': "{t('analytics.avgYield')}",
    'Highest Defect Type': "{t('analytics.highestDefect')}",
    'Yield Trend Comparison': "{t('analytics.trendComparison')}",
    'Loading charts...': "{t('analytics.loading')}",
    'No analytics data available for selected range.': "{t('analytics.noData')}"
}

for old, new in a_replacements.items():
    a_content = a_content.replace(old, new)

with open(analytics_file, "w") as f:
    f.write(a_content)

with open(context_path, "r") as f:
    ctx = f.read()

new_keys = """
  // Reports Additions
  'reports.topDefects': { en: 'Top 10 Defects (Pareto)', zh: '前10大缺陷 (帕累托图)' },
  'reports.loadingChart': { en: 'Loading chart...', zh: '加载图表中...' },
  'reports.noDefectData': { en: 'No defect data available', zh: '无缺陷数据' },
  'reports.yieldTrend': { en: 'Production Yield Trend', zh: '生产良率趋势' },
  'reports.noYieldData': { en: 'No yield data available', zh: '无良率数据' },
  'reports.yieldTable': { en: 'Yield Summary Table', zh: '良率汇总表' },
  'reports.colDate': { en: 'Date', zh: '日期' },
  'reports.colTotal': { en: 'Total Inspections', zh: '总检验数' },
  'reports.colPassed': { en: 'Passed', zh: '合格' },
  'reports.colFailed': { en: 'Failed', zh: '不合格' },
  'reports.colYieldRate': { en: 'Yield Rate', zh: '良率' },
  'reports.noYieldTableData': { en: 'No yield data to display', zh: '没有要显示的良率数据' },

  // Analytics Additions
  'analytics.passRate': { en: 'Overall Pass Rate', zh: '整体合格率' },
  'analytics.defectiveUnits': { en: 'Defective Units', zh: '缺陷单元' },
  'analytics.avgYield': { en: 'Average Yield', zh: '平均良率' },
  'analytics.highestDefect': { en: 'Highest Defect Type', zh: '最高缺陷类型' },
  'analytics.trendComparison': { en: 'Yield Trend Comparison', zh: '良率趋势对比' },
  'analytics.loading': { en: 'Loading charts...', zh: '加载图表中...' },
  'analytics.noData': { en: 'No analytics data available for selected range.', zh: '所选范围无分析数据。' },
"""

if "'reports.topDefects'" not in ctx:
    ctx = ctx.replace("// Activity Logs Page", new_keys + "\n  // Activity Logs Page")
    with open(context_path, "w") as f:
        f.write(ctx)

print("Updated Reports and Analytics")
