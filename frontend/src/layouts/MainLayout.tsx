import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import vivoLogo from '../assets/vivo-logo.svg';

const menuItems = [
  { text: 'Dashboard', icon: '📊', path: '/dashboard' },
  { text: 'Line Management', icon: '⚙️', path: '/lines' },
  { text: 'Barcode History', icon: '📜', path: '/history' },
  { text: 'Defect Search', icon: '🔍', path: '/search' },
  { text: 'Reports', icon: '📄', path: '/reports' },
  { text: 'Analytics', icon: '📈', path: '/analytics' },
];

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', maxWidth: '100vw', overflowX: 'hidden' }}>
      {/* Sidebar */}
      <div style={{ width: '240px', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', backgroundColor: '#415fff' }}>
          <img src={vivoLogo} alt="vivo" style={{ height: '24px', filter: 'brightness(0) invert(1)' }} />
        </div>
        <div style={{ flexGrow: 1, padding: '16px 8px', overflowY: 'auto' }}>
          {menuItems.map((item) => {
            const isSelected = location.pathname === item.path;
            return (
              <div 
                key={item.text}
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px 16px',
                  marginBottom: '8px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? 'rgba(65, 95, 255, 0.08)' : 'transparent',
                  color: isSelected ? '#415fff' : '#64748b',
                  fontWeight: isSelected ? 700 : 500,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => { if(!isSelected) e.currentTarget.style.backgroundColor = '#f1f5f9' }}
                onMouseLeave={(e) => { if(!isSelected) e.currentTarget.style.backgroundColor = 'transparent' }}
              >
                <span style={{ marginRight: '12px', fontSize: '1.2rem' }}>{item.icon}</span>
                <span style={{ fontSize: '0.9rem' }}>{item.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', overflowX: 'hidden' }}>
        {/* Header */}
        <header style={{ height: '64px', backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', padding: '0 24px', justifyContent: 'space-between' }}>
          <h1 style={{ margin: 0, fontSize: '1.1rem', color: '#1e293b', fontWeight: 700 }}>AOI Quality Intelligence Portal</h1>
          <button onClick={handleLogout} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>Logout</span> 🚪
          </button>
        </header>

        {/* Page Content */}
        <main style={{ flexGrow: 1, padding: '24px' }}>
          <Outlet />
        </main>

        {/* Footer */}
        <footer style={{ marginTop: 'auto', padding: '16px 24px', textAlign: 'center', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 500 }}>
          <span className="small-brand" style={{ fontWeight: 'bold' }}>vivo</span> <span className="footer-version" style={{ color: '#415fff' }}>V1.20.7.26</span>
        </footer>
      </div>
    </div>
  );
}
