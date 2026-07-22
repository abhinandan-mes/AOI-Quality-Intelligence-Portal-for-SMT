import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLanguage } from '../contexts/LanguageContext';
import './Dashboard.css'; // Reuse CSS

export default function UserManagement() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'users' | 'permissions' | 'logs'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  
  const API_BASE = `http://${window.location.hostname}:5050/api`;

  useEffect(() => {
    fetchUsers();
    fetchLogs();
    fetchPermissions();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE}/users`);
      setUsers(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await axios.get(`${API_BASE}/activity`);
      setLogs(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchPermissions = async () => {
    try {
      const res = await axios.get(`${API_BASE}/permissions`);
      setPermissions(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const getRoleColor = (role: string) => {
    switch(role) {
      case 'SUPER_ADMIN': return '#ef4444'; // Red
      case 'ADMIN': return '#f97316'; // Orange
      case 'MANAGER': return '#3b82f6'; // Blue
      case 'INSPECTOR': return '#10b981'; // Green
      default: return '#64748b'; // Gray
    }
  };

  const togglePermission = async (role: string, permissionName: string) => {
    const roleObj = permissions.find(p => p.role === role);
    if (!roleObj) return;

    let newPerms = [...roleObj.permissions];
    if (newPerms.includes(permissionName)) {
      newPerms = newPerms.filter(p => p !== permissionName);
    } else {
      newPerms.push(permissionName);
    }

    try {
      await axios.put(`${API_BASE}/permissions/${role}`, { permissions: newPerms });
      fetchPermissions();
    } catch (e) {
      console.error(e);
    }
  };

  const PERMISSION_LIST = [
    'VIEW_DASHBOARD', 'VIEW_HISTORY', 'VIEW_SEARCH', 'VIEW_REPORTS', 'VIEW_ANALYTICS', 'MANAGE_LINES', 'MANAGE_USERS', 'VIEW_LOGS'
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>{t('menu.users') || 'User Management'}</h1>
          <div className="subtitle">
            Manage roles, permissions, and view system audits
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <button 
          onClick={() => setActiveTab('users')}
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'users' ? '#415fff' : '#e2e8f0', color: activeTab === 'users' ? 'white' : '#475569', cursor: 'pointer', fontWeight: 600 }}
        >
          Users
        </button>
        <button 
          onClick={() => setActiveTab('permissions')}
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'permissions' ? '#415fff' : '#e2e8f0', color: activeTab === 'permissions' ? 'white' : '#475569', cursor: 'pointer', fontWeight: 600 }}
        >
          Role Permissions
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: activeTab === 'logs' ? '#415fff' : '#e2e8f0', color: activeTab === 'logs' ? 'white' : '#475569', cursor: 'pointer', fontWeight: 600 }}
        >
          Activity Logs
        </button>
      </div>

      {activeTab === 'users' && (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table className="vivo-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '16px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>NAME</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>USERNAME</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>ROLE</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>STATUS</th>
                <th style={{ padding: '16px', textAlign: 'right', color: '#64748b', fontSize: '0.85rem' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px', fontWeight: 600, color: '#0f172a' }}>{u.name}</td>
                  <td style={{ padding: '16px', color: '#475569' }}>{u.username}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '100px', 
                      fontSize: '0.75rem', 
                      fontWeight: 700, 
                      backgroundColor: `${getRoleColor(u.role)}15`, 
                      color: getRoleColor(u.role)
                    }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    {u.isActive ? (
                      <span style={{ color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>● Active</span>
                    ) : (
                      <span style={{ color: '#ef4444', fontWeight: 600, fontSize: '0.85rem' }}>● Inactive</span>
                    )}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <button style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'permissions' && (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px' }}>
          <h3 style={{ marginTop: 0 }}>Access Control Matrix</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
            <thead>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Permission</th>
                {['INSPECTOR', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'].map(r => (
                  <th key={r} style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid #e2e8f0', fontSize: '0.85rem', color: getRoleColor(r) }}>{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSION_LIST.map(perm => (
                <tr key={perm} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px 12px', fontSize: '0.9rem', fontWeight: 500 }}>{perm}</td>
                  {['INSPECTOR', 'MANAGER', 'ADMIN', 'SUPER_ADMIN'].map(role => {
                    const hasPerm = permissions.find(p => p.role === role)?.permissions?.includes(perm);
                    return (
                      <td key={role} style={{ textAlign: 'center' }}>
                        <input 
                          type="checkbox" 
                          checked={hasPerm || false}
                          onChange={() => togglePermission(role, perm)}
                          disabled={role === 'SUPER_ADMIN'}
                          style={{ cursor: role === 'SUPER_ADMIN' ? 'not-allowed' : 'pointer' }}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'logs' && (
        <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table className="vivo-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '16px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>TIME</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>USER</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>ACTION</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>IP ADDRESS</th>
                <th style={{ padding: '16px', textAlign: 'left', color: '#64748b', fontSize: '0.85rem' }}>DETAILS</th>
              </tr>
            </thead>
            <tbody>
              {logs.map(l => (
                <tr key={l.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.85rem' }}>{new Date(l.createdAt).toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{l.username || 'System'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ 
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700,
                      background: l.action === 'FAILED_LOGIN' ? '#fef2f2' : '#f1f5f9',
                      color: l.action === 'FAILED_LOGIN' ? '#ef4444' : '#334155'
                    }}>
                      {l.action}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', color: '#475569', fontSize: '0.85rem', fontFamily: 'monospace' }}>{l.ipAddress}</td>
                  <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '0.85rem' }}>{l.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
