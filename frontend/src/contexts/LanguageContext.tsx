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
  'menu.logout': { en: 'Logout', zh: '退出登录' },

  // Dashboard Summary
  'dashboard.totalInspections': { en: 'Total Inspections', zh: '总检验数' },
  'dashboard.passedBoards': { en: 'Passed Boards', zh: '合格板数' },
  'dashboard.defectsDetected': { en: 'Defects Detected', zh: '检测到的缺陷' },
  'dashboard.activeMachines': { en: 'Active Machines', zh: '活跃设备' },
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
