import React, { useState } from 'react';
import './LoginPage.css';

interface LoginPageProps {
  onLogin: (credentials: any) => Promise<void>;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [language, setLanguage] = useState<'en' | 'zh'>('en');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const t = (key: string) => {
    const translations: any = {
      en: {
        login_title: 'Welcome Back',
        login_desc: 'Sign in to access real-time AOI and SPI production data and intelligence.',
        login_secure_heading: 'Secure Login',
        login_authorized_only: 'Authorized personnel only',
        login_username: 'Username',
        login_username_placeholder: 'Enter your username',
        login_password: 'Password',
        login_password_placeholder: 'Enter your password',
        login_btn: 'Sign In',
        login_btn_loading: 'Signing In...',
        login_forgot_pwd: 'Forgot Password? Contact IT',
        login_error_credentials: 'Invalid username or password',
        login_error_server: 'Server error. Try again later.',
      },
      zh: {
        login_title: '欢迎回来',
        login_desc: '登录以访问实时 AOI 和 SPI 生产数据与智能分析。',
        login_secure_heading: '安全登录',
        login_authorized_only: '仅限授权人员',
        login_username: '用户名',
        login_username_placeholder: '请输入用户名',
        login_password: '密码',
        login_password_placeholder: '请输入密码',
        login_btn: '登录',
        login_btn_loading: '登录中...',
        login_forgot_pwd: '忘记密码？请联系 IT',
        login_error_credentials: '用户名或密码无效',
        login_error_server: '服务器错误。请稍后重试。',
      }
    };
    return translations[language][key] || key;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setCredentials(current => ({ ...current, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      await onLogin({
        username: credentials.username,
        password: credentials.password
      });
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError(t('login_error_credentials'));
      } else {
        setError(t('login_error_server'));
      }
    } finally {
      setLoading(false);
    }
  };

  const EyeOpen = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

  const EyeOff = () => (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );

  return (
    <div className="login-layout">
      <main className="login-page">
        <section className="login-shell">

        {/* ── Left Panel: Brand Row ── */}
        <div className="login-brand">
          <strong>SMT QUALITY PORTAL</strong>
        </div>

        {/* ── Left Panel: Hero Copy ── */}
        <div className="login-copy">
          <div className="login-copy-badge">
            {language === 'zh' ? '✦ AOI & SPI 智能分析系统' : '✦ AOI & SPI Intelligence Portal'}
          </div>
          <h1>{t('login_title')}</h1>
          <p>{t('login_desc')}</p>
          <div className="login-copy-features">
            {(language === 'zh'
              ? ['实时生产良率仪表盘', '缺陷图片与条码追溯', '多机台自动文件导入', '角色化权限控制']
              : ['Real-time production yield dashboards', 'Defect image & barcode traceability', 'Automated multi-machine file import', 'Role-based access control']
            ).map(f => (
              <div className="login-copy-feature" key={f}>
                <span className="login-copy-feature-dot" />
                {f}
              </div>
            ))}
          </div>
        </div>

        {/* ── Right Panel: Form ── */}
        <div className="login-form-panel">
          <div className="login-form-topbar">
            <div className="login-lang-selector" role="group" aria-label="Language selector">
              <button
                type="button"
                className={`login-lang-btn ${language === 'en' ? 'active' : ''}`}
                onClick={() => setLanguage('en')}
              >
                EN
              </button>
              <button
                type="button"
                className={`login-lang-btn ${language === 'zh' ? 'active' : ''}`}
                onClick={() => setLanguage('zh')}
              >
                中文
              </button>
            </div>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="login-form-heading">
              <h2>{t('login_secure_heading')}</h2>
              <p>{t('login_authorized_only')}</p>
            </div>

            <div className="form-group-accessible">
              <label htmlFor="username-input">{t('login_username')}</label>
              <input
                id="username-input"
                name="username"
                value={credentials.username}
                onChange={handleChange}
                autoComplete="username"
                placeholder={t('login_username_placeholder')}
                required
              />
            </div>

            <div className="form-group-accessible">
              <label htmlFor="password-input">{t('login_password')}</label>
              <div className="password-input-container">
                <input
                  id="password-input"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={credentials.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  placeholder={t('login_password_placeholder')}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <EyeOpen />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !credentials.username || !credentials.password}
            >
              {loading ? t('login_btn_loading') : t('login_btn')}
            </button>

            <div className="login-forgot-pwd">
              {t('login_forgot_pwd')}
            </div>

            <div className="login-error-container">
              {error && <div className="login-error">{error}</div>}
            </div>
          </form>
        </div>

      </section>
      </main>

      <div className="login-footer-info">
        <p>AOI Quality Intelligence Portal &copy; 2026 | V1.0.0</p>
      </div>
    </div>
  );
}
