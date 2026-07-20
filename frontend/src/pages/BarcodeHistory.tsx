import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Grid, MenuItem, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, CircularProgress, Chip 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import TableViewIcon from '@mui/icons-material/TableView';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import axios from 'axios';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Inspection {
  id: string;
  barcode: string;
  inspectionTime: string;
  status: string;
  side: string | null;
  machine: {
    name: string;
    type: string;
    line: { name: string };
  };
  productModel: {
    name: string;
  };
  defects: {
    componentName: string;
    defectType: string;
    blockId?: string;
  }[];
  spiHeightAvg: number | null;
  spiAreaAvg: number | null;
  spiVolumeAvg: number | null;
}

export default function BarcodeHistory() {
  const [data, setData] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [barcode, setBarcode] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (barcode) params.append('barcode', barcode);
      if (status) params.append('status', status);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await axios.get(`http://localhost:5050/api/inspections?${params.toString()}`);
      setData(response.data);
    } catch (error) {
      console.error('Error searching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

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
        let aValue: any = a;
        let bValue: any = b;
        
        if (sortConfig.key === 'machine') {
          aValue = a.machine.line.name + a.machine.type;
          bValue = b.machine.line.name + b.machine.type;
        } else if (sortConfig.key === 'side') {
          aValue = a.side || '';
          bValue = b.side || '';
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

  const renderSortIcon = (key: string) => {
    if (sortConfig?.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="inherit" /> : <ArrowDownwardIcon fontSize="inherit" />;
  };

  const exportToCSV = () => {
    const ws = XLSX.utils.json_to_sheet(sortedData.map(d => ({
      Time: new Date(d.inspectionTime).toLocaleString(),
      Barcode: d.barcode,
      Machine: `${d.machine.line.name} (${d.machine.type})`,
      Side: d.side || '-',
      Status: d.status,
      BlockCount: Array.from(new Set(d.defects.map(df => df.blockId).filter(Boolean))).length,
      Defects: d.defects.map(df => `[Block ${df.blockId || '?'}] ${df.componentName} - ${df.defectType}`).join('; ')
    })));
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'barcode_history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(sortedData.map(d => ({
      Time: new Date(d.inspectionTime).toLocaleString(),
      Barcode: d.barcode,
      Machine: `${d.machine.line.name} (${d.machine.type})`,
      Side: d.side || '-',
      Status: d.status,
      BlockCount: Array.from(new Set(d.defects.map(df => df.blockId).filter(Boolean))).length,
      Defects: d.defects.map(df => `[Block ${df.blockId || '?'}] ${df.componentName} - ${df.defectType}`).join('; ')
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "History");
    XLSX.writeFile(wb, "barcode_history.xlsx");
  };

  const exportToPDF = () => {
    const doc = new jsPDF('landscape');
    doc.text("Barcode History", 14, 15);
    (doc as any).autoTable({
      head: [['Time', 'Barcode', 'Machine', 'Side', 'Status', 'Defects']],
      body: sortedData.map(d => [
        new Date(d.inspectionTime).toLocaleString(),
        d.barcode,
        `${d.machine.line.name} (${d.machine.type})`,
        d.side || '-',
        d.status,
        d.defects.map(df => `[${df.blockId}] ${df.componentName}`).join(', ')
      ]),
      startY: 20,
      styles: { fontSize: 8 }
    });
    doc.save('barcode_history.pdf');
  };

  const exportToDoc = () => {
    const header = "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body>";
    const footer = "</body></html>";
    const tableHTML = `
      <table border="1" style="border-collapse: collapse; width: 100%;">
        <tr><th>Time</th><th>Barcode</th><th>Machine</th><th>Side</th><th>Status</th><th>Defects</th></tr>
        ${sortedData.map(d => `
          <tr>
            <td>${new Date(d.inspectionTime).toLocaleString()}</td>
            <td>${d.barcode}</td>
            <td>${d.machine.line.name} (${d.machine.type})</td>
            <td>${d.side || '-'}</td>
            <td>${d.status}</td>
            <td>${d.defects.map(df => `[${df.blockId}] ${df.componentName} - ${df.defectType}`).join(', ')}</td>
          </tr>
        `).join('')}
      </table>
    `;
    const sourceHTML = header + tableHTML + footer;
    const blob = new Blob(['\ufeff', sourceHTML], { type: 'application/msword' });
    const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'barcode_history.doc';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    // Initial fetch to show some recent data
    handleSearch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" mb={1}>Barcode History & Data Search</Typography>
      <Typography color="textSecondary" mb={3}>Search and filter through historical AOI and SPI inspection records.</Typography>

      {/* Advanced Search Panel */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', bgcolor: '#ffffff', border: '1px solid #e2e8f0' }}>
        <Grid container spacing={2.5} alignItems="flex-end">
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="caption" fontWeight="bold" color="textSecondary" mb={0.5} display="block" sx={{ letterSpacing: 0.5 }}>BARCODE</Typography>
            <TextField 
              fullWidth 
              variant="outlined" 
              size="small"
              value={barcode} 
              onChange={(e) => setBarcode(e.target.value)} 
              placeholder="Scan or type barcode..."
              InputProps={{
                sx: { borderRadius: 1.5, bgcolor: '#f8fafc' }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="caption" fontWeight="bold" color="textSecondary" mb={0.5} display="block" sx={{ letterSpacing: 0.5 }}>STATUS</Typography>
            <TextField 
              fullWidth 
              select 
              size="small"
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              SelectProps={{ displayEmpty: true }}
              InputProps={{
                sx: { borderRadius: 1.5, bgcolor: '#f8fafc' }
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="PASS">PASS</MenuItem>
              <MenuItem value="FAIL">FAIL</MenuItem>
              <MenuItem value="WARNING">WARNING</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="caption" fontWeight="bold" color="textSecondary" mb={0.5} display="block" sx={{ letterSpacing: 0.5 }}>START DATE</Typography>
            <TextField 
              fullWidth 
              size="small"
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              InputProps={{
                sx: { borderRadius: 1.5, bgcolor: '#f8fafc' }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="caption" fontWeight="bold" color="textSecondary" mb={0.5} display="block" sx={{ letterSpacing: 0.5 }}>END DATE</Typography>
            <TextField 
              fullWidth 
              size="small"
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              InputProps={{
                sx: { borderRadius: 1.5, bgcolor: '#f8fafc' }
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button 
              fullWidth 
              variant="contained" 
              size="large" 
              sx={{ height: 42, borderRadius: 1.5, textTransform: 'none', fontWeight: 'bold', fontSize: '1rem', boxShadow: 'none', '&:hover': { boxShadow: '0 4px 12px rgba(25, 118, 210, 0.2)' } }} 
              onClick={handleSearch}
              startIcon={<SearchIcon />}
              disableElevation
            >
              Search Data
            </Button>
          </Grid>
        </Grid>
        
        {/* Export Options */}
        <Box display="flex" justifyContent="flex-end" alignItems="center" mt={3} gap={1} pt={2} borderTop="1px solid #f1f5f9">
            <Typography variant="caption" fontWeight="bold" color="textSecondary" mr={1}>EXPORT AS:</Typography>
            <Button size="small" variant="outlined" startIcon={<TableViewIcon />} onClick={exportToCSV} sx={{ borderRadius: 1.5, textTransform: 'none' }}>CSV</Button>
            <Button size="small" variant="outlined" startIcon={<TableViewIcon />} onClick={exportToExcel} color="success" sx={{ borderRadius: 1.5, textTransform: 'none' }}>Excel</Button>
            <Button size="small" variant="outlined" startIcon={<DescriptionIcon />} onClick={exportToDoc} color="info" sx={{ borderRadius: 1.5, textTransform: 'none' }}>Doc</Button>
            <Button size="small" variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={exportToPDF} color="error" sx={{ borderRadius: 1.5, textTransform: 'none' }}>PDF</Button>
        </Box>
      </Paper>

      {/* Results Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell fontWeight="bold">Time</TableCell>
              <TableCell fontWeight="bold">Barcode</TableCell>
              <TableCell align="center" onClick={() => handleSort('machine')} sx={{ cursor: 'pointer', fontWeight: 'bold', userSelect: 'none', '&:hover': { bgcolor: '#f1f5f9' } }}>
                Machine {renderSortIcon('machine')}
              </TableCell>
              <TableCell align="center" onClick={() => handleSort('side')} sx={{ cursor: 'pointer', fontWeight: 'bold', userSelect: 'none', '&:hover': { bgcolor: '#f1f5f9' } }}>
                Side {renderSortIcon('side')}
              </TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Block</TableCell>
              <TableCell align="left">Defect Location</TableCell>
              <TableCell align="left">Phenomenon</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : sortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>No data found for the given criteria.</TableCell>
              </TableRow>
            ) : (
                sortedData.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{new Date(row.inspectionTime).toLocaleString()}</TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{row.barcode}</TableCell>
                    <TableCell align="center">
                      <Box display="flex" flexDirection="column" alignItems="center" gap={0.5}>
                        <Typography variant="body2" fontWeight="bold">{row.machine.line.name}</Typography>
                        <Chip 
                          label={row.machine.type} 
                          size="small" 
                          sx={{ 
                            fontSize: '0.65rem', 
                            height: 20, 
                            bgcolor: row.machine.type === 'SPI' ? '#e0f2fe' : '#fce7f3',
                            color: row.machine.type === 'SPI' ? '#0369a1' : '#be185d',
                            fontWeight: 'bold'
                          }} 
                        />
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      {row.side ? (
                        <Chip label={row.side} size="small" variant="outlined" color={row.side === 'TOP' ? 'primary' : 'secondary'} />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={row.status} 
                          size="small" 
                          color={['PASS', 'GOOD'].includes(row.status) ? 'success' : ['FAIL', 'NG'].includes(row.status) ? 'error' : 'warning'} 
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {row.defects && row.defects.length > 0 ? (
                          <Typography variant="body2" fontWeight="medium">
                            {Array.from(new Set(row.defects.map(d => d.blockId).filter(Boolean))).join(', ')}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="textSecondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell align="left">
                        {row.defects && row.defects.length > 0 ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {row.defects.map((d, i) => (
                              <Chip 
                                key={i} 
                                label={`[Block ${d.blockId || '?'}] ${d.componentName}`} 
                                size="small" 
                                color="error" 
                                variant="outlined"
                                sx={{ fontWeight: 500, bgcolor: '#fef2f2', width: 'fit-content' }}
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell align="left">
                        {row.defects && row.defects.length > 0 ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                            {row.defects.map((d, i) => (
                              <Chip 
                                key={i} 
                                label={d.defectType} 
                                size="small" 
                                color="error" 
                                variant="outlined"
                                sx={{ fontWeight: 500, bgcolor: '#fef2f2', width: 'fit-content' }}
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        )}
                      </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
      </TableContainer>
    </Box>
  );
}
