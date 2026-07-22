import React, { useState } from 'react';
import vivoLogo from '../assets/vivo-logo.svg';
import { useLanguage } from '../contexts/LanguageContext';

export default function LoginPage({ onLogin }: { onLogin: (cred: any) => void }) {
  const { language, setLanguage, t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onLogin({ username, password });
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f1f5f9' }}>
      <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
        <div style={{ 
          display: 'flex', 
          width: '100%', 
          maxWidth: '1000px', 
          minHeight: '600px',
          backgroundColor: '#ffffff', 
          borderRadius: '24px', 
          boxShadow: '0 20px 40px rgba(0,0,0,0.08)', 
          overflow: 'hidden' 
        }}>
          
          {/* Left Pane - Blue Gradient & Shapes */}
          <div style={{ 
            flex: '1.4', 
            backgroundColor: '#2b52f6',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Top Bar inside Left Pane */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '16px', 
              padding: '24px 40px',
              backgroundColor: '#304be7',
              zIndex: 1 
            }}>
              <img src={vivoLogo} alt="vivo" style={{ height: '24px', filter: 'brightness(0) invert(1)' }} />
              <div style={{ width: '1px', height: '16px', backgroundColor: 'rgba(255,255,255,0.5)' }}></div>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, letterSpacing: '0.02em' }}>{t('login.title')}</span>
            </div>

            {/* Decorative background shapes (3 circles as per reference) */}
            {/* Top Right Large Circle */}
            <div style={{
              position: 'absolute',
              top: '-15%',
              right: '-20%',
              width: '600px',
              height: '600px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '50%',
              pointerEvents: 'none'
            }} />
            
            {/* Bottom Left Circle */}
            <div style={{
              position: 'absolute',
              bottom: '-10%',
              left: '-10%',
              width: '300px',
              height: '300px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '50%',
              pointerEvents: 'none'
            }} />

            {/* Bottom Right Circle */}
            <div style={{
              position: 'absolute',
              bottom: '10%',
              right: '-10%',
              width: '250px',
              height: '250px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '50%',
              pointerEvents: 'none'
            }} />

            <div style={{ zIndex: 1, padding: '48px 40px', marginTop: '20px' }}>
              {/* Badge */}
              <div style={{ 
                display: 'inline-block', 
                padding: '8px 16px', 
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '100px',
                fontSize: '0.75rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                marginBottom: '24px',
              }}>
                ✦ {t('login.subtitle')}
              </div>
              
              <h1 style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1.2, marginBottom: '24px' }}>
                {t('login.title')}
              </h1>
              
              <p style={{ fontSize: '1rem', lineHeight: 1.6, opacity: 0.9, marginBottom: '40px', maxWidth: '85%' }}>
                {t('login.desc')}
              </p>

              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['bullet1', 'bullet2', 'bullet3', 'bullet4'].map((bullet, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.95rem', fontWeight: 500, opacity: 0.95 }}>
                    <div style={{ width: '6px', height: '6px', backgroundColor: '#fff', borderRadius: '50%' }} />
                    {t(`login.${bullet}`)}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Pane - Form */}
          <div style={{ 
            flex: '1', 
            padding: '48px',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#ffffff'
          }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '48px' }}>
              <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '100px', padding: '4px' }}>
                <button 
                  onClick={() => setLanguage('en')}
                  style={{ 
                    padding: '4px 16px', 
                    borderRadius: '100px', 
                    border: 'none', 
                    background: language === 'en' ? '#ffffff' : 'transparent',
                    color: language === 'en' ? '#3b82f6' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    boxShadow: language === 'en' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  EN
                </button>
                <button 
                  onClick={() => setLanguage('zh')}
                  style={{ 
                    padding: '4px 16px', 
                    borderRadius: '100px', 
                    border: 'none', 
                    background: language === 'zh' ? '#ffffff' : 'transparent',
                    color: language === 'zh' ? '#3b82f6' : '#64748b',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    boxShadow: language === 'zh' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  中文
                </button>
              </div>
            </div>

            <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ width: '8px', height: '8px', backgroundColor: '#3b82f6', borderRadius: '50%' }} />
                <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 800, color: '#0f172a' }}>{t('login.secureLogin')}</h2>
              </div>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '40px', paddingLeft: '20px' }}>{t('login.authorizedOnly')}</p>

              {error && <div style={{ padding: '12px', backgroundColor: '#fef2f2', color: '#dc2626', borderRadius: '8px', marginBottom: '24px', fontSize: '0.85rem' }}>{error}</div>}
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>{t('login.username')}</label>
                  <input 
                    type="text" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)} 
                    placeholder={t('login.usernamePlaceholder')}
                    style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', outline: 'none', fontSize: '0.95rem' }} 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', letterSpacing: '0.05em' }}>{t('login.password')}</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type="password" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      placeholder={t('login.passwordPlaceholder')}
                      style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: '#f8fafc', outline: 'none', fontSize: '0.95rem' }} 
                    />
                  </div>
                </div>
                <button 
                  type="submit" 
                  disabled={loading}
                  style={{ 
                    width: '100%', 
                    padding: '16px', 
                    backgroundColor: '#f1f5f9', 
                    color: '#0f172a', 
                    border: 'none', 
                    borderRadius: '12px', 
                    fontWeight: 700, 
                    fontSize: '1rem',
                    cursor: loading ? 'not-allowed' : 'pointer', 
                    marginTop: '16px',
                    transition: 'all 0.2s ease',
                    opacity: loading ? 0.7 : 1
                  }}
                  onMouseEnter={(e) => { if(!loading) e.currentTarget.style.backgroundColor = '#e2e8f0' }}
                  onMouseLeave={(e) => { if(!loading) e.currentTarget.style.backgroundColor = '#f1f5f9' }}
                >
                  {loading ? '...' : t('login.signIn')}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '32px' }}>
                <a href="#" style={{ color: '#94a3b8', fontSize: '0.8rem', textDecoration: 'none' }}>{t('login.forgotPassword')}</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Unified Global Footer */}
      <footer style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '0.75rem', fontWeight: 500 }}>
        <div>
          {t('footer.line1').split(' | ')[0]} | <span style={{ color: '#2b52f6', fontWeight: 700 }}>{t('footer.line1').split(' | ')[1]}</span>
        </div>
        <div style={{ marginTop: '4px' }}>
          {t('footer.line2')} <a href="http://localhost:8951/?action=talkapi&toUserCode=95003989" target="_blank" rel="noreferrer" style={{ color: '#2b52f6', fontWeight: 700, textDecoration: 'none' }}>Abhinandan Kumar</a>
        </div>
      </footer>
    </div>
  );
}
