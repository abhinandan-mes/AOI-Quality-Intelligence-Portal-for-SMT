import re

search_file = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/DefectSearch.tsx"
history_file = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/BarcodeHistory.tsx"
context_path = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/contexts/LanguageContext.tsx"

with open(search_file, "r") as f:
    s_content = f.read()

s_replacements = {
    'Search by Defect Component...': "{t('search.placeholder')}",
    'Search Defects': "{t('search.button')}",
    'Search Results': "{t('search.results')}",
    '<th>Barcode</th>': "<th>{t('search.colBarcode')}</th>",
    '<th>Line</th>': "<th>{t('search.colLine')}</th>",
    '<th>Machine</th>': "<th>{t('search.colMachine')}</th>",
    '<th>Component</th>': "<th>{t('search.colComponent')}</th>",
    '<th>Defect Type</th>': "<th>{t('search.colDefectType')}</th>",
    '<th>Time</th>': "<th>{t('search.colTime')}</th>",
    'Searching...': "{t('search.searching')}",
    'No defects found matching your criteria.': "{t('search.noResults')}",
    'Enter a defect name or component above to start searching.': "{t('search.prompt')}",
    'Export Results': "{t('search.export')}"
}
for old, new in s_replacements.items():
    s_content = s_content.replace(old, new)
with open(search_file, "w") as f:
    f.write(s_content)


with open(history_file, "r") as f:
    h_content = f.read()

h_replacements = {
    'Search by Barcode...': "{t('history.searchPlaceholder')}",
    'Search': "{t('history.searchButton')}",
    'Scan History': "{t('history.scanHistory')}",
    '<th>Barcode</th>': "<th>{t('history.colBarcode')}</th>",
    '<th>Line</th>': "<th>{t('history.colLine')}</th>",
    '<th>Machine</th>': "<th>{t('history.colMachine')}</th>",
    '<th>Status</th>': "<th>{t('history.colStatus')}</th>",
    '<th>Defects</th>': "<th>{t('history.colDefects')}</th>",
    '<th>Time</th>': "<th>{t('history.colTime')}</th>",
    '<th>Actions</th>': "<th>{t('history.colActions')}</th>",
    'Loading history...': "{t('history.loading')}",
    'No history found for this range.': "{t('history.noResults')}",
    '>View<': ">{t('history.view')}<",
    '>Export CSV<': ">{t('history.export')}<"
}
for old, new in h_replacements.items():
    h_content = h_content.replace(old, new)
with open(history_file, "w") as f:
    f.write(h_content)

with open(context_path, "r") as f:
    ctx = f.read()

new_keys = """
  // DefectSearch Additions
  'search.placeholder': { en: 'Search by Defect Component...', zh: '按缺陷组件搜索...' },
  'search.button': { en: 'Search Defects', zh: '搜索缺陷' },
  'search.results': { en: 'Search Results', zh: '搜索结果' },
  'search.colBarcode': { en: 'Barcode', zh: '条码' },
  'search.colLine': { en: 'Line', zh: '产线' },
  'search.colMachine': { en: 'Machine', zh: '设备' },
  'search.colComponent': { en: 'Component', zh: '组件' },
  'search.colDefectType': { en: 'Defect Type', zh: '缺陷类型' },
  'search.colTime': { en: 'Time', zh: '时间' },
  'search.searching': { en: 'Searching...', zh: '搜索中...' },
  'search.noResults': { en: 'No defects found matching your criteria.', zh: '未找到符合您条件的缺陷。' },
  'search.prompt': { en: 'Enter a defect name or component above to start searching.', zh: '在上方输入缺陷名称或组件以开始搜索。' },
  'search.export': { en: 'Export Results', zh: '导出结果' },

  // BarcodeHistory Additions
  'history.searchPlaceholder': { en: 'Search by Barcode...', zh: '按条码搜索...' },
  'history.searchButton': { en: 'Search', zh: '搜索' },
  'history.scanHistory': { en: 'Scan History', zh: '扫描历史' },
  'history.colBarcode': { en: 'Barcode', zh: '条码' },
  'history.colLine': { en: 'Line', zh: '产线' },
  'history.colMachine': { en: 'Machine', zh: '设备' },
  'history.colStatus': { en: 'Status', zh: '状态' },
  'history.colDefects': { en: 'Defects', zh: '缺陷' },
  'history.colTime': { en: 'Time', zh: '时间' },
  'history.colActions': { en: 'Actions', zh: '操作' },
  'history.loading': { en: 'Loading history...', zh: '加载历史记录中...' },
  'history.noResults': { en: 'No history found for this range.', zh: '此范围内未找到历史记录。' },
  'history.view': { en: 'View', zh: '查看' },
  'history.export': { en: 'Export CSV', zh: '导出CSV' },
"""

if "'search.placeholder'" not in ctx:
    ctx = ctx.replace("// Activity Logs Page", new_keys + "\n  // Activity Logs Page")
    with open(context_path, "w") as f:
        f.write(ctx)

print("Updated DefectSearch and BarcodeHistory")
