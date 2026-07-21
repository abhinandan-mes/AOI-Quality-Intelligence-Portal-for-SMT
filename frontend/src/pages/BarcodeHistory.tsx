import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Reports.css';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function BarcodeHistory() {
  const [barcode, setBarcode] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Sorting state
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      if (barcode) params.append('barcode', barcode);
      if (status) params.append('status', status);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await axios.get(`http://${window.location.hostname}:5050/api/inspections?${params.toString()}`);
      setData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSearch = () => {
    setPage(0);
    fetchHistory();
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
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const exportToCSV = () => {
    if (sortedData.length === 0) return;
    const headers = ['Barcode', 'Line', 'Machine', 'Side', 'Status', 'Block', 'Defect Location', 'Phenomenon', 'Date'];
    const csvContent = [
      headers.join(','),
      ...sortedData.map(row => [
        row.barcode,
        row.line,
        row.machine?.name || '',
        row.side,
        row.status,
        `"${row.defects?.map((d: any) => d.blockId).join(', ') || ''}"`,
        `"${row.defects?.map((d: any) => d.componentName).join(', ') || ''}"`,
        `"${row.defects?.map((d: any) => d.defectType).join(', ') || ''}"`,
        new Date(row.inspectionTime).toLocaleString()
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'barcode_history.csv';
    link.click();
  };

  const exportToExcel = () => {
    if (sortedData.length === 0) return;
    const worksheet = XLSX.utils.json_to_sheet(sortedData.map(row => ({
      Barcode: row.barcode,
      Line: row.line,
      Machine: row.machine?.name || '',
      Side: row.side,
      Status: row.status,
      Block: row.defects?.map((d: any) => d.blockId).join(', ') || '',
      'Defect Location': row.defects?.map((d: any) => d.componentName).join(', ') || '',
      Phenomenon: row.defects?.map((d: any) => d.defectType).join(', ') || '',
      Date: new Date(row.inspectionTime).toLocaleString()
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "History");
    XLSX.writeFile(workbook, "barcode_history.xlsx");
  };

  const exportToDoc = () => {
    if (sortedData.length === 0) return;
    let htmlContent = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
    htmlContent += "<h2>Barcode History</h2><table border='1' style='border-collapse:collapse;width:100%;'><tr><th>Barcode</th><th>Line</th><th>Machine</th><th>Side</th><th>Status</th><th>Block</th><th>Defect Location</th><th>Phenomenon</th><th>Date</th></tr>";
    
    sortedData.forEach(row => {
      htmlContent += `<tr>
        <td>${row.barcode}</td>
        <td>${row.line}</td>
        <td>${row.machine?.name || ''}</td>
        <td>${row.side}</td>
        <td>${row.status}</td>
        <td>${row.defects?.map((d: any) => d.blockId).join(', ') || ''}</td>
        <td>${row.defects?.map((d: any) => d.componentName).join(', ') || ''}</td>
        <td>${row.defects?.map((d: any) => d.defectType).join(', ') || ''}</td>
        <td>${new Date(row.inspectionTime).toLocaleString()}</td>
      </tr>`;
    });
    htmlContent += "</table></body></html>";
    
    const blob = new Blob(['\ufeff', htmlContent], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'barcode_history.doc';
    link.click();
  };

  const exportToPDF = () => {
    if (sortedData.length === 0) return;
    const doc = new jsPDF('landscape');
    const tableColumn = ["Barcode", "Line", "Machine", "Side", "Status", "Block", "Defect Location", "Phenomenon", "Date"];
    const tableRows: any[] = [];

    sortedData.forEach(row => {
      const rowData = [
        row.barcode,
        row.line,
        row.machine?.name || '',
        row.side,
        row.status,
        row.defects?.map((d: any) => d.blockId).join(', ') || '',
        row.defects?.map((d: any) => d.componentName).join(', ') || '',
        row.defects?.map((d: any) => d.defectType).join(', ') || '',
        new Date(row.inspectionTime).toLocaleString()
      ];
      tableRows.push(rowData);
    });

    doc.text("Barcode History Report", 14, 15);
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [65, 95, 255] }
    });
    doc.save("barcode_history.pdf");
  };

  const handleChangePage = (newPage: number) => {
    setPage(newPage);
  };

  const totalPages = Math.ceil(sortedData.length / rowsPerPage);

  return (
    <div className="reports-container animate-fade-in">
      <div className="reports-heading" style={{ marginBottom: '32px' }}>
        <div>
          <h2 className="premium-heading-gradient" style={{ margin: 0, fontSize: '2.2rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Barcode History</h2>
          <p style={{ color: '#64748b', marginTop: '8px', fontSize: '1rem' }}>Search, filter, and export historical AOI and SPI inspection records.</p>
        </div>
      </div>

      {/* Unified Toolbar */}
      <div className="premium-toolbar animate-slide-up">
        <div className="toolbar-filters">
          <div className="filter-group">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="filter-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input 
              type="text" 
              placeholder="Search barcode..."
              value={barcode} 
              onChange={(e) => setBarcode(e.target.value)} 
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div className="filter-divider"></div>
          <div className="filter-group">
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="PASS">PASS / GOOD</option>
              <option value="FAIL">FAIL / NG</option>
              <option value="WARNING">WARNING</option>
            </select>
          </div>
          <div className="filter-divider"></div>
          <div className="filter-group date-group">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <span className="date-separator">to</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <button className="btn-primary-search" onClick={handleSearch}>
            Search
          </button>
        </div>

        <div className="toolbar-actions">
          <button className="export-icon-btn" onClick={exportToCSV} title="Export as CSV">
            <svg viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="8" y1="13" x2="16" y2="13"></line><line x1="8" y1="17" x2="16" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </button>
          <button className="export-icon-btn excel" onClick={exportToExcel} title="Export as Excel">
            <svg viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line><polyline points="10.5 12 12 15 13.5 12"></polyline></svg>
          </button>
          <button className="export-icon-btn doc" onClick={exportToDoc} title="Export as Word">
            <svg viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </button>
          <button className="export-icon-btn pdf" onClick={exportToPDF} title="Export as PDF">
            <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
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
                <th onClick={() => handleSort('machine')} style={{ cursor: 'pointer' }} className="sortable-header">
                  Machine {sortConfig?.key === 'machine' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => handleSort('side')} style={{ cursor: 'pointer' }} className="sortable-header">
                  Side {sortConfig?.key === 'side' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th>Status</th>
                <th>Block</th>
                <th>Defect Location</th>
                <th>Phenomenon</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="skeleton-row">
                    <td><div className="skeleton-box" style={{ width: '120px' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '80px' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '60px' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '40px' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '60px', borderRadius: '12px' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '50px' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '90px' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '100px' }}></div></td>
                    <td><div className="skeleton-box" style={{ width: '140px' }}></div></td>
                  </tr>
                ))
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="premium-empty-state">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                      <h4>No Inspection Records Found</h4>
                      <p>Try adjusting your search filters or dates to find what you're looking for.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                  <tr key={row.id}>
                    <td className="barcode-cell">{row.barcode}</td>
                    <td className="text-muted">{row.machine?.line?.name || row.line || '-'}</td>
                    <td><span className={`badge-eqtype eq-${row.machine?.type === 'SPI' ? 'SPI' : 'POST_AOI'}`}>{row.machine?.type || '-'}</span></td>
                    <td className="text-muted">{row.side}</td>
                    <td>
                      <span className={`status-badge ${['PASS', 'GOOD'].includes(row.status) ? 'status-approved' : ['FAIL', 'NG'].includes(row.status) ? 'status-disapproved' : 'status-submitted'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="text-muted">{row.defects && row.defects.length > 0 ? Array.from(new Set(row.defects.map((d: any) => d.blockId).filter(Boolean))).join(', ') : '-'}</td>
                    <td>
                      {row.defects && row.defects.length > 0 ? (
                        row.defects.map((d: any, index: number) => (
                          <div key={index} style={{ marginBottom: '4px' }}>
                            <span className="defect-badge">
                              {d.componentName}
                            </span>
                          </div>
                        ))
                      ) : '-'}
                    </td>
                    <td>
                      {row.defects && row.defects.length > 0 ? (
                        row.defects.map((d: any, index: number) => (
                          <div key={index} style={{ marginBottom: '4px', fontSize: '12px', color: '#64748b' }}>
                            {d.defectType}
                          </div>
                        ))
                      ) : '-'}
                    </td>
                    <td className="text-muted">{new Date(row.inspectionTime).toLocaleString()}</td>
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
