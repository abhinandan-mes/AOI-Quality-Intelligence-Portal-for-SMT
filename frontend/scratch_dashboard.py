import re

dashboard_file = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/Dashboard.tsx"
context_path = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/contexts/LanguageContext.tsx"

with open(dashboard_file, "r") as f:
    d_content = f.read()

d_replacements = {
    '<th>Line</th>': "<th>{t('dashboard.colLine')}</th>",
    '<th>Machine</th>': "<th>{t('dashboard.colMachine')}</th>",
    '<th>Barcode</th>': "<th>{t('dashboard.colBarcode')}</th>",
    '<th>Status</th>': "<th>{t('dashboard.colStatus')}</th>",
    '<th>Timestamp</th>': "<th>{t('dashboard.colTime')}</th>",
    '>PASS<': ">{t('dashboard.statusPass')}<",
    '>FAIL<': ">{t('dashboard.statusFail')}<",
    '>NO DEFECT<': ">{t('dashboard.statusNoDefect')}<",
    'No recent inspections': "{t('dashboard.noRecentInspections')}",
    'Loading...': "{t('dashboard.loading')}",
    'Live': "{t('dashboard.live')}",
    'Total panel barcodes': "{t('dashboard.subtitle1')}",
    'Boards passed inspection': "{t('dashboard.subtitle2')}",
    'Total individual defects': "{t('dashboard.subtitle3')}",
    'In-progress sessions': "{t('dashboard.subtitle4')}"
}

for old, new in d_replacements.items():
    d_content = d_content.replace(old, new)

with open(dashboard_file, "w") as f:
    f.write(d_content)

with open(context_path, "r") as f:
    ctx = f.read()

new_keys = """
  // Dashboard Additions
  'dashboard.colLine': { en: 'Line', zh: '产线' },
  'dashboard.colMachine': { en: 'Machine', zh: '设备' },
  'dashboard.colBarcode': { en: 'Barcode', zh: '条码' },
  'dashboard.colStatus': { en: 'Status', zh: '状态' },
  'dashboard.colTime': { en: 'Timestamp', zh: '时间戳' },
  'dashboard.statusPass': { en: 'PASS', zh: '合格' },
  'dashboard.statusFail': { en: 'FAIL', zh: '不合格' },
  'dashboard.statusNoDefect': { en: 'NO DEFECT', zh: '无缺陷' },
"""

if "'dashboard.colLine'" not in ctx:
    ctx = ctx.replace("// DefectSearch Additions", new_keys + "\n  // DefectSearch Additions")
    with open(context_path, "w") as f:
        f.write(ctx)

print("Updated Dashboard")
