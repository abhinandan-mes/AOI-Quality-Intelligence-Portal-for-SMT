import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Reports.css';
import * as XLSX from 'xlsx';
import { useLanguage } from '../contexts/LanguageContext';
import TimeframeToggle from '../components/TimeframeToggle';

export default function SpcExplorer() {
  const { t } = useLanguage();
  const [barcode, setBarcode] = useState('');
  const [componentName, setComponentName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [lineName, setLineName] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);
  
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(20);
  const [totalRecords, setTotalRecords] = useState(0);

  const fetchSpcData = async (currentPage: number = 0) => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      if (barcode) params.append('barcode', barcode);
      if (componentName) params.append('componentName', componentName);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (lineName) params.append('lineName', lineName);
      params.append('page', currentPage.toString());
      params.append('limit', rowsPerPage.toString());

      const response = await axios.get(`http://${window.location.hostname}:5050/api/spc?${params.toString()}`);
      setData(response.data.data);
      setTotalRecords(response.data.total);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch SPC data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpcData(0);
  }, []);

  const handleSearch = () => {
    setPage(0);
    fetchSpcData(0);
  };

  const exportToCSV = async () => {
    if (totalRecords === 0) return;
    try {
      const params = new URLSearchParams();
      if (barcode) params.append('barcode', barcode);
      if (componentName) params.append('componentName', componentName);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (lineName) params.append('lineName', lineName);
      params.append('limit', '100000'); // large limit for export

      const response = await axios.get(`http://${window.location.hostname}:5050/api/spc?${params.toString()}`);
      const exportData = response.data.data;

      const headers = ['Barcode', 'Line', 'Machine', 'Model', 'Component', 'Height', 'Area', 'Volume', 'Offset X', 'Offset Y', 'Date'];
      const csvContent = [
        headers.join(','),
        ...exportData.map((row: any) => [
          row.inspection?.barcode || '',
          row.inspection?.machine?.line?.name || '',
          row.inspection?.machine?.name || '',
          row.inspection?.productModel?.name || '',
          row.componentName,
          row.height?.toFixed(4) || '',
          row.area?.toFixed(4) || '',
          row.volume?.toFixed(4) || '',
          row.offsetX?.toFixed(4) || '',
          row.offsetY?.toFixed(4) || '',
          new Date(row.createdAt).toLocaleString()
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'spc_data.csv';
      link.click();
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const exportToExcel = async () => {
    if (totalRecords === 0) return;
    try {
      const params = new URLSearchParams();
      if (barcode) params.append('barcode', barcode);
      if (componentName) params.append('componentName', componentName);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (lineName) params.append('lineName', lineName);
      params.append('limit', '100000');

      const response = await axios.get(`http://${window.location.hostname}:5050/api/spc?${params.toString()}`);
      const exportData = response.data.data;

      const worksheet = XLSX.utils.json_to_sheet(exportData.map((row: any) => ({
        Barcode: row.inspection?.barcode || '',
        Line: row.inspection?.machine?.line?.name || '',
        Machine: row.inspection?.machine?.name || '',
        Model: row.inspection?.productModel?.name || '',
        Component: row.componentName,
        Height: row.height,
        Area: row.area,
        Volume: row.volume,
        'Offset X': row.offsetX,
        'Offset Y': row.offsetY,
        Date: new Date(row.createdAt).toLocaleString()
      })));
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "SPC Data");
      XLSX.writeFile(workbook, "spc_data.xlsx");
    } catch (err) {
      console.error('Export failed', err);
    }
  };

  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
    fetchSpcData(newPage);
  };

  return (
    <div className="reports-container animate-fade-in">
      <div className="page-header-card">
        <div className="title-area">
          <h1>SPC Data Explorer</h1>
          <div className="subtitle">Search, filter, and export granular Component-Level SPC metrics.</div>
        </div>

        <div className="export-dropdown-container">
            <button className="btn-export-dropdown" onClick={() => setShowExportMenu(!showExportMenu)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Export SPC Data
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px', marginLeft: '4px' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            {showExportMenu && (
              <div className="export-menu" onMouseLeave={() => setShowExportMenu(false)}>
                <button className="export-menu-item csv" onClick={() => { exportToCSV(); setShowExportMenu(false); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  Export CSV
                </button>
                <button className="export-menu-item excel" onClick={() => { exportToExcel(); setShowExportMenu(false); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line><polyline points="10.5 12 12 15 13.5 12"></polyline></svg>
                  Export Excel
                </button>
              </div>
            )}
          </div>
      </div>

      {/* Unified Toolbar */}
      <div className="premium-toolbar animate-slide-up">
        <div className="toolbar-filters">
          <div className="filter-group">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="filter-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Barcode..."
              value={barcode} 
              onChange={(e) => setBarcode(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{ width: '120px' }}
            />
          </div>
          <div className="filter-divider"></div>
          <div className="filter-group">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="filter-icon"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
            <input 
              type="text" 
              placeholder="Line (e.g. Line 1)"
              value={lineName} 
              onChange={(e) => setLineName(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{ width: '130px' }}
            />
          </div>
          <div className="filter-divider"></div>
          <div className="filter-group">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="filter-icon"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
            <input 
              type="text" 
              placeholder="Component Name"
              value={componentName} 
              onChange={(e) => setComponentName(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{ width: '130px' }}
            />
          </div>
          <div className="filter-divider"></div>
          <div className="filter-group date-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TimeframeToggle 
              currentStart={startDate} 
              currentEnd={endDate} 
              onDatesChange={(start, end) => { setStartDate(start); setEndDate(end); }} 
            />
            <div style={{ width: '1px', height: '20px', backgroundColor: '#e2e8f0', margin: '0 4px' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '2px 8px' }}>
              <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', color: '#475569', fontSize: '0.85rem' }} />
            </div>
            <span className="date-separator" style={{ margin: '0' }}>to</span>
            <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '2px 8px' }}>
              <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ border: 'none', background: 'transparent', outline: 'none', color: '#475569', fontSize: '0.85rem' }} />
            </div>
          </div>
          <button className="btn-primary-search" onClick={handleSearch} style={{ marginLeft: 'auto' }}>
            Search
          </button>
        </div>
      </div>

      {error && <div className="machine-card-rejection animate-slide-up" style={{ marginBottom: '20px' }}>{error}</div>}

      <div className="premium-table-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="report-table-wrap">
          <table className="report-table premium-table">
            <thead>
              <tr>
                <th>Barcode</th>
                <th>Line</th>
                <th>Component</th>
                <th>Height</th>
                <th>Area</th>
                <th>Volume</th>
                <th>Offset X / Y</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="skeleton-row">
                    <td><div className="skeleton-box" style={{ width: '120px' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '80px' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '90px' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '50px' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '50px' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '50px' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '70px' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '140px' }}></div></td>
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="premium-empty-state">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                      <h4>No SPC Records Found</h4>
                      <p>Adjust your search filters or check if SPI data has been imported.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row.id}>
                    <td className="barcode-cell">{row.inspection?.barcode || '-'}</td>
                    <td className="text-muted">{row.inspection?.machine?.line?.name || '-'}</td>
                    <td style={{ fontWeight: 500, color: '#334155' }}>{row.componentName}</td>
                    <td>{row.height !== null ? row.height.toFixed(4) : '-'}</td>
                    <td>{row.area !== null ? row.area.toFixed(4) : '-'}</td>
                    <td>{row.volume !== null ? row.volume.toFixed(4) : '-'}</td>
                    <td className="text-muted">
                      {row.offsetX !== null ? row.offsetX.toFixed(4) : '-'} / {row.offsetY !== null ? row.offsetY.toFixed(4) : '-'}
                    </td>
                    <td className="text-muted">{new Date(row.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && data.length > 0 && (
          <div className="premium-pagination">
            <span className="pagination-info">
              Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, totalRecords)} of {totalRecords} entries
            </span>
            <div className="pagination-controls">
              <button 
                className="pagination-btn" 
                disabled={page === 0} 
                onClick={() => handleChangePage(page - 1)}
              >
                Previous
              </button>
              <span className="pagination-current">{page + 1}</span>
              <button 
                className="pagination-btn" 
                disabled={page >= totalPages - 1} 
                onClick={() => handleChangePage(page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
