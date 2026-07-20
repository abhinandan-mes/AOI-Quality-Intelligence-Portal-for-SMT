import React, { useEffect, useState } from 'react';
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
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '64px' }}>
        <div style={{ display: 'inline-block', width: '24px', height: '24px', border: '3px solid #f3f3f3', borderTop: '3px solid #415fff', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      </div>
    );
  }

  return (
    <div className="reports-container">
      <div className="reports-heading">
        <div>
          <h2 className="premium-heading-gradient" style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>Live Production Dashboard</h2>
          <p style={{ color: '#64748b', marginTop: '8px' }}>Real-time system metrics and quality intelligence.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
        
        <div className="premium-kpi-card" style={{ borderLeft: '4px solid #1d4ed8' }}>
          <div>
            <span className="meta-label">TOTAL INSPECTIONS</span>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginTop: '8px' }}>
              {summary?.totalInspections || 0}
            </div>
          </div>
        </div>

        <div className="premium-kpi-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div>
            <span className="meta-label">OVERALL YIELD</span>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#10b981', marginTop: '8px' }}>
              {summary?.overallYield || 0}%
            </div>
          </div>
        </div>

        <div className="premium-kpi-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div>
            <span className="meta-label">TOTAL NG (FAILS)</span>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#ef4444', marginTop: '8px' }}>
              {summary?.failCount || 0}
            </div>
          </div>
        </div>

        <div className="premium-kpi-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div>
            <span className="meta-label">FALSE CALLS</span>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f59e0b', marginTop: '8px' }}>
              {summary?.falseCalls || 0}
            </div>
          </div>
        </div>

      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
        
        <div className="premium-machine-card" style={{ padding: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '24px' }}>
            Hourly Production Volume
          </h3>
          <div style={{ height: '400px', width: '100%' }}>
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
          </div>
        </div>
        
        <div className="premium-machine-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700, color: '#1e293b', marginBottom: '32px' }}>
            Machine Performance
          </h3>
          
          <div style={{ marginBottom: '32px' }}>
            <span className="meta-label">AOI YIELD</span>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#1d4ed8', marginTop: '8px' }}>
              {summary?.aoiYield || 0}%
            </div>
          </div>
          
          <div>
            <span className="meta-label">SPI YIELD</span>
            <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#3b82f6', marginTop: '8px' }}>
              {summary?.spiYield || 0}%
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
