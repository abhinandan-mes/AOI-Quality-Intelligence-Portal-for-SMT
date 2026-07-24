import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  AreaChart, Area 
} from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';
import TimeframeToggle from '../components/TimeframeToggle';

export default function Analytics() {
  const { t } = useLanguage();
  const [lines, setLines] = useState<any[]>([]);
  const [selectedLine, setSelectedLine] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [paretoData, setParetoData] = useState<any[]>([]);
  const [yieldData, setYieldData] = useState<any[]>([]);
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

      const [paretoRes, yieldRes] = await Promise.all([
        axios.get(`http://${window.location.hostname}:5050/api/reports/pareto?${params.toString()}`),
        axios.get(`http://${window.location.hostname}:5050/api/reports/yield?${params.toString()}`)
      ]);

      setParetoData(paretoRes.data);
      setYieldData(yieldRes.data);
    } catch (err) {
      console.error('Failed to fetch analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedLine) {
      fetchAnalytics();
    }
  }, [selectedLine, startDate, endDate]);

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
        <div className="chart-card animate-slide-up">
          <div className="chart-card-title">{t('analytics.yieldTrend')} ({selectedLine || t('analytics.allLines')})</div>
          <div className="chart-card-subtitle">{t('analytics.yieldTrendDesc')}</div>
          <div style={{ height: 350, width: '100%' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#94a3b8' }}>Loading...</div>
            ) : yieldData.length > 0 ? (
              <ResponsiveContainer>
                <AreaChart data={yieldData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorYieldAn" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} unit="%" />
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="yieldRate" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorYieldAn)" name="Yield Rate (%)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#94a3b8' }}>No data</div>
            )}
          </div>
        </div>

        <div className="chart-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="chart-card-title">{t('analytics.defectPareto')} ({selectedLine || t('analytics.allLines')})</div>
          <div className="chart-card-subtitle">{t('analytics.defectParetoDesc')}</div>
          <div style={{ height: 350, width: '100%' }}>
            {loading ? (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#94a3b8' }}>Loading...</div>
            ) : paretoData.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={paretoData} margin={{ top: 20, right: 10, left: -20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" fill="#ef4444" radius={[4, 4, 0, 0]} name="Occurrences" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#94a3b8' }}>No data</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
