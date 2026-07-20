import React, { useEffect, useState } from 'react';
import { 
  Box, Typography, Card, CardContent, Grid, Button, Switch, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, 
  CircularProgress, IconButton 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

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
    return <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>;
  }

  const installedCount = lines.filter(l => l.isInstalled).length;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Line Management</Typography>
          <Typography color="textSecondary">Configure production lines and network paths for automated file processing.</Typography>
        </Box>
        <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Add New Line
        </Button>
      </Box>

      <Grid container spacing={3}>
        {lines.map(line => (
          <Grid item xs={12} md={6} lg={4} key={line.id}>
            <Card sx={{ 
              borderRadius: 3, 
              borderTop: `4px solid ${line.isInstalled ? '#10b981' : '#94a3b8'}`,
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h6" fontWeight="bold">{line.name}</Typography>
                  <Switch 
                    checked={line.isInstalled} 
                    onChange={() => handleToggle(line)} 
                    color="success"
                  />
                </Box>
                
                <Typography variant="body2" color="textSecondary" mb={2}>
                  {line.description || 'No description provided'}
                </Typography>

                <Box mb={1}>
                  <Typography variant="caption" color="textSecondary" fontWeight="bold" textTransform="uppercase">AOI Watch Path</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: '#f1f5f9', p: 0.5, borderRadius: 1 }}>
                    {line.aoiWatchPath || 'Not configured'}
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Typography variant="caption" color="textSecondary" fontWeight="bold" textTransform="uppercase">SPI Watch Path</Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: '#f1f5f9', p: 0.5, borderRadius: 1 }}>
                    {line.spiWatchPath || 'Not configured'}
                  </Typography>
                </Box>

                <Box display="flex" justifyContent="flex-end" gap={1}>
                  <IconButton size="small" onClick={() => handleOpen(line)} color="primary"><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => handleDelete(line.id)} color="error"><DeleteIcon fontSize="small" /></IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openModal} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingLine ? 'Edit Line' : 'Add New Line'}</DialogTitle>
        <DialogContent dividers>
          <TextField 
            label="Line Name" 
            fullWidth 
            margin="normal" 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
          />
          <TextField 
            label="Description" 
            fullWidth 
            margin="normal" 
            value={formData.description} 
            onChange={(e) => setFormData({...formData, description: e.target.value})} 
          />
          <TextField 
            label="AOI Watch Path (e.g. E:\Line1_AOI)" 
            fullWidth 
            margin="normal" 
            value={formData.aoiWatchPath} 
            onChange={(e) => setFormData({...formData, aoiWatchPath: e.target.value})} 
            helperText="The network or local path where this line's AOI machines drop files."
          />
          <TextField 
            label="SPI Watch Path (e.g. E:\Line1_SPI)" 
            fullWidth 
            margin="normal" 
            value={formData.spiWatchPath} 
            onChange={(e) => setFormData({...formData, spiWatchPath: e.target.value})} 
            helperText="The network or local path where this line's SPI machines drop files."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={!formData.name}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
