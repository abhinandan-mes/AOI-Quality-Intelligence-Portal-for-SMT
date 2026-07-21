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
    <div className="reports-container">
      <div className="reports-heading">
        <div>
          <h2 className="premium-heading-gradient" style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>Barcode History & Data Search</h2>
          <p style={{ color: '#64748b', marginTop: '8px' }}>Search and filter through historical AOI and SPI inspection records.</p>
        </div>
      </div>

      <div className="premium-kpi-card" style={{ flexDirection: 'column', alignItems: 'stretch', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: '16px', alignItems: 'flex-end', width: '100%' }}>
          <div>
            <label className="meta-label">BARCODE</label>
            <input 
              type="text" 
              className="premium-modal-textarea" 
              style={{ height: '38px', padding: '0 12px' }}
              value={barcode} 
              onChange={(e) => setBarcode(e.target.value)} 
              placeholder="Scan or type barcode..."
            />
          </div>
          <div>
            <label className="meta-label">STATUS</label>
            <select 
              className="premium-modal-textarea" 
              style={{ height: '38px', padding: '0 12px' }}
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="PASS">PASS / GOOD</option>
              <option value="FAIL">FAIL / NG</option>
              <option value="WARNING">WARNING</option>
            </select>
          </div>
          <div>
            <label className="meta-label">START DATE</label>
            <input 
              type="date" 
              className="premium-modal-textarea" 
              style={{ height: '38px', padding: '0 12px' }}
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
            />
          </div>
          <div>
            <label className="meta-label">END DATE</label>
            <input 
              type="date" 
              className="premium-modal-textarea" 
              style={{ height: '38px', padding: '0 12px' }}
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
            />
          </div>
          <div>
            <button className="btn-action-approve" style={{ height: '38px', width: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#415fff', boxShadow: 'none' }} onClick={handleSearch}>
              <svg focusable="false" aria-hidden="true" viewBox="0 0 24 24" style={{ width: '20px', height: '20px', fill: 'white' }}><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path></svg>
            </button>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
          <span className="meta-label" style={{ alignSelf: 'center', marginBottom: 0, marginRight: '8px' }}>EXPORT AS:</span>
          <button className="toggle-details-btn" onClick={exportToCSV}>CSV</button>
          <button className="toggle-details-btn" onClick={exportToExcel} style={{ color: '#16a34a', borderColor: '#16a34a' }}>Excel</button>
          <button className="toggle-details-btn" onClick={exportToDoc} style={{ color: '#0284c7', borderColor: '#0284c7' }}>Doc</button>
          <button className="toggle-details-btn" onClick={exportToPDF} style={{ color: '#dc2626', borderColor: '#dc2626' }}>PDF</button>
        </div>
      </div>

      {error && <div className="machine-card-rejection" style={{ marginBottom: '20px' }}>{error}</div>}

      <div className="premium-machine-card" style={{ padding: 0 }}>
        <div className="report-table-wrap" style={{ width: '100%' }}>
          <table className="report-table">
            <thead style={{ position: 'sticky', top: 0, zIndex: 10, background: '#f8fafc' }}>
              <tr>
                <th>Barcode</th>
                <th>Line</th>
                <th onClick={() => handleSort('machine')} style={{ cursor: 'pointer' }}>
                  Machine {sortConfig?.key === 'machine' ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
                </th>
                <th onClick={() => handleSort('side')} style={{ cursor: 'pointer' }}>
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
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '40px' }}>
                    <div style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid #f3f3f3', borderTop: '3px solid #415fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                  </td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', color: '#64748b' }}>No data available</td>
                </tr>
              ) : (
                sortedData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                  <tr key={row.id}>
                    <td style={{ fontWeight: 600 }}>{row.barcode}</td>
                    <td>{row.machine?.line?.name || row.line || '-'}</td>
                    <td><span className={`badge-eqtype eq-${row.machine?.type === 'SPI' ? 'SPI' : 'POST_AOI'}`}>{row.machine?.type || '-'}</span></td>
                    <td>{row.side}</td>
                    <td>
                      <span className={`status-badge ${['PASS', 'GOOD'].includes(row.status) ? 'status-approved' : ['FAIL', 'NG'].includes(row.status) ? 'status-disapproved' : 'status-submitted'}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>{row.defects && row.defects.length > 0 ? Array.from(new Set(row.defects.map((d: any) => d.blockId).filter(Boolean))).join(', ') : '-'}</td>
                    <td>
                      {row.defects && row.defects.length > 0 ? (
                        row.defects.map((d: any, index: number) => (
                          <div key={index} style={{ marginBottom: '4px' }}>
                            <span className="status-badge status-disapproved" style={{ fontSize: '10px', padding: '2px 8px' }}>
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
                    <td style={{ color: '#64748b' }}>{new Date(row.inspectionTime).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {!loading && sortedData.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '16px 24px', borderTop: '1px solid #e2e8f0', width: '100%' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', marginRight: '16px' }}>
                Page {page + 1} of {totalPages}
              </span>
              <button 
                className="toggle-details-btn" 
                disabled={page === 0} 
                onClick={() => handleChangePage(page - 1)}
                style={{ opacity: page === 0 ? 0.5 : 1, cursor: page === 0 ? 'not-allowed' : 'pointer' }}
              >
                Previous
              </button>
              <button 
                className="toggle-details-btn" 
                disabled={page >= totalPages - 1} 
                onClick={() => handleChangePage(page + 1)}
                style={{ opacity: page >= totalPages - 1 ? 0.5 : 1, cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer' }}
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
