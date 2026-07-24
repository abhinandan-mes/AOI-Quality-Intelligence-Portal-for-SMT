import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Reports.css';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { useLanguage } from '../contexts/LanguageContext';

export default function DefectSearch() {
  const { t } = useLanguage();
  const [defectType, setDefectType] = useState('');
  const [componentName, setComponentName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [lineName, setLineName] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showExportMenu, setShowExportMenu] = useState(false);

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const fetchDefects = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      if (defectType) params.append('defectType', defectType);
      if (componentName) params.append('componentName', componentName);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (lineName) params.append('lineName', lineName);

      const response = await axios.get(`http://${window.location.hostname}:5050/api/defects?${params.toString()}`);
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch defects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDefects();
  }, []);

  const handleSearch = () => {
    setPage(0);
    fetchDefects();
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];
        
        // Handle nested properties for sorting
        if (sortConfig.key === 'barcode') {
          valA = a.inspection?.barcode || '';
          valB = b.inspection?.barcode || '';
        } else if (sortConfig.key === 'machine') {
          valA = a.inspection?.machine?.name || '';
          valB = b.inspection?.machine?.name || '';
        } else if (sortConfig.key === 'line') {
          valA = a.inspection?.machine?.line?.name || '';
          valB = b.inspection?.machine?.line?.name || '';
        } else if (sortConfig.key === 'timestamp') {
          valA = a.inspection?.inspectionTime || a.createdAt;
          valB = b.inspection?.inspectionTime || b.createdAt;
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const getRowData = (row: any) => ({
    Barcode: row.inspection?.barcode || '-',
    Line: row.inspection?.machine?.line?.name || '-',
    Machine: row.inspection?.machine?.name || '-',
    'Component Name': row.componentName || '-',
    'Defect Type': row.defectType || '-',
    'Repair Status': row.repairStatus || '-',
    Timestamp: new Date(row.inspection?.inspectionTime || row.createdAt).toLocaleString()
  });

  const exportToCSV = () => {
    if (sortedData.length === 0) return;
    const headers = ['Barcode', 'Line', 'Machine', 'Component Name', 'Defect Type', 'Repair Status', 'Timestamp'];
    const csvContent = [
      headers.join(','),
      ...sortedData.map(row => {
        const d = getRowData(row);
        return [
          `"${d.Barcode}"`,
          `"${d.Line}"`,
          `"${d.Machine}"`,
          `"${d['Component Name']}"`,
          `"${d['Defect Type']}"`,
          `"${d['Repair Status']}"`,
          `"${d.Timestamp}"`
        ].join(',');
      })
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'defect_search.csv';
    link.click();
  };

  const exportToExcel = () => {
    if (sortedData.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(sortedData.map(getRowData));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Defects");
    XLSX.writeFile(workbook, "defect_search.xlsx");
  };

  const exportToDoc = () => {
    if (sortedData.length === 0) return;
    let htmlContent = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Defect Search</title></head><body>";
    htmlContent += "<h2>Defect Search Report</h2><table border='1' style='border-collapse:collapse;width:100%;'><tr><th>{t('search.colBarcode')}</th><th>{t('search.colLine')}</th><th>{t('search.colMachine')}</th><th>{t('search.colComponent')}</th><th>{t('search.colDefectType')}</th><th>Status</th><th>Timestamp</th></tr>";
    
    sortedData.forEach(row => {
      const d = getRowData(row);
      htmlContent += `<tr>
        <td>${d.Barcode}</td>
        <td>${d.Line}</td>
        <td>${d.Machine}</td>
        <td>${d['Component Name']}</td>
        <td>${d['Defect Type']}</td>
        <td>${d['Repair Status']}</td>
        <td>${d.Timestamp}</td>
      </tr>`;
    });
    htmlContent += "</table></body></html>";
    
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'defect_search.doc';
    link.click();
  };

  const exportToPDF = () => {
    if (sortedData.length === 0) return;
    const doc = new jsPDF('landscape');
    const tableColumn = ["Barcode", "Line", "Machine", "Component", "Defect Type", "Status", "Timestamp"];
    const tableRows: any[] = [];

    sortedData.forEach(row => {
      const d = getRowData(row);
      tableRows.push([
        d.Barcode,
        d.Line,
        d.Machine,
        d['Component Name'],
        d['Defect Type'],
        d['Repair Status'],
        d.Timestamp
      ]);
    });

    doc.text("Defect Search Report", 14, 15);
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [220, 38, 38] } // Reddish for defects
    });
    doc.save("defect_search.pdf");
  };

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  return (
    <div className="reports-container animate-fade-in">
      <div className="page-header-card">
        <div className="title-area">
          <h1>{t('menu.search')}</h1>
          <div className="subtitle">{t('defectSearch.subtitle')}</div>
        </div>
      </div>

      <div className="premium-toolbar animate-slide-up">
        <div className="toolbar-filters">
          <div className="filter-group">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="filter-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Defect Type (e.g. Tombstone)"
              value={defectType} 
              onChange={(e) => setDefectType(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{ width: '180px' }}
            />
          </div>
          <div className="filter-divider"></div>
          <div className="filter-group">
            <input 
              type="text" 
              placeholder="Component (e.g. R101)"
              value={componentName} 
              onChange={(e) => setComponentName(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{ width: '150px' }}
            />
          </div>
          <div className="filter-divider"></div>
          <div className="filter-group">
            <input 
              type="text" 
              placeholder="Line (e.g. Line-401)"
              value={lineName} 
              onChange={(e) => setLineName(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              style={{ width: '130px' }}
            />
          </div>
          <div className="filter-divider"></div>
          <div className="filter-group date-group">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <span className="date-separator">{t('history.to')}</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <button className="btn-primary-search" onClick={handleSearch}>
            {t('history.search')}
          </button>
        </div>

        <div className="toolbar-actions">
          <div className="export-dropdown-container">
            <button className="btn-export-dropdown" onClick={() => setShowExportMenu(!showExportMenu)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              {t('history.exportData')}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px', marginLeft: '4px' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            {showExportMenu && (
              <div className="export-menu" onMouseLeave={() => setShowExportMenu(false)}>
                <button className="export-menu-item csv" onClick={() => { exportToCSV(); setShowExportMenu(false); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  Export as CSV
                </button>
                <button className="export-menu-item excel" onClick={() => { exportToExcel(); setShowExportMenu(false); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line><polyline points="10.5 12 12 15 13.5 12"></polyline></svg>
                  Export as Excel
                </button>
                <button className="export-menu-item doc" onClick={() => { exportToDoc(); setShowExportMenu(false); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  Export as Word
                </button>
                <button className="export-menu-item pdf" onClick={() => { exportToPDF(); setShowExportMenu(false); }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                  Export as PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <div className="machine-card-rejection animate-slide-up" style={{ marginBottom: '20px' }}>{error}</div>}

      <div className="premium-table-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="report-table-wrap">
          <table className="report-table premium-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('barcode')} style={{ cursor: 'pointer' }} className="sortable-header">
                  {t('history.colBarcode')} {sortConfig?.key === 'barcode' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => handleSort('line')} style={{ cursor: 'pointer' }} className="sortable-header">
                  {t('history.colLine')} {sortConfig?.key === 'line' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => handleSort('machine')} style={{ cursor: 'pointer' }} className="sortable-header">
                  {t('history.colMachine')} {sortConfig?.key === 'machine' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => handleSort('componentName')} style={{ cursor: 'pointer' }} className="sortable-header">
                  {t('dashboard.component')} {sortConfig?.key === 'componentName' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => handleSort('defectType')} style={{ cursor: 'pointer' }} className="sortable-header">
                  {t('dashboard.defect')} {sortConfig?.key === 'defectType' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th>{t('history.colStatus')}</th>
                <th onClick={() => handleSort('timestamp')} style={{ cursor: 'pointer' }} className="sortable-header">
                  {t('history.colTimestamp')} {sortConfig?.key === 'timestamp' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="skeleton-row">
                    <td><div className="skeleton-box" style={{ width: '120px' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '80px' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '80px' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '90px' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '110px' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '70px', borderRadius: '12px' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '140px' }}></div></td>
                  </tr>
                ))
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="premium-empty-state">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                      <h4>No Defects Found</h4>
                      <p>Try adjusting your search criteria to find defect records.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                  <tr key={row.id}>
                    <td className="barcode-cell">{row.inspection?.barcode || '-'}</td>
                    <td className="text-muted">{row.inspection?.machine?.line?.name || '-'}</td>
                    <td className="text-muted">{row.inspection?.machine?.name || '-'}</td>
                    <td><span className="defect-badge">{row.componentName || '-'}</span></td>
                    <td style={{ color: '#ef4444', fontWeight: 500 }}>{row.defectType || '-'}</td>
                    <td>
                      <span className={`status-badge ${row.repairStatus === 'REPAIRED' ? 'status-approved' : row.repairStatus === 'PENDING' ? 'status-submitted' : 'status-disapproved'}`}>
                        {row.repairStatus || 'PENDING'}
                      </span>
                    </td>
                    <td className="text-muted">{new Date(row.inspection?.inspectionTime || row.createdAt).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && sortedData.length > 0 && (
          <div className="premium-pagination">
            <span className="pagination-info">
              Showing {page * rowsPerPage + 1} to {Math.min((page + 1) * rowsPerPage, sortedData.length)} of {sortedData.length} entries
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
