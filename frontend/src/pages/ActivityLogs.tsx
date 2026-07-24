import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';
import './ActivityLog.css';

// SVG Icons
const ClockIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>
);

const LoginIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
    <polyline points="10 17 15 12 10 7"/>
    <line x1="15" y1="12" x2="3" y2="12"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);



const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

const ListIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);

const EyeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const ClearIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/>
    <line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
);

export default function ActivityLogs() {
  const currentUser = { role: 'admin', full_name: 'Admin' };
  const { t, language } = useLanguage();
  const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'admin';
  
  const [logs, setLogs] = useState<any[]>([]);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal State
  const [selectedLog, setSelectedLog] = useState<any>(null);

  // Filter Selection States
  const [selectedUser, setSelectedUser] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStartDate, setSelectedStartDate] = useState('');
  const [selectedEndDate, setSelectedEndDate] = useState('');

  // Active Applied Filters
  const [activeFilters, setActiveFilters] = useState({
    user: 'ALL',
    type: 'ALL',
    startDate: '',
    endDate: ''
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchLogs();
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`http://${window.location.hostname}:5050/api/activity-logs`);
      if (response.data && response.data.success) {
        setLogs(response.data.logs || []);
      }
    } catch (err: any) {
      console.error('Error fetching logs:', err);
      setError(err.message || 'Failed to load activity logs.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`http://${window.location.hostname}:5050/api/users`);
      if (response.data && response.data.success) {
        setUsersList(response.data.users || []);
      }
    } catch (err: any) {
      console.error('Error fetching users for filter:', err);
    }
  };

  // Helper: Initials avatar generator
  const getUserInitials = (name: string) => {
    if (!name) return '?';
    const clean = name.trim();
    if (clean.length === 0) return '?';
    // Handle Chinese names or simple names
    if (/[\u4e00-\u9fa5]/.test(clean)) {
      return clean.slice(-2); // Return last two characters
    }
    const parts = clean.split(' ').filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  // Helper: Deterministic avatar color gradient class based on full_name string hash
  const getAvatarColorClass = (name: string) => {
    if (!name) return 'avatar-grad-1';
    let sum = 0;
    for (let i = 0; i < name.length; i++) {
      sum += name.charCodeAt(i);
    }
    const numGradients = 6;
    const index = (sum % numGradients) + 1;
    return `avatar-grad-${index}`;
  };

  // Helper: Activity Pills Mapping
  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'LOGIN_SUCCESS': return language === 'zh' ? '登录' : 'Login';
      case 'LOGIN_FAILURE': return language === 'zh' ? '失败' : 'Failed';
      case 'LOGOUT': return language === 'zh' ? '注销' : 'Logout';
      case 'USER_CREATE': return language === 'zh' ? '创建' : 'Create';
      case 'USER_UPDATE': return language === 'zh' ? '更新' : 'Update';
      case 'USER_DELETE': return language === 'zh' ? '删除' : 'Delete';
      default: return type;
    }
  };

  const getActivityBadgeClass = (type: string) => {
    switch (type) {
      case 'LOGIN_SUCCESS': return 'badge-login';
      case 'LOGIN_FAILURE': return 'badge-failed';
      case 'LOGOUT': return 'badge-logout';
      case 'USER_CREATE': return 'badge-create';
      case 'USER_UPDATE': return 'badge-update';
      case 'USER_DELETE': return 'badge-delete';
      default: return 'badge-default';
    }
  };

  const getEntityLabel = (type: string) => {
    if (['LOGIN_SUCCESS', 'LOGIN_FAILURE', 'LOGOUT'].includes(type)) return 'Authentication';
    if (['USER_CREATE', 'USER_UPDATE', 'USER_DELETE'].includes(type)) return 'User Management';
    return 'System';
  };

  // Helper: Split Date/Time formatter
  const formatTimestampSplit = (ts: string | number | Date) => {
    if (!ts) return { date: '—', time: '' };
    const dateObj = new Date(ts);
    const dateStr = dateObj.toLocaleDateString(language === 'zh' ? 'zh-CN' : 'en-CA', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
    const timeStr = dateObj.toLocaleTimeString(language === 'zh' ? 'zh-CN' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    return { date: dateStr, time: timeStr };
  };

  // Live Summary Cards Calculations (of ALL fetched logs)
  const totalEvents = logs.length;
  const loginsCount = logs.filter(l => l.activity_type === 'LOGIN_SUCCESS').length;



  // Filter Action Handlers
  const handleApplyFilters = () => {
    setActiveFilters({
      user: selectedUser,
      type: selectedType,
      startDate: selectedStartDate,
      endDate: selectedEndDate
    });
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedUser('ALL');
    setSelectedType('ALL');
    setSelectedStartDate('');
    setSelectedEndDate('');
    setActiveFilters({
      user: 'ALL',
      type: 'ALL',
      startDate: '',
      endDate: ''
    });
    setCurrentPage(1);
  };

  // Filter logs based on activeFilters state
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // User filter
      const matchesUser = activeFilters.user === 'ALL' || log.username === activeFilters.user;
      
      // Activity type filter
      const matchesType = activeFilters.type === 'ALL' || log.activity_type === activeFilters.type;
      
      // Date filters (inclusive)
      let matchesStartDate = true;
      if (activeFilters.startDate) {
        const logDate = new Date(log.created_at);
        const filterStart = new Date(activeFilters.startDate + 'T00:00:00');
        matchesStartDate = logDate >= filterStart;
      }
      
      let matchesEndDate = true;
      if (activeFilters.endDate) {
        const logDate = new Date(log.created_at);
        const filterEnd = new Date(activeFilters.endDate + 'T23:59:59');
        matchesEndDate = logDate <= filterEnd;
      }

      return matchesUser && matchesType && matchesStartDate && matchesEndDate;
    });
  }, [logs, activeFilters]);

  // Paginated Logs
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));

  return (
    <div className="activity-log-container">
      {/* Header Section */}
      <div className="page-header-card">
        <div className="title-area">
          <h1>
            <span className="title-icon">⏰</span> {language === 'zh' ? '系统活动日志' : 'Activity Logs'}
          </h1>
          <div className="subtitle">{language === 'zh' ? '跟踪系统操作记录、登录历史和点检提交日志。' : 'Track all system actions and changes'}</div>
        </div>
        <button className="btn-refresh" onClick={fetchLogs} disabled={loading}>
          🔄 {loading ? t('loading') : (language === 'zh' ? '刷新数据' : 'Refresh Logs')}
        </button>
      </div>

      {error && <div className="message error">{error}</div>}

      {/* ── Top Stat Cards Grid ── */}
      <div className="activity-stats-grid">
        <div className="activity-stat-card">
          <div className="card-media card-grad-purple">
            <ClockIcon />
          </div>
          <div className="card-info">
            <span className="card-label">{language === 'zh' ? '总事件数' : 'TOTAL EVENTS'}</span>
            <strong className="card-val">{totalEvents}</strong>
          </div>
        </div>

        <div className="activity-stat-card">
          <div className="card-media card-grad-green">
            <LoginIcon />
          </div>
          <div className="card-info">
            <span className="card-label">{language === 'zh' ? '登录次数' : 'LOGINS'}</span>
            <strong className="card-val">{loginsCount}</strong>
          </div>
        </div>


      </div>

      {/* ── Filter Toolbar ── */}
      <div className="activity-filters-card">
        <div className="filters-card-header">
          <FilterIcon />
          <h3>{language === 'zh' ? '筛选条件' : 'Filter Logs'}</h3>
        </div>
        <div className="filters-grid">
          {isAdmin ? (
            <div className="filter-item">
              <label htmlFor="user-select">{language === 'zh' ? '用户' : 'USER'}</label>
              <select 
                id="user-select" 
                value={selectedUser} 
                onChange={e => setSelectedUser(e.target.value)}
              >
                <option value="ALL">{language === 'zh' ? '所有用户' : 'All Users'}</option>
                {usersList.map(u => (
                  <option key={u.id} value={u.username}>{u.full_name} ({u.username})</option>
                ))}
              </select>
            </div>
          ) : (
            <div className="filter-item">
              <label>{language === 'zh' ? '用户' : 'USER'}</label>
              <input type="text" value={currentUser?.full_name} disabled className="disabled-input" />
            </div>
          )}

          <div className="filter-item">
            <label htmlFor="type-select">{language === 'zh' ? '活动类型' : 'ACTIVITY TYPE'}</label>
            <select 
              id="type-select" 
              value={selectedType} 
              onChange={e => setSelectedType(e.target.value)}
            >
              <option value="ALL">{language === 'zh' ? '所有类型' : 'All Activities'}</option>
              <option value="LOGIN_SUCCESS">{language === 'zh' ? '成功登录' : 'Login Success'}</option>
              <option value="LOGIN_FAILURE">{language === 'zh' ? '失败登录' : 'Login Failure'}</option>
              <option value="LOGOUT">{language === 'zh' ? '注销退出' : 'Logout'}</option>
              <option value="USER_CREATE">{language === 'zh' ? '创建用户' : 'Create User'}</option>
              <option value="USER_UPDATE">{language === 'zh' ? '更新用户' : 'Update User'}</option>
              <option value="USER_DELETE">{language === 'zh' ? '删除用户' : 'Delete User'}</option>
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="start-date-input">{language === 'zh' ? '开始日期' : 'START DATE'}</label>
            <input 
              id="start-date-input"
              type="date" 
              value={selectedStartDate} 
              onChange={e => setSelectedStartDate(e.target.value)} 
            />
          </div>

          <div className="filter-item">
            <label htmlFor="end-date-input">{language === 'zh' ? '结束日期' : 'END DATE'}</label>
            <input 
              id="end-date-input"
              type="date" 
              value={selectedEndDate} 
              onChange={e => setSelectedEndDate(e.target.value)} 
            />
          </div>

          <div className="filter-actions-row">
            <button className="btn-apply-filters" onClick={handleApplyFilters}>
              <SearchIcon /> {language === 'zh' ? '查询' : 'Apply'}
            </button>
            <button className="btn-clear-filters" onClick={handleClearFilters}>
              <ClearIcon /> {language === 'zh' ? '重置' : 'Clear'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Logs Table ── */}
      <div className="logs-table-card">
        <div className="table-card-header">
          <div className="header-left">
            <ListIcon />
            <h3>{language === 'zh' ? '日志明细' : 'Log Entries'}</h3>
          </div>
          <div className="header-right">
            <span className="results-badge">
              {language === 'zh' ? `${filteredLogs.length} 条记录` : `${filteredLogs.length} event(s)`}
            </span>
          </div>
        </div>

        <div className="logs-table-wrapper">
          <table className="logs-table">
            <thead>
              <tr>
                <th style={{ width: '12%' }}>{language === 'zh' ? '时间戳' : 'TIMESTAMP'}</th>
                <th style={{ width: '22%' }}>{language === 'zh' ? '用户' : 'USER'}</th>
                <th style={{ width: '10%' }}>{language === 'zh' ? '活动' : 'ACTIVITY'}</th>
                <th style={{ width: '15%' }}>{language === 'zh' ? '所属模块' : 'ENTITY'}</th>
                <th style={{ width: '26%' }}>{language === 'zh' ? '说明' : 'DESCRIPTION'}</th>
                <th style={{ width: '10%' }}>{language === 'zh' ? 'IP地址' : 'IP ADDRESS'}</th>
                <th style={{ width: '5%', textAlign: 'center' }}>{language === 'zh' ? '详情' : 'DETAILS'}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted">
                    <div className="logs-spinner">{t('loading')}</div>
                  </td>
                </tr>
              ) : paginatedLogs.length > 0 ? (
                paginatedLogs.map(log => {
                  const ts = formatTimestampSplit(log.created_at);
                  const userInitials = getUserInitials(log.full_name || log.username);
                  const colorClass = getAvatarColorClass(log.full_name || log.username);
                  return (
                    <tr key={log.id}>
                      <td>
                        <div className="time-stack">
                          <span className="log-date">{ts.date}</span>
                          <span className="log-time">{ts.time}</span>
                        </div>
                      </td>
                      <td>
                        <div className="log-user-cell">
                          <div className={`log-avatar ${colorClass}`}>{userInitials}</div>
                          <div className="log-user-info">
                            <strong className="log-user-name">{log.full_name || log.username}</strong>
                            {log.email && <span className="log-user-email">{log.email}</span>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`log-pill ${getActivityBadgeClass(log.activity_type)}`}>
                          {getActivityLabel(log.activity_type)}
                        </span>
                      </td>
                      <td>
                        <span className="log-entity-text">{getEntityLabel(log.activity_type)}</span>
                      </td>
                      <td>
                        <span className="log-desc-text" title={log.details}>
                          {log.details || '—'}
                        </span>
                      </td>
                      <td>
                        <code className="log-ip-code">{log.public_ip || '—'}</code>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          className="btn-view-details" 
                          onClick={() => setSelectedLog(log)}
                          title={language === 'zh' ? '查看详情' : 'View Details'}
                        >
                          <EyeIcon />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted">
                    {t('act_empty')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        {!loading && filteredLogs.length > itemsPerPage && (
          <div className="logs-pagination">
            <button 
              className="page-nav-btn"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
              disabled={currentPage === 1}
              aria-label="Previous page"
            >
              ◀
            </button>
            <span className="page-indicator">
              {language === 'zh' 
                ? `第 ${currentPage} 页，共 ${totalPages} 页 (${filteredLogs.length} 条记录)`
                : `Page ${currentPage} of ${totalPages} (${filteredLogs.length} records)`}
            </span>
            <button 
              className="page-nav-btn"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
              disabled={currentPage === totalPages}
              aria-label="Next page"
            >
              ▶
            </button>
          </div>
        )}
      </div>

      {/* ── Log Details Modal Overlay ── */}
      {selectedLog && (
        <div className="global-modal-overlay" onClick={() => setSelectedLog(null)}>
          <div className="global-modal-content log-detail-modal" onClick={e => e.stopPropagation()}>
            <div className="global-modal-header">
              <h2>{language === 'zh' ? `日志明细 #${selectedLog.id}` : `Log Entry Details #${selectedLog.id}`}</h2>
              <button className="global-modal-close" onClick={() => setSelectedLog(null)}>×</button>
            </div>
            <div className="global-modal-body">
              <div className="details-grid">
                <div className="detail-row">
                  <span className="detail-label">{language === 'zh' ? '事件编号' : 'EVENT ID'}</span>
                  <span className="detail-value"><strong>#{selectedLog.id}</strong></span>
                </div>
                
                <div className="detail-row">
                  <span className="detail-label">{language === 'zh' ? '用户账号' : 'USERNAME'}</span>
                  <span className="detail-value"><code>{selectedLog.username}</code></span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">{language === 'zh' ? '真实姓名' : 'FULL NAME'}</span>
                  <span className="detail-value">{selectedLog.full_name || '—'}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">{language === 'zh' ? '电子邮箱' : 'EMAIL ADDRESS'}</span>
                  <span className="detail-value">{selectedLog.email || '—'}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">{language === 'zh' ? '活动类型' : 'ACTIVITY TYPE'}</span>
                  <span className="detail-value">
                    <span className={`log-pill ${getActivityBadgeClass(selectedLog.activity_type)}`}>
                      {selectedLog.activity_type}
                    </span>
                  </span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">{language === 'zh' ? '时间戳' : 'TIMESTAMP'}</span>
                  <span className="detail-value">{new Date(selectedLog.created_at).toLocaleString()}</span>
                </div>

                <div className="detail-row">
                  <span className="detail-label">{language === 'zh' ? '客户端IP' : 'CLIENT IP'}</span>
                  <span className="detail-value"><code>{selectedLog.public_ip || '—'}</code></span>
                </div>

                <div className="detail-row full-width">
                  <span className="detail-label">{language === 'zh' ? '事件说明' : 'DESCRIPTION DETAILS'}</span>
                  <div className="detail-description-block">
                    {selectedLog.details || '—'}
                  </div>
                </div>
              </div>
            </div>
            <div className="global-modal-footer">
              <button className="btn-modal-close" onClick={() => setSelectedLog(null)}>
                {language === 'zh' ? '关闭' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
