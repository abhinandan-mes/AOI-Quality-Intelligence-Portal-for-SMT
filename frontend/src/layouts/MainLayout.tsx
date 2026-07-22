import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, NavLink } from 'react-router-dom';
import vivoLogo from '../assets/vivo-logo.svg';
import { useLanguage } from '../contexts/LanguageContext';

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return <span style={{ color: 'white', fontWeight: 600, fontSize: '0.9rem' }}>{time.toLocaleTimeString('en-US', { hour12: false })}</span>;
}

export default function MainLayout({ onLogout }: { onLogout?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, changeLanguage } = useLanguage();
  
  // Since we haven't implemented context for user yet, we get it from localStorage or auth hook
  // We'll mock it for now based on previous implementation
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : { name: 'Abhinandan Kumar', role: 'SUPER_ADMIN' };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (onLogout) {
      onLogout();
    } else {
      navigate('/login');
    }
  };

  const handleDeveloperClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const url = "http://localhost:8951/?action=talkapi&toUserCode=95003989";
    const newWindow = window.open(url, "_blank");
    
    if (newWindow) {
      const messageListener = (event: MessageEvent) => {
        if (event.origin === "http://localhost:8951") {
          newWindow.close();
          window.removeEventListener("message", messageListener);
        }
      };
      window.addEventListener("message", messageListener);

      setTimeout(() => {
        if (newWindow && !newWindow.closed) {
          newWindow.close();
        }
        window.removeEventListener("message", messageListener);
      }, 2500);
    }
  };

  const navItemStyle = (isActive: boolean) => ({
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    color: isActive ? '#ffffff' : '#475569',
    backgroundColor: isActive ? '#415fff' : 'transparent',
    textDecoration: 'none',
    fontWeight: isActive ? 600 : 500,
    fontSize: '0.9rem',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    marginBottom: '6px',
    margin: '0 12px'
  });

  return (
    <div className="app" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Primary Blue Top Bar */}
      <header style={{ 
        backgroundColor: '#415fff', 
        height: '56px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '0 24px',
        zIndex: 50,
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img src={vivoLogo} alt="vivo" style={{ height: '24px', filter: 'brightness(0) invert(1)' }} />
          <div style={{ width: '1px', height: '20px', backgroundColor: 'rgba(255,255,255,0.3)' }} />
          <span style={{ color: 'white', fontWeight: 600, fontSize: '0.95rem' }}>AOI Quality Intelligence Portal</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <LiveClock />
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            backgroundColor: 'rgba(255,255,255,0.15)', 
            padding: '4px 12px', 
            borderRadius: '4px' 
          }}>
            <span style={{ color: 'white', fontWeight: 600, fontSize: '0.85rem' }}>{user.name}</span>
            <span style={{ 
              backgroundColor: 'rgba(255,255,255,0.9)', 
              color: '#415fff', 
              fontSize: '0.65rem', 
              fontWeight: 700, 
              padding: '2px 6px', 
              borderRadius: '2px' 
            }}>
              {user.role}
            </span>
          </div>
          
          <div className="header-lang-selector" style={{ margin: 0, backgroundColor: 'rgba(255,255,255,0.15)', padding: '2px', borderRadius: '4px', border: 'none', display: 'flex' }}>
            <button 
              type="button" 
              style={{ border: 'none', background: language === 'en' ? 'white' : 'transparent', color: language === 'en' ? '#415fff' : 'white', borderRadius: '2px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              onClick={() => changeLanguage('en')}
            >
              EN
            </button>
            <button 
              type="button" 
              style={{ border: 'none', background: language === 'zh' ? 'white' : 'transparent', color: language === 'zh' ? '#415fff' : 'white', borderRadius: '2px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}
              onClick={() => changeLanguage('zh')}
            >
              中
            </button>
          </div>

          <button 
            onClick={handleLogout}
            style={{ 
              backgroundColor: 'rgba(255,255,255,0.15)', 
              color: 'white', 
              border: 'none', 
              padding: '6px 16px', 
              borderRadius: '4px', 
              fontWeight: 600, 
              fontSize: '0.85rem',
              cursor: 'pointer',
              marginLeft: '8px'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Container below header */}
      <div className="layout-body">
        
        {/* Vertical Sidebar */}
        <aside className="layout-sidebar">
          <div className="nav-links-container">
            <NavLink to="/dashboard" style={({ isActive }) => navItemStyle(isActive)}>
              {t('menu.dashboard') || 'Home'}
            </NavLink>
            <NavLink to="/lines" style={({ isActive }) => navItemStyle(isActive)}>
              {t('menu.lines') || 'Line Management'}
            </NavLink>
            <NavLink to="/history" style={({ isActive }) => navItemStyle(isActive)}>
              {t('menu.history') || 'Checksheets'}
            </NavLink>
            <NavLink to="/reports" style={({ isActive }) => navItemStyle(isActive)}>
              {t('menu.reports') || 'Reports'}
            </NavLink>
            <NavLink to="/analytics" style={({ isActive }) => navItemStyle(isActive)}>
              {t('menu.analytics') || 'Analytics'}
            </NavLink>
            <NavLink to="/users" style={({ isActive }) => navItemStyle(isActive)}>
              {t('menu.users') || 'User Management'}
            </NavLink>
          </div>
        </aside>

        {/* Content Area */}
        <div className="layout-content-wrapper">
          
          <main className="main-content layout-main">
            <Outlet />
          </main>

          <footer className="footer layout-footer">
            <p>{t('footer.line1').split(' | ')[0]} | <span className="footer-version" style={{ color: '#415fff', fontWeight: 700 }}>{t('footer.line1').split(' | ')[1]}</span></p>
            <p className="footer-credit">
              {t('footer.line2')}{" "}
              <a 
                href="http://localhost:8951/?action=talkapi&toUserCode=95003989" 
                onClick={handleDeveloperClick}
                className="developer-link"
                style={{ color: '#415fff', fontWeight: 700, textDecoration: 'none' }}
              >
                Abhinandan Kumar
              </a>
            </p>
          </footer>
        </div>

      </div>
    </div>
  );
}
