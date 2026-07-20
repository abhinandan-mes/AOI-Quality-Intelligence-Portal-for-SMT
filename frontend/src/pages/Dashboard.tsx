import React, { useEffect, useState } from 'react';
import { Grid, Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart } from 'recharts';
import { io } from 'socket.io-client';
import axios from 'axios';

interface SummaryData {
  totalInspections: number;
  passCount: number;
  failCount: number;
  falseCalls: number;
  aoiYield: number;
  spiYield: number;
  overallYield: number;
}

interface HourlyData {
  hour: string;
  AOI_Pass: number;
  AOI_Fail: number;
  SPI_Pass: number;
  SPI_Fail: number;
}

export default function Dashboard() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [summaryRes, hourlyRes] = await Promise.all([
        axios.get('http://localhost:5050/api/dashboard/summary'),
        axios.get('http://localhost:5050/api/dashboard/hourly')
      ]);
      setSummary(summaryRes.data);
      setHourlyData(hourlyRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Listen for real-time updates from the File Watcher Service
    const socket = io('http://localhost:5050');
    socket.on('new_inspection', () => {
      fetchData(); // Refetch data smoothly when a new file is imported
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', mb: 3 }}>
        Live Production Dashboard
      </Typography>

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderLeft: '4px solid #1d4ed8' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2" textTransform="uppercase" fontWeight="bold">
                Total Inspections
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#0f172a' }}>
                {summary?.totalInspections || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderLeft: '4px solid #10b981' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2" textTransform="uppercase" fontWeight="bold">
                Overall Yield
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#10b981' }}>
                {summary?.overallYield || 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderLeft: '4px solid #ef4444' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2" textTransform="uppercase" fontWeight="bold">
                Total NG (Fails)
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#ef4444' }}>
                {summary?.failCount || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', borderLeft: '4px solid #f59e0b' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom variant="subtitle2" textTransform="uppercase" fontWeight="bold">
                False Calls
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700, color: '#f59e0b' }}>
                {summary?.falseCalls || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', p: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Hourly Production Volume
            </Typography>
            <Box sx={{ height: 400, width: '100%' }}>
              <ResponsiveContainer>
                <BarChart data={hourlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="hour" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(29, 78, 216, 0.05)' }} />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="AOI_Pass" stackId="a" fill="#1d4ed8" name="AOI Pass" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="AOI_Fail" stackId="a" fill="#ef4444" name="AOI Fail" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="SPI_Pass" stackId="b" fill="#3b82f6" name="SPI Pass" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="SPI_Fail" stackId="b" fill="#f87171" name="SPI Fail" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Card>
        </Grid>
        
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', p: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Machine Performance
            </Typography>
            
            <Box sx={{ mb: 4 }}>
              <Typography color="textSecondary" variant="subtitle2" gutterBottom>AOI Yield</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#1d4ed8' }}>{summary?.aoiYield || 0}%</Typography>
            </Box>
            
            <Box>
              <Typography color="textSecondary" variant="subtitle2" gutterBottom>SPI Yield</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b82f6' }}>{summary?.spiYield || 0}%</Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
