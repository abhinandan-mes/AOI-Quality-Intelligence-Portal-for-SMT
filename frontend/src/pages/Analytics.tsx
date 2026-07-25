import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LabelList,
  AreaChart, Area 
} from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import TimeframeToggle from '../components/TimeframeToggle';

export default function Analytics() {
  const paretoColors = ['#dc2626', '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#06b6d4', '#3b82f6'];

  const { t } = useLanguage();
  const [lines, setLines] = useState<any[]>([]);
  const [selectedLine, setSelectedLine] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [spiPareto, setSpiPareto] = useState<any[]>([]);
  const [preAoiPareto, setPreAoiPareto] = useState<any[]>([]);
  const [postAoiPareto, setPostAoiPareto] = useState<any[]>([]);
  
  const [spiYield, setSpiYield] = useState<any[]>([]);
  const [postAoiYield, setPostAoiYield] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch available lines for the dropdown
    axios.get(`http://${window.location.hostname}:5050/api/lines`)
      .then(res => {
        setLines(res.data);
        if (res.data.length > 0) setSelectedLine(res.data[0].name);
      })
      .catch(err => console.error('Error fetching lines for analytics', err));
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedLine) params.append('lineName', selectedLine);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const [spiP, preP, postP, spiY, postY] = await Promise.all([
        axios.get(`http://${window.location.hostname}:5050/api/reports/pareto?${params.toString()}&machineType=SPI`),
        axios.get(`http://${window.location.hostname}:5050/api/reports/pareto?${params.toString()}&machineType=PRE_AOI`),
        axios.get(`http://${window.location.hostname}:5050/api/reports/pareto?${params.toString()}&machineType=POST_AOI`),
        axios.get(`http://${window.location.hostname}:5050/api/reports/yield?${params.toString()}&machineType=SPI`),
        axios.get(`http://${window.location.hostname}:5050/api/reports/yield?${params.toString()}&machineType=POST_AOI`)
      ]);

      setSpiPareto(spiP.data);
      setPreAoiPareto(preP.data);
      setPostAoiPareto(postP.data);
      setSpiYield(spiY.data);
      setPostAoiYield(postY.data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Don't wait for selectedLine if we want to show all lines
    fetchAnalytics();
  }, [selectedLine, startDate, endDate]);

  const renderPareto = (data: any[], title: string) => (
    <div className="chart-card animate-slide-up" style={{ flex: 1, minWidth: '400px' }}>
      <div className="chart-card-title">{title} ({selectedLine || t('analytics.allLines')})</div>
      <div className="chart-card-subtitle">{t('analytics.defectParetoDesc')}</div>
      <div style={{ height: 350, width: '100%', marginTop: '16px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#94a3b8' }}>Loading...</div>
        ) : data.length > 0 ? (
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} name="Occurrences">
                {data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={paretoColors[index % paretoColors.length]} />
                ))}
                <LabelList dataKey="count" position="top" fill="#64748b" fontSize={12} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#94a3b8' }}>No data</div>
        )}
      </div>
    </div>
  );

  const renderYield = (data: any[], title: string) => (
    <div className="chart-card animate-slide-up" style={{ flex: 1, minWidth: '400px' }}>
      <div className="chart-card-title">{title} ({selectedLine || t('analytics.allLines')})</div>
      <div className="chart-card-subtitle">{t('analytics.yieldTrendDesc')}</div>
      <div style={{ height: 350, width: '100%', marginTop: '16px' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#94a3b8' }}>Loading...</div>
        ) : data.length > 0 ? (
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`colorYieldAn-${title.replace(/\s/g,'')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} unit="%" />
              <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="yieldRate" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill={`url(#colorYieldAn-${title.replace(/\s/g,'')})`} name="Yield Rate (%)">
                <LabelList dataKey="yieldRate" position="top" fill="#3b82f6" fontSize={12} formatter={(val: any) => `${val}%`} />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#94a3b8' }}>No data</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="dashboard-container animate-fade-in">
      <div className="page-header-card">
        <div className="title-area">
          <h1>{t('menu.analytics')}</h1>
          <div className="subtitle">{t('analytics.subtitle')}</div>
        </div>
        
        <div className="action-area" style={{ display: 'flex', gap: '12px', background: 'white', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', alignItems: 'center' }}>
          <TimeframeToggle 
            currentStart={startDate} 
            currentEnd={endDate} 
            onDatesChange={(start, end) => { setStartDate(start); setEndDate(end); }} 
          />
          <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0', margin: '0 4px' }}></div>
          <select 
            value={selectedLine} 
            onChange={(e) => setSelectedLine(e.target.value)}
            style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }}
          >
            <option value="">{t('analytics.allLines')}</option>
            {lines.map(l => <option key={l.id} value={l.name}>{l.name}</option>)}
          </select>

          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '4px' }}/>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '6px 12px', border: '1px solid #cbd5e1', borderRadius: '4px' }}/>
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        {/* SPI Section */}
        <h2 style={{ color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '16px' }}>SPI Analytics</h2>
        <div style={{ display: 'flex', gap: '24px', marginBottom: '40px', flexWrap: 'wrap' }}>
          {renderPareto(spiPareto, 'SPI Defect Pareto')}
          {renderYield(spiYield, 'SPI Yield Trend')}
        </div>

        {/* POST AOI Section */}
        <h2 style={{ color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '16px' }}>Post AOI Analytics</h2>
        <div style={{ display: 'flex', gap: '24px', marginBottom: '40px', flexWrap: 'wrap' }}>
          {renderPareto(postAoiPareto, 'Post AOI Defect Pareto')}
          {renderYield(postAoiYield, 'Post AOI Yield Trend')}
        </div>

        {/* PRE AOI Section */}
        <h2 style={{ color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '16px' }}>Pre AOI Analytics</h2>
        <div style={{ display: 'flex', gap: '24px', marginBottom: '40px', flexWrap: 'wrap' }}>
          {renderPareto(preAoiPareto, 'Pre AOI Defect Pareto')}
          
          <div className="chart-card animate-slide-up" style={{ flex: 1, minWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '48px', height: '48px', marginBottom: '16px' }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <h3 style={{ marginTop: 0, marginBottom: '8px', color: '#334155', fontSize: '1.1rem', fontWeight: 600 }}>Yield Trend Not Available</h3>
            <p style={{ color: '#64748b', textAlign: 'center', maxWidth: '300px', lineHeight: '1.5' }}>
              Pre AOI good board data is not currently available from the machines, so accurate yield trend data cannot be calculated or shown.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
