import re

file_path = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/BarcodeHistory.tsx"

with open(file_path, "r") as f:
    content = f.read()

# Add import
if "useLanguage" not in content:
    content = content.replace("import * as XLSX from 'xlsx';", "import * as XLSX from 'xlsx';\nimport { useLanguage } from '../contexts/LanguageContext';")

# Add hook
if "const { t } = useLanguage();" not in content:
    content = content.replace("export default function BarcodeHistory() {", "export default function BarcodeHistory() {\n  const { t } = useLanguage();")

replacements = {
    'Barcode History': "{t('history.title')}",
    'Search, filter, and export historical AOI and SPI inspection records.': "{t('history.desc')}",
    'placeholder="Barcode..."': "placeholder={t('history.searchBarcode')}",
    'placeholder="Line (e.g. Line-401)"': "placeholder={t('history.searchLine')}",
    '<option value="">All Sides</option>': '<option value="">{t(\'history.allSides\')}</option>',
    '<option value="TOP">TOP</option>': '<option value="TOP">{t(\'history.sideTop\')}</option>',
    '<option value="BOTTOM">BOTTOM</option>': '<option value="BOTTOM">{t(\'history.sideBottom\')}</option>',
    'placeholder="Defect Location"': 'placeholder={t(\'history.searchDefectLocation\')}',
    '<option value="">All Statuses</option>': '<option value="">{t(\'history.allStatuses\')}</option>',
    '<span className="date-separator">to</span>': '<span className="date-separator">{t(\'history.to\')}</span>',
    'Search\n          </button>': '{t(\'history.search\')}\n          </button>',
    'Export Data': '{t(\'history.exportData\')}',
    'Export as CSV': '{t(\'history.exportCsv\')}',
    'Export as Excel': '{t(\'history.exportExcel\')}',
    'Export as Word': '{t(\'history.exportWord\')}',
    'Export as PDF': '{t(\'history.exportPdf\')}',
    '<th>Barcode</th>': '<th>{t(\'history.colBarcode\')}</th>',
    '<th>Line</th>': '<th>{t(\'history.colLine\')}</th>',
    'Machine {': '{t(\'history.colMachine\')} {',
    'Side {': '{t(\'history.colSide\')} {',
    '<th>Status</th>': '<th>{t(\'history.colStatus\')}</th>',
    '<th>Block</th>': '<th>{t(\'history.colBlock\')}</th>',
    '<th>Defect Location</th>': '<th>{t(\'history.colDefectLocation\')}</th>',
    '<th>Phenomenon</th>': '<th>{t(\'history.colPhenomenon\')}</th>',
    '<th>Timestamp</th>': '<th>{t(\'history.colTimestamp\')}</th>',
    '<h4>No Inspection Records Found</h4>': '<h4>{t(\'history.noRecords\')}</h4>',
    "<p>Try adjusting your search filters or dates to find what you're looking for.</p>": "<p>{t('history.noRecordsDesc')}</p>",
    "Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, sortedData.length)} of {sortedData.length} entries": "{t('history.showing')} {page * rowsPerPage + 1} {t('history.to')} {Math.min((page + 1) * rowsPerPage, sortedData.length)} {t('history.entries').replace('条记录', '')} {sortedData.length} {t('history.entries')}",
    ">Previous<": ">{t('history.previous')}<",
    ">Next<": ">{t('history.next')}<"
}

for old, new in replacements.items():
    content = content.replace(old, new)

# Special fix for the Showing text because the original was mixed with variables:
# "Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, sortedData.length)} of {sortedData.length} entries"

with open(file_path, "w") as f:
    f.write(content)

print("Updated BarcodeHistory.tsx")
