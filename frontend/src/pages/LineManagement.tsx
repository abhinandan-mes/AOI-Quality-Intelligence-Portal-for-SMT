import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Dashboard.css'; // Reusing the Dashboard styles for premium look
import { useLanguage } from '../contexts/LanguageContext';

interface Line {
  id: string;
  name: string;
  description: string | null;
  isInstalled: boolean;
  postAoiWatchPath: string | null;
  spiWatchPath: string | null;
  preAoiWatchPath: string | null;
}

export default function LineManagement() {
  const { t } = useLanguage();
  const [lines, setLines] = useState<Line[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingLine, setEditingLine] = useState<Line | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isInstalled: true,
    postAoiWatchPath: '',
    spiWatchPath: '',
    preAoiWatchPath: ''
  });

  const fetchLines = async () => {
    try {
      const res = await axios.get(`http://${window.location.hostname}:5050/api/lines`);
      setLines(res.data);
    } catch (error) {
      console.error('Error fetching lines', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLines();
  }, []);

  const handleOpen = (line?: Line) => {
    if (line) {
      setEditingLine(line);
      setFormData({
        name: line.name,
        description: line.description || '',
        isInstalled: line.isInstalled,
        postAoiWatchPath: line.postAoiWatchPath || '',
        spiWatchPath: line.spiWatchPath || '',
        preAoiWatchPath: line.preAoiWatchPath || ''
      });
    } else {
      setEditingLine(null);
      setFormData({ name: '', description: '', isInstalled: true, postAoiWatchPath: '', spiWatchPath: '', preAoiWatchPath: '' });
    }
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  const handleSave = async () => {
    try {
      if (editingLine) {
        await axios.put(`http://${window.location.hostname}:5050/api/lines/${editingLine.id}`, formData);
      } else {
        await axios.post(`http://${window.location.hostname}:5050/api/lines`, formData);
      }
      fetchLines();
      handleClose();
    } catch (error) {
      console.error('Error saving line', error);
    }
  };

  const handleToggle = async (line: Line) => {
    try {
      await axios.put(`http://${window.location.hostname}:5050/api/lines/${line.id}`, { ...line, isInstalled: !line.isInstalled });
      fetchLines();
    } catch (error) {
      console.error('Error toggling line', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this line?')) return;
    try {
      await axios.delete(`http://${window.location.hostname}:5050/api/lines/${id}`);
      fetchLines();
    } catch (error) {
      console.error('Error deleting line', error);
    }
  };

  const totalLines = lines.length;
  const activeLines = lines.filter(l => l.isInstalled).length;
  const configuredAOI = lines.filter(l => l.postAoiWatchPath).length;
  const configuredSPI = lines.filter(l => l.spiWatchPath).length;

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="dashboard-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="premium-heading-gradient" style={{ margin: 0, fontSize: '2.2rem', fontWeight: 700, letterSpacing: '-0.5px' }}>{t('menu.lines')}</h1>
          <div className="subtitle">{t('lines.subtitle')}</div>
        </div>
        
        <button 
          onClick={() => handleOpen()} 
          style={{ 
            background: '#3b82f6', color: 'white', border: 'none', 
            padding: '10px 20px', borderRadius: '6px', fontWeight: 600, 
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)'
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Add New Line
        </button>
      </div>

      <div className="summary-cards-grid animate-slide-up">
        <div className="summary-card blue">
          <div className="summary-card-title">{t('lines.totalLines')}</div>
          <div className="summary-card-value">{totalLines}</div>
          <div className="summary-card-subtitle">{t('lines.totalLinesDesc')}</div>
        </div>
        <div className="summary-card green">
          <div className="summary-card-title">{t('lines.activeLines')}</div>
          <div className="summary-card-value">{activeLines}</div>
          <div className="summary-card-subtitle">{t('lines.activeLinesDesc')}</div>
        </div>
        <div className="summary-card orange">
          <div className="summary-card-title">{t('lines.postAoiConfigs')}</div>
          <div className="summary-card-value">{configuredAOI}</div>
          <div className="summary-card-subtitle">{t('lines.postAoiPaths')}</div>
        </div>
        <div className="summary-card teal">
          <div className="summary-card-title">{t('lines.spiConfigs')}</div>
          <div className="summary-card-value">{configuredSPI}</div>
          <div className="summary-card-subtitle">{t('lines.spiPaths')}</div>
        </div>
      </div>

      <div className="table-card animate-slide-up" style={{ padding: '24px', animationDelay: '0.1s' }}>
        <div className="table-header-flex">
          <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>{t('lines.configuredLines')}</h3>
        </div>
        
        <div style={{ overflowX: 'auto', marginTop: '16px' }}>
          <table className="vivo-table">
            <thead>
              <tr>
                <th>{t('lines.colName')}</th>
                <th>{t('lines.colDesc')}</th>
                <th>{t('lines.colAoiPath')}</th>
                <th>{t('lines.colSpiPath')}</th>
                <th>{t('lines.colStatus')}</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>{t('lines.loading')}</td></tr>
              ) : lines.length > 0 ? (
                lines.map((line) => (
                  <tr key={line.id}>
                    <td style={{ fontWeight: 700, color: '#1e293b' }}>{line.name}</td>
                    <td style={{ color: '#64748b' }}>{line.description || '-'}</td>
                    <td>
                      <code style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', color: '#475569' }}>
                        {line.postAoiWatchPath || t('lines.notConfigured')}
                      </code>
                    </td>
                    <td>
                      <code style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', color: '#475569' }}>
                        {line.spiWatchPath || t('lines.notConfigured')}
                      </code>
                    </td>
                    <td>
                      <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
                        <input 
                          type="checkbox" 
                          checked={line.isInstalled} 
                          onChange={() => handleToggle(line)} 
                          style={{ accentColor: '#10b981', width: '16px', height: '16px', cursor: 'pointer' }}
                        />
                        {line.isInstalled ? (
                          <span className="status-live-dot" style={{ textTransform: 'capitalize' }}>{t('lines.active')}</span>
                        ) : (
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8' }}>{t('lines.inactive')}</span>
                        )}
                      </label>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button 
                        onClick={() => handleOpen(line)}
                        style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '4px', padding: '6px 12px', fontSize: '0.8rem', color: '#3b82f6', fontWeight: 600, cursor: 'pointer', marginRight: '8px' }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(line.id)}
                        style={{ background: 'none', border: '1px solid #fca5a5', borderRadius: '4px', padding: '6px 12px', fontSize: '0.8rem', color: '#ef4444', fontWeight: 600, cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ color: '#94a3b8', marginBottom: '16px' }}>{t('lines.noLines')}</div>
                    <button onClick={() => handleOpen()} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}>
                      {t('lines.createFirst')}
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {openModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="table-card animate-slide-up" style={{ width: '100%', maxWidth: '500px', padding: '32px' }}>
            <h2 style={{ marginTop: 0, marginBottom: '8px', fontSize: '1.25rem', color: '#0f172a', fontWeight: 700 }}>
              {editingLine ? t('lines.editLine') : t('lines.addLine')}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '24px' }}>
              {t('lines.modalDesc')}
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '32px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>{t('lines.labelName')}</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' }}
                  placeholder="e.g., SMT Line 1"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>{t('lines.labelDesc')}</label>
                <input 
                  type="text" 
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', outline: 'none' }}
                  placeholder="e.g., Main production floor"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>{t('lines.labelAoiPath')}</label>
                <input 
                  type="text" 
                  value={formData.postAoiWatchPath} 
                  onChange={(e) => setFormData({...formData, postAoiWatchPath: e.target.value})} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', fontFamily: 'monospace' }}
                  placeholder="e.g., \\10.172.9.200\shared\AOI"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>{t('lines.labelSpiPath')}</label>
                <input 
                  type="text" 
                  value={formData.spiWatchPath} 
                  onChange={(e) => setFormData({...formData, spiWatchPath: e.target.value})} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', fontFamily: 'monospace' }}
                  placeholder="e.g., \\10.172.9.200\shared\SPI"
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: '8px', textTransform: 'uppercase' }}>{t('lines.preAoiWatchPath') || 'PRE AOI Watch Path'}</label>
                <input 
                  type="text" 
                  value={formData.preAoiWatchPath} 
                  onChange={(e) => setFormData({...formData, preAoiWatchPath: e.target.value})} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', outline: 'none', fontFamily: 'monospace' }}
                  placeholder="e.g., \\10.172.9.200\shared\PRE_AOI"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={handleClose}
                style={{ background: 'transparent', border: 'none', color: '#64748b', fontWeight: 600, padding: '10px 16px', cursor: 'pointer' }}
              >
                {t('lines.cancel')}
              </button>
              <button 
                onClick={handleSave} 
                disabled={!formData.name} 
                style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', opacity: !formData.name ? 0.5 : 1, boxShadow: '0 2px 4px rgba(59, 130, 246, 0.3)' }}
              >
                {t('lines.save')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
