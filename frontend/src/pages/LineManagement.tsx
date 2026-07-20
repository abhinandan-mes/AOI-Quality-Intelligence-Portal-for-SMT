import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Reports.css';

interface Line {
  id: string;
  name: string;
  description: string | null;
  isInstalled: boolean;
  aoiWatchPath: string | null;
  spiWatchPath: string | null;
}

export default function LineManagement() {
  const [lines, setLines] = useState<Line[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingLine, setEditingLine] = useState<Line | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isInstalled: true,
    aoiWatchPath: '',
    spiWatchPath: ''
  });

  const fetchLines = async () => {
    try {
      const res = await axios.get('http://localhost:5050/api/lines');
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
        aoiWatchPath: line.aoiWatchPath || '',
        spiWatchPath: line.spiWatchPath || ''
      });
    } else {
      setEditingLine(null);
      setFormData({ name: '', description: '', isInstalled: true, aoiWatchPath: '', spiWatchPath: '' });
    }
    setOpenModal(true);
  };

  const handleClose = () => {
    setOpenModal(false);
  };

  const handleSave = async () => {
    try {
      if (editingLine) {
        await axios.put(`http://localhost:5050/api/lines/${editingLine.id}`, formData);
      } else {
        await axios.post('http://localhost:5050/api/lines', formData);
      }
      fetchLines();
      handleClose();
    } catch (error) {
      console.error('Error saving line', error);
    }
  };

  const handleToggle = async (line: Line) => {
    try {
      await axios.put(`http://localhost:5050/api/lines/${line.id}`, { ...line, isInstalled: !line.isInstalled });
      fetchLines();
    } catch (error) {
      console.error('Error toggling line', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this line?')) return;
    try {
      await axios.delete(`http://localhost:5050/api/lines/${id}`);
      fetchLines();
    } catch (error) {
      console.error('Error deleting line', error);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '32px' }}>
        <div style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid #f3f3f3', borderTop: '3px solid #415fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="reports-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 className="premium-heading-gradient" style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>Line Management</h2>
          <p style={{ color: '#64748b', marginTop: '8px' }}>Configure production lines and network paths for automated file processing.</p>
        </div>
        <button className="btn-action-approve" style={{ backgroundColor: '#415fff', padding: '10px 20px' }} onClick={() => handleOpen()}>
          + Add New Line
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
        {lines.map(line => (
          <div key={line.id} className="premium-machine-card" style={{ borderTop: `4px solid ${line.isInstalled ? '#10b981' : '#94a3b8'}`, padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>{line.name}</h3>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input 
                  type="checkbox" 
                  checked={line.isInstalled} 
                  onChange={() => handleToggle(line)} 
                  style={{ marginRight: '8px' }}
                />
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Active</span>
              </label>
            </div>
            
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '16px', minHeight: '40px' }}>
              {line.description || 'No description provided'}
            </p>

            <div style={{ marginBottom: '8px' }}>
              <span className="meta-label">AOI WATCH PATH</span>
              <div style={{ fontFamily: 'monospace', backgroundColor: '#f1f5f9', padding: '6px 8px', borderRadius: '4px', fontSize: '0.85rem', color: '#334155' }}>
                {line.aoiWatchPath || 'Not configured'}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <span className="meta-label">SPI WATCH PATH</span>
              <div style={{ fontFamily: 'monospace', backgroundColor: '#f1f5f9', padding: '6px 8px', borderRadius: '4px', fontSize: '0.85rem', color: '#334155' }}>
                {line.spiWatchPath || 'Not configured'}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
              <button className="toggle-details-btn" onClick={() => handleOpen(line)}>Edit</button>
              <button className="toggle-details-btn" style={{ color: '#ef4444', borderColor: '#fca5a5' }} onClick={() => handleDelete(line.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {openModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="premium-machine-card" style={{ width: '100%', maxWidth: '500px', padding: '24px' }}>
            <h2 style={{ marginTop: 0, marginBottom: '20px', fontSize: '1.2rem', color: '#1e293b' }}>
              {editingLine ? 'Edit Line' : 'Add New Line'}
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label className="meta-label">LINE NAME</label>
                <input 
                  type="text" 
                  className="premium-modal-textarea"
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                />
              </div>
              <div>
                <label className="meta-label">DESCRIPTION</label>
                <input 
                  type="text" 
                  className="premium-modal-textarea"
                  value={formData.description} 
                  onChange={(e) => setFormData({...formData, description: e.target.value})} 
                />
              </div>
              <div>
                <label className="meta-label">AOI WATCH PATH (E.G. E:\\Line1_AOI)</label>
                <input 
                  type="text" 
                  className="premium-modal-textarea"
                  value={formData.aoiWatchPath} 
                  onChange={(e) => setFormData({...formData, aoiWatchPath: e.target.value})} 
                />
              </div>
              <div>
                <label className="meta-label">SPI WATCH PATH (E.G. E:\\Line1_SPI)</label>
                <input 
                  type="text" 
                  className="premium-modal-textarea"
                  value={formData.spiWatchPath} 
                  onChange={(e) => setFormData({...formData, spiWatchPath: e.target.value})} 
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button className="toggle-details-btn" onClick={handleClose}>Cancel</button>
              <button className="btn-action-approve" onClick={handleSave} disabled={!formData.name} style={{ backgroundColor: '#415fff', opacity: !formData.name ? 0.5 : 1 }}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
