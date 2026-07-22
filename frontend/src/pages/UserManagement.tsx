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

  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
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

  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', username: '', role: 'INSPECTOR', password: '' });
  const [editUser, setEditUser] = useState<any>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [formError, setFormError] = useState<string>('');

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAddUser = async () => {
    setFormError('');
    try {
      await axios.post(`${API_BASE}/users`, {
        ...newUser,
        performerUsername: currentUser?.username
      });
      setShowAddUserModal(false);
      setNewUser({ name: '', username: '', role: 'INSPECTOR', password: '' });
      showToast('User created successfully', 'success');
      fetchUsers();
    } catch (e: any) {
      setFormError(e.response?.data?.error || 'Failed to add user');
    }
  };

  const handleEditUser = async () => {
    setFormError('');
    try {
      const dataToUpdate: any = { name: editUser.name, role: editUser.role, isActive: editUser.isActive, performerUsername: currentUser?.username };
      if (editUser.password) dataToUpdate.password = editUser.password;
      await axios.put(`${API_BASE}/users/${editUser.id}`, dataToUpdate);
      setShowEditUserModal(false);
      setEditUser(null);
      showToast('User updated successfully', 'success');
      fetchUsers();
    } catch (e: any) {
      setFormError(e.response?.data?.error || 'Failed to update user');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`${API_BASE}/users/${id}`, {
        data: { performerUsername: currentUser?.username }
      });
      showToast('User deleted successfully', 'success');
      fetchUsers();
    } catch (e: any) {
      showToast(e.response?.data?.error || 'Failed to delete user', 'error');
    }
  };

  return (
    <div className="dashboard-container">
      {toast && toast.type === 'success' && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          background: '#f0fdf4', color: '#10b981', padding: '16px 24px', borderRadius: '8px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '12px',
          fontWeight: 600, fontSize: '0.9rem', animation: 'slideInRight 0.3s ease-out'
        }}>
          ✅ {toast.message}
        </div>
      )}
      
      <div className="dashboard-header">
        <div>
          <h1 className="premium-heading-gradient" style={{ margin: 0, fontSize: '2.2rem', fontWeight: 700, letterSpacing: '-0.5px' }}>{t('menu.users') || 'User Management'}</h1>
          <div className="subtitle">
            Manage roles, permissions, and view system audits
          </div>
        </div>
        <button 
          onClick={() => { setFormError(''); setShowAddUserModal(true); }} 
          style={{ 
            background: '#3b82f6', color: 'white', border: 'none', 
            padding: '10px 20px', borderRadius: '6px', fontWeight: 600, 
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add New User
        </button>
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
                  <td style={{ padding: '16px', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    {(u.role !== 'SUPER_ADMIN' || currentUser?.role === 'SUPER_ADMIN') ? (
                      <>
                        <button onClick={() => { setEditUser(u); setFormError(''); setShowEditUserModal(true); }} style={{ color: '#3b82f6', background: '#3b82f615', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Edit</button>
                        <button onClick={() => handleDeleteUser(u.id)} style={{ color: '#ef4444', background: '#ef444415', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                      </>
                    ) : (
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: 600 }}>Protected</span>
                    )}
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
                      background: l.action === 'FAILED_LOGIN' || l.action === 'User Deleted' ? '#fef2f2' : '#f1f5f9',
                      color: l.action === 'FAILED_LOGIN' || l.action === 'User Deleted' ? '#ef4444' : '#334155'
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

      {showAddUserModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="table-card animate-slide-up" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
            <h2 style={{ marginTop: 0, marginBottom: '8px', fontSize: '1.25rem', color: '#0f172a', fontWeight: 700 }}>Add New User</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px', marginTop: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>Full Name</label>
                <input 
                  type="text" value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} placeholder="e.g., John Doe"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>Username</label>
                <input 
                  type="text" value={newUser.username} onChange={(e) => setNewUser({...newUser, username: e.target.value})} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} placeholder="e.g., john_doe"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>Role</label>
                <select 
                  value={newUser.role} onChange={(e) => setNewUser({...newUser, role: e.target.value})} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', background: 'white' }}
                >
                  <option value="INSPECTOR">Inspector</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                  {currentUser?.role === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">Super Admin</option>}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>Password</label>
                <input 
                  type="password" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} placeholder="Initial password"
                />
              </div>
            </div>
            {formError && (
              <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, padding: '10px', background: '#fef2f2', borderRadius: '6px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚠️ {formError}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setShowAddUserModal(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleAddUser} disabled={!newUser.name || !newUser.username || !newUser.password} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', opacity: (!newUser.name || !newUser.username || !newUser.password) ? 0.5 : 1 }}>Create User</button>
            </div>
          </div>
        </div>
      )}

      {showEditUserModal && editUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="table-card animate-slide-up" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
            <h2 style={{ marginTop: 0, marginBottom: '8px', fontSize: '1.25rem', color: '#0f172a', fontWeight: 700 }}>Edit User</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px', marginTop: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>Full Name</label>
                <input 
                  type="text" value={editUser.name} onChange={(e) => setEditUser({...editUser, name: e.target.value})} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>Role</label>
                <select 
                  value={editUser.role} onChange={(e) => setEditUser({...editUser, role: e.target.value})} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', background: 'white' }}
                >
                  <option value="INSPECTOR">Inspector</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                  {currentUser?.role === 'SUPER_ADMIN' && <option value="SUPER_ADMIN">Super Admin</option>}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>Status</label>
                <select 
                  value={editUser.isActive ? 'true' : 'false'} onChange={(e) => setEditUser({...editUser, isActive: e.target.value === 'true'})} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none', background: 'white' }}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>New Password (Leave blank to keep current)</label>
                <input 
                  type="password" value={editUser.password || ''} onChange={(e) => setEditUser({...editUser, password: e.target.value})} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', outline: 'none' }} placeholder="Optional"
                />
              </div>
            </div>
            {formError && (
              <div style={{ color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, padding: '10px', background: '#fef2f2', borderRadius: '6px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                ⚠️ {formError}
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => { setShowEditUserModal(false); setEditUser(null); }} style={{ background: 'transparent', border: 'none', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleEditUser} disabled={!editUser.name} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', opacity: !editUser.name ? 0.5 : 1 }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
