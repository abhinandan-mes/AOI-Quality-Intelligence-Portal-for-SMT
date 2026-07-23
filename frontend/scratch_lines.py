import re

file_path = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/LineManagement.tsx"
context_path = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/contexts/LanguageContext.tsx"

with open(file_path, "r") as f:
    content = f.read()

replacements = {
    'AOI Configurations': "{t('lines.aoiConfigs')}",
    'Lines with AOI watch paths': "{t('lines.aoiPaths')}",
    'SPI Configurations': "{t('lines.spiConfigs')}",
    'Lines with SPI watch paths': "{t('lines.spiPaths')}",
    'Configured Production Lines': "{t('lines.configuredLines')}",
    '<th>Line Name</th>': "<th>{t('lines.colName')}</th>",
    '<th>Description</th>': "<th>{t('lines.colDesc')}</th>",
    '<th>AOI Watch Path</th>': "<th>{t('lines.colAoiPath')}</th>",
    '<th>SPI Watch Path</th>': "<th>{t('lines.colSpiPath')}</th>",
    '<th>Status</th>': "<th>{t('lines.colStatus')}</th>",
    '<th>Actions</th>': "<th>{t('lines.colActions')}</th>",
    'Loading lines...': "{t('lines.loading')}",
    'Not Configured': "{t('lines.notConfigured')}",
    '>Active<': ">{t('lines.active')}<",
    '>INACTIVE<': ">{t('lines.inactive')}<",
    '>Edit<': ">{t('lines.edit')}<",
    '>Delete<': ">{t('lines.delete')}<",
    'No lines configured yet.': "{t('lines.noLines')}",
    'Create First Line': "{t('lines.createFirst')}",
    "editingLine ? 'Edit Production Line' : 'Add Production Line'": "editingLine ? t('lines.editLine') : t('lines.addLine')",
    'Define the physical line name and the network directories where AOI/SPI machines drop their XML/TXT files.': "{t('lines.modalDesc')}",
    'Line Name</label>': "{t('lines.labelName')}</label>",
    'Description</label>': "{t('lines.labelDesc')}</label>",
    'AOI Watch Path</label>': "{t('lines.labelAoiPath')}</label>",
    'SPI Watch Path</label>': "{t('lines.labelSpiPath')}</label>",
    'Cancel': "{t('lines.cancel')}",
    'Save Configuration': "{t('lines.save')}",
    '>Add New Line<': ">{t('lines.addNewLine')}<"
}

for old, new in replacements.items():
    content = content.replace(old, new)

with open(file_path, "w") as f:
    f.write(content)

with open(context_path, "r") as f:
    ctx = f.read()

new_keys = """
  // Line Management Additions
  'lines.aoiConfigs': { en: 'AOI Configurations', zh: 'AOI 配置' },
  'lines.aoiPaths': { en: 'Lines with AOI watch paths', zh: '带有 AOI 监控路径的产线' },
  'lines.spiConfigs': { en: 'SPI Configurations', zh: 'SPI 配置' },
  'lines.spiPaths': { en: 'Lines with SPI watch paths', zh: '带有 SPI 监控路径的产线' },
  'lines.configuredLines': { en: 'Configured Production Lines', zh: '已配置的生产线' },
  'lines.colName': { en: 'Line Name', zh: '产线名称' },
  'lines.colDesc': { en: 'Description', zh: '描述' },
  'lines.colAoiPath': { en: 'AOI Watch Path', zh: 'AOI 监控路径' },
  'lines.colSpiPath': { en: 'SPI Watch Path', zh: 'SPI 监控路径' },
  'lines.colStatus': { en: 'Status', zh: '状态' },
  'lines.colActions': { en: 'Actions', zh: '操作' },
  'lines.loading': { en: 'Loading lines...', zh: '加载产线...' },
  'lines.notConfigured': { en: 'Not Configured', zh: '未配置' },
  'lines.active': { en: 'Active', zh: '活跃' },
  'lines.inactive': { en: 'INACTIVE', zh: '未活跃' },
  'lines.edit': { en: 'Edit', zh: '编辑' },
  'lines.delete': { en: 'Delete', zh: '删除' },
  'lines.noLines': { en: 'No lines configured yet.', zh: '暂无已配置的产线。' },
  'lines.createFirst': { en: 'Create First Line', zh: '创建第一条产线' },
  'lines.editLine': { en: 'Edit Production Line', zh: '编辑生产线' },
  'lines.addLine': { en: 'Add Production Line', zh: '添加生产线' },
  'lines.modalDesc': { en: 'Define the physical line name and the network directories where AOI/SPI machines drop their XML/TXT files.', zh: '定义物理产线名称以及 AOI/SPI 设备放置 XML/TXT 文件的网络目录。' },
  'lines.labelName': { en: 'Line Name', zh: '产线名称' },
  'lines.labelDesc': { en: 'Description', zh: '描述' },
  'lines.labelAoiPath': { en: 'AOI Watch Path', zh: 'AOI 监控路径' },
  'lines.labelSpiPath': { en: 'SPI Watch Path', zh: 'SPI 监控路径' },
  'lines.cancel': { en: 'Cancel', zh: '取消' },
  'lines.save': { en: 'Save Configuration', zh: '保存配置' },
  'lines.addNewLine': { en: 'Add New Line', zh: '添加新产线' },
"""

if "'lines.aoiConfigs'" not in ctx:
    ctx = ctx.replace("// Reports", new_keys + "\n  // Reports")
    with open(context_path, "w") as f:
        f.write(ctx)

print("Updated LineManagement.tsx")
