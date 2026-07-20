import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Grid, MenuItem, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, 
  Paper, CircularProgress, Chip 
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import axios from 'axios';

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
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Grid container spacing={2} alignItems="flex-end">
          <Grid item xs={12} md={3}>
            <Typography variant="caption" fontWeight="bold" color="textSecondary" mb={0.5} display="block">BARCODE</Typography>
            <TextField 
              fullWidth 
              variant="outlined" 
              size="small"
              value={barcode} 
              onChange={(e) => setBarcode(e.target.value)} 
              placeholder="Scan or type barcode..."
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Typography variant="caption" fontWeight="bold" color="textSecondary" mb={0.5} display="block">STATUS</Typography>
            <TextField 
              fullWidth 
              select 
              size="small"
              value={status} 
              onChange={(e) => setStatus(e.target.value)}
              SelectProps={{ displayEmpty: true }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              <MenuItem value="PASS">PASS</MenuItem>
              <MenuItem value="FAIL">FAIL</MenuItem>
              <MenuItem value="WARNING">WARNING</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2.5}>
            <Typography variant="caption" fontWeight="bold" color="textSecondary" mb={0.5} display="block">START DATE</Typography>
            <TextField 
              fullWidth 
              size="small"
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
            />
          </Grid>
          <Grid item xs={12} md={2.5}>
            <Typography variant="caption" fontWeight="bold" color="textSecondary" mb={0.5} display="block">END DATE</Typography>
            <TextField 
              fullWidth 
              size="small"
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button 
              fullWidth 
              variant="contained" 
              size="small" 
              sx={{ height: 40 }} 
              onClick={handleSearch}
              startIcon={<SearchIcon />}
            >
              Search
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#f8fafc' }}>
            <TableRow>
              <TableCell fontWeight="bold">Time</TableCell>
              <TableCell fontWeight="bold">Barcode</TableCell>
              <TableCell align="center">Machine</TableCell>
              <TableCell align="center">Side</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Block Count</TableCell>
              <TableCell align="left">Defect Locations & Phenomenon</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 10 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>No data found for the given criteria.</TableCell>
              </TableRow>
            ) : (
                data.map((row) => (
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
                            {Array.from(new Set(row.defects.map(d => d.blockId).filter(Boolean))).length}
                          </Typography>
                        ) : (
                          <Typography variant="caption" color="textSecondary">-</Typography>
                        )}
                      </TableCell>
                      <TableCell align="left">
                        {row.defects && row.defects.length > 0 ? (
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {row.defects.map((d, i) => (
                              <Chip 
                                key={i} 
                                label={`[Block ${d.blockId || '?'}] ${d.componentName} - ${d.defectType}`} 
                                size="small" 
                                color="error" 
                                variant="outlined"
                                sx={{ fontWeight: 500, bgcolor: '#fef2f2' }}
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
