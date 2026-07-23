import React, { createContext, useContext, useState, type ReactNode } from 'react';

type Language = 'en' | 'zh';

interface Translations {
  [key: string]: {
    en: string;
    zh: string;
  };
}

export const translations: Translations = {
  // Login Page
  'login.title': { en: 'AOI Quality Intelligence Portal', zh: 'AOI 质量智能门户' },
  'login.subtitle': { en: 'SMT QUALITY INTELLIGENCE SYSTEM', zh: 'SMT 质量智能系统' },
  'login.desc': { en: 'Sign in to access real-time defect analysis, live yield tracking, and automatic Pareto generation.', zh: '登录以访问实时缺陷分析、实时良率跟踪和自动帕累托生成。' },
  'login.bullet1': { en: 'Real-time defect analysis', zh: '实时缺陷分析' },
  'login.bullet2': { en: 'Live yield tracking', zh: '实时良率跟踪' },
  'login.bullet3': { en: 'Automatic Pareto generation', zh: '自动帕累托生成' },
  'login.bullet4': { en: 'Role-based access control', zh: '基于角色的访问控制' },
  'login.secureLogin': { en: 'Secure Login', zh: '安全登录' },
  'login.authorizedOnly': { en: 'Authorized access only', zh: '仅限授权访问' },
  'login.username': { en: 'USERNAME', zh: '用户名' },
  'login.password': { en: 'PASSWORD', zh: '密码' },
  'login.usernamePlaceholder': { en: 'Enter username', zh: '输入用户名' },
  'login.passwordPlaceholder': { en: 'Enter password', zh: '输入密码' },
  'login.signIn': { en: 'Sign In', zh: '登录' },
  'login.forgotPassword': { en: 'Forgot password? Contact your administrator.', zh: '忘记密码？请联系您的管理员。' },
  
  // Footer
  'footer.line1': { en: 'AOI Quality Intelligence Portal © 2026 vivo | V1.20.7.26', zh: 'AOI 质量智能门户 © 2026 vivo | V1.20.7.26' },
  'footer.line2': { en: 'Designed, Developed & Maintained by', zh: '设计、开发与维护：' },

  // Menu
  'menu.dashboard': { en: 'Dashboard', zh: '仪表板' },
  'menu.lines': { en: 'Line Management', zh: '产线管理' },
  'menu.history': { en: 'Barcode History', zh: '条码历史' },
  'menu.search': { en: 'Defect Search', zh: '缺陷搜索' },
  'menu.reports': { en: 'Reports', zh: '报告' },
  'menu.analytics': { en: 'Analytics', zh: '分析' },
  'menu.users': { en: 'User Management', zh: '用户管理' },
  'menu.activityLogs': { en: 'Activity Logs', zh: '活动日志' },
  'menu.logout': { en: 'Logout', zh: '退出登录' },

  // Dashboard
  'dashboard.today': { en: 'Today', zh: '今天' },
  'dashboard.weekly': { en: 'Weekly', zh: '本周' },
  'dashboard.monthly': { en: 'Monthly', zh: '本月' },
  'dashboard.subtitle1': { en: 'Total panel barcodes', zh: '总面板条码数' },
  'dashboard.subtitle2': { en: 'Boards passed inspection', zh: '合格板数' },
  'dashboard.subtitle3': { en: 'Total individual defects', zh: '个体缺陷总数' },
  'dashboard.subtitle4': { en: 'In-progress sessions', zh: '进行中的会话' },
  'dashboard.outputTrend': { en: 'Output Trend', zh: '产出趋势' },
  'dashboard.inspectionsByHour': { en: 'Inspections by hour (selected range)', zh: '按小时检验量（所选范围）' },
  'dashboard.inspectionsByDay': { en: 'Inspections by day (selected range)', zh: '按日检验量（所选范围）' },
  'dashboard.yieldDistribution': { en: 'Yield Distribution', zh: '良率分布' },
  'dashboard.passFailRatio': { en: 'Pass vs Fail ratio', zh: '合格/不合格比率' },
  'dashboard.topDefects': { en: 'Top Defective Components', zh: '最多缺陷组件' },
  'dashboard.live': { en: 'Live', zh: '实时' },
  'dashboard.component': { en: 'Component', zh: '组件' },
  'dashboard.defect': { en: 'Defect', zh: '缺陷' },
  'dashboard.count': { en: 'Count', zh: '数量' },
  'dashboard.noDefectData': { en: 'No defect data', zh: '无缺陷数据' },
  'dashboard.recentInspections': { en: 'Recent Inspections', zh: '最近检验' },
  'dashboard.exportCsv': { en: 'Export CSV', zh: '导出CSV' },
  'dashboard.barcode': { en: 'Barcode', zh: '条码' },
  'dashboard.line': { en: 'Line', zh: '产线' },
  'dashboard.machine': { en: 'Machine', zh: '设备' },
  'dashboard.status': { en: 'Status', zh: '状态' },
  'dashboard.timestamp': { en: 'Timestamp', zh: '时间戳' },
  'dashboard.noRecentInspections': { en: 'No recent inspections', zh: '无最近检验记录' },
  'dashboard.loading': { en: 'Loading...', zh: '加载中...' },

  // DefectSearch
  'defectSearch.subtitle': { en: 'Pinpoint specific defect types and locations across all lines.', zh: '跨所有产线精确定位特定缺陷类型和位置。' },

  // LineManagement
  'lines.subtitle': { en: 'Configure production lines and network paths for automated file processing.', zh: '配置生产线和网络路径以进行自动文件处理。' },
  'lines.totalLines': { en: 'Total Lines', zh: '总产线数' },
  'lines.totalLinesDesc': { en: 'Registered in system', zh: '系统内注册' },
  'lines.activeLines': { en: 'Active Lines', zh: '活跃产线' },
  'lines.activeLinesDesc': { en: 'Currently processing files', zh: '当前正在处理文件' },

  
  // Line Management Additions
  'lines.postAoiConfigs': { en: 'Post AOI Configurations', zh: 'Post AOI 配置' },
  'lines.postAoiPaths': { en: 'Lines with Post AOI watch paths', zh: '带有 Post AOI 监控路径的产线' },
  'lines.spiConfigs': { en: 'SPI Configurations', zh: 'SPI 配置' },
  'lines.spiPaths': { en: 'Lines with SPI watch paths', zh: '带有 SPI 监控路径的产线' },
  'lines.configuredLines': { en: 'Configured Production Lines', zh: '已配置的生产线' },
  'lines.colName': { en: 'Line Name', zh: '产线名称' },
  'lines.colDesc': { en: 'Description', zh: '描述' },
  'lines.colPostAoiPath': { en: 'Post AOI Watch Path', zh: 'Post AOI 监控路径' },
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
  'lines.labelPostAoiPath': { en: 'Post AOI Watch Path', zh: 'Post AOI 监控路径' },
  'lines.labelSpiPath': { en: 'SPI Watch Path', zh: 'SPI 监控路径' },
  'lines.cancel': { en: 'Cancel', zh: '取消' },
  'lines.save': { en: 'Save Configuration', zh: '保存配置' },
  'lines.addNewLine': { en: 'Add New Line', zh: '添加新产线' },

  // Reports
  'reports.subtitle': { en: 'Visualize defect trends, pareto analysis, and yield rates over time.', zh: '可视化缺陷趋势、帕累托分析和随时间变化的良率。' },
  'reports.generating': { en: 'Generating...', zh: '生成中...' },
  'reports.generatePdf': { en: 'Generate Official PDF Report', zh: '生成正式PDF报告' },
  'reports.filterRange': { en: 'Filter Range:', zh: '过滤范围：' },
  'reports.updateDashboard': { en: 'Update Dashboard', zh: '更新仪表板' },

  // UserManagement
  'users.subtitle': { en: 'Manage roles, permissions, and view system audits', zh: '管理角色、权限并查看系统审计' },
  'users.addUser': { en: 'Add New User', zh: '添加新用户' },
  'users.tabUsers': { en: 'Users', zh: '用户' },
  'users.tabPermissions': { en: 'Role Permissions', zh: '角色权限' },

  
  // User Management Additions
  'users.colName': { en: 'NAME', zh: '姓名' },
  'users.colUsername': { en: 'USERNAME', zh: '用户名' },
  'users.colRole': { en: 'ROLE', zh: '角色' },
  'users.colStatus': { en: 'STATUS', zh: '状态' },
  'users.colActions': { en: 'ACTIONS', zh: '操作' },
  'users.matrixTitle': { en: 'Access Control Matrix', zh: '访问控制矩阵' },
  'users.colPermission': { en: 'Permission', zh: '权限' },
  'users.edit': { en: 'Edit', zh: '编辑' },
  'users.delete': { en: 'Delete', zh: '删除' },
  'users.labelName': { en: 'Full Name', zh: '全名' },
  'users.labelUsername': { en: 'Username', zh: '用户名' },
  'users.labelRole': { en: 'Role', zh: '角色' },
  'users.labelStatus': { en: 'Status', zh: '状态' },
  'users.labelPassword': { en: 'Password', zh: '密码' },
  'users.labelNewPassword': { en: 'New Password (Leave blank to keep current)', zh: '新密码（留空则保持当前）' },
  'users.cancel': { en: 'Cancel', zh: '取消' },
  'users.save': { en: 'Save Changes', zh: '保存更改' },
  'users.create': { en: 'Create User', zh: '创建用户' },
  'users.active': { en: 'Active', zh: '活跃' },
  'users.inactive': { en: 'Inactive', zh: '不活跃' },
  'users.protected': { en: 'Protected', zh: '受保护' },
  'users.roleInspector': { en: 'Inspector', zh: '检验员' },
  'users.roleManager': { en: 'Manager', zh: '经理' },
  'users.roleAdmin': { en: 'Admin', zh: '管理员' },
  'users.roleSuperAdmin': { en: 'Super Admin', zh: '超级管理员' },
  'users.editTitle': { en: 'Edit User', zh: '编辑用户' },

  // Analytics
  'analytics.subtitle': { en: 'Deep dive into specific line performance and defect correlation.', zh: '深入了解特定产线性能和缺陷关联。' },
  'analytics.allLines': { en: 'All Lines', zh: '所有产线' },
  'analytics.yieldTrend': { en: 'Yield Trend', zh: '良率趋势' },
  'analytics.yieldTrendDesc': { en: 'Pass/Fail percentage over time', zh: '随时间推移的合格/不合格百分比' },
  'analytics.defectPareto': { en: 'Defect Pareto', zh: '缺陷帕累托图' },
  'analytics.defectParetoDesc': { en: 'Highest frequency defects', zh: '最高频缺陷' },

  
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

  
  
  // Dashboard Additions
  'dashboard.colLine': { en: 'Line', zh: '产线' },
  'dashboard.colMachine': { en: 'Machine', zh: '设备' },
  'dashboard.colBarcode': { en: 'Barcode', zh: '条码' },
  'dashboard.colStatus': { en: 'Status', zh: '状态' },
  'dashboard.colTime': { en: 'Timestamp', zh: '时间戳' },
  'dashboard.statusPass': { en: 'PASS', zh: '合格' },
  'dashboard.statusFail': { en: 'FAIL', zh: '不合格' },
  'dashboard.statusNoDefect': { en: 'NO DEFECT', zh: '无缺陷' },

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
  'history.colDefects': { en: 'Defects', zh: '缺陷' },
  'history.colTime': { en: 'Time', zh: '时间' },
  'history.colActions': { en: 'Actions', zh: '操作' },
  'history.loading': { en: 'Loading history...', zh: '加载历史记录中...' },
  'history.noResults': { en: 'No history found for this range.', zh: '此范围内未找到历史记录。' },
  'history.view': { en: 'View', zh: '查看' },
  'history.export': { en: 'Export CSV', zh: '导出CSV' },

  // Activity Logs Page
  'logs.title': { en: 'Activity Logs', zh: '活动日志' },
  'logs.subtitle': { en: 'View system audit trails and user activities', zh: '查看系统审计跟踪和用户活动' },
  'logs.colTime': { en: 'TIME', zh: '时间' },
  'logs.colUser': { en: 'USER', zh: '用户' },
  'logs.colAction': { en: 'ACTION', zh: '操作' },
  'logs.colIpAddress': { en: 'IP ADDRESS', zh: 'IP 地址' },
  'logs.colDetails': { en: 'DETAILS', zh: '详情' },

  // Dashboard Summary
  'dashboard.totalInspections': { en: 'Total Inspections', zh: '总检验数' },
  'dashboard.passedBoards': { en: 'Passed Boards', zh: '合格板数' },
  'dashboard.defectsDetected': { en: 'Defects Detected', zh: '检测到的缺陷' },
  'dashboard.activeMachines': { en: 'Active Machines', zh: '活跃设备' },

  // Barcode History
  'history.title': { en: 'Barcode History', zh: '条码历史' },
  'history.desc': { en: 'Search, filter, and export historical AOI and SPI inspection records.', zh: '搜索、过滤和导出历史 AOI 和 SPI 检验记录。' },
  'history.searchBarcode': { en: 'Barcode...', zh: '条码...' },
  'history.searchLine': { en: 'Line (e.g. Line-401)', zh: '产线 (例如: Line-401)' },
  'history.allSides': { en: 'All Sides', zh: '所有面' },
  'history.sideTop': { en: 'TOP', zh: '顶部 (TOP)' },
  'history.sideBottom': { en: 'BOTTOM', zh: '底部 (BOTTOM)' },
  'history.searchDefectLocation': { en: 'Defect Location', zh: '缺陷位置' },
  'history.allStatuses': { en: 'All Statuses', zh: '所有状态' },
  'history.to': { en: 'to', zh: '至' },
  'history.search': { en: 'Search', zh: '搜索' },
  'history.exportData': { en: 'Export Data', zh: '导出数据' },
  'history.exportCsv': { en: 'Export as CSV', zh: '导出 CSV' },
  'history.exportExcel': { en: 'Export as Excel', zh: '导出 Excel' },
  'history.exportWord': { en: 'Export as Word', zh: '导出 Word' },
  'history.exportPdf': { en: 'Export as PDF', zh: '导出 PDF' },
  
  'history.colBarcode': { en: 'Barcode', zh: '条码' },
  'history.colLine': { en: 'Line', zh: '产线' },
  'history.colMachine': { en: 'Machine', zh: '设备' },
  'history.colSide': { en: 'Side', zh: '面' },
  'history.colStatus': { en: 'Status', zh: '状态' },
  'history.colBlock': { en: 'Block', zh: '区块' },
  'history.colDefectLocation': { en: 'Defect Location', zh: '缺陷位置' },
  'history.colPhenomenon': { en: 'Phenomenon', zh: '不良现象' },
  'history.colTimestamp': { en: 'Timestamp', zh: '时间戳' },
  
  'history.noRecords': { en: 'No Inspection Records Found', zh: '未找到检验记录' },
  'history.noRecordsDesc': { en: 'Try adjusting your search filters or dates to find what you\'re looking for.', zh: '请尝试调整搜索过滤器或日期以查找您需要的内容。' },
  'history.showing': { en: 'Showing', zh: '显示' },
  'history.entries': { en: 'entries', zh: '条记录' },
  'history.previous': { en: 'Previous', zh: '上一页' },
  'history.next': { en: 'Next', zh: '下一页' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('language') as Language) || 'en';
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    if (translations[key]) {
      return translations[key][language];
    }
    return key; // fallback to key if missing
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
