import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Reports.css';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  AreaChart, Area 
} from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useLanguage } from '../contexts/LanguageContext';
import TimeframeToggle from '../components/TimeframeToggle';

export default function Reports() {
  const { t } = useLanguage();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [paretoData, setParetoData] = useState<any[]>([]);
  const [yieldData, setYieldData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatingReport, setGeneratingReport] = useState(false);

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const [paretoRes, yieldRes] = await Promise.all([
        axios.get(`http://${window.location.hostname}:5050/api/reports/pareto?${params.toString()}`),
        axios.get(`http://${window.location.hostname}:5050/api/reports/yield?${params.toString()}`)
      ]);

      setParetoData(paretoRes.data);
      setYieldData(yieldRes.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, []);

  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const reportElement = document.getElementById('report-dashboard');
      if (!reportElement) return;

      const canvas = await html2canvas(reportElement, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
      pdf.save('quality_intelligence_report.pdf');
    } catch (err) {
      console.error('Failed to generate PDF report', err);
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <div className="reports-container animate-fade-in">
      <div className="page-header-card">
        <div className="title-area">
          <h1>{t('menu.reports')}</h1>
          <div className="subtitle">{t('reports.subtitle')}</div>
        </div>
        
        <button 
          className="btn-primary-search" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px' }}
          onClick={handleGenerateReport}
          disabled={generatingReport || loading}
        >
          {generatingReport ? (
            t('reports.generating')
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              {t('reports.generatePdf')}
            </>
          )}
        </button>
      </div>

      <div className="premium-toolbar animate-slide-up" style={{ marginBottom: '24px' }}>
        <div className="toolbar-filters">
          <div className="filter-group date-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>{t('reports.filterRange')}</span>
            <TimeframeToggle 
              currentStart={startDate} 
              currentEnd={endDate} 
              onDatesChange={(start, end) => { setStartDate(start); setEndDate(end); }} 
            />
            <div style={{ width: '1px', height: '24px', backgroundColor: '#e2e8f0', margin: '0 4px' }}></div>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <span className="date-separator">{t('history.to')}</span>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <button className="btn-primary-search" onClick={fetchReportsData}>
            {t('reports.updateDashboard')}
          </button>
        </div>
      </div>

      {error && <div className="machine-card-rejection animate-slide-up" style={{ marginBottom: '20px' }}>{error}</div>}

      <div id="report-dashboard">
        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          
          {/* Pareto Chart */}
          <div className="premium-table-card animate-slide-up" style={{ animationDelay: '0.1s', padding: '24px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '24px', color: '#0f172a', fontSize: '1.2rem', fontWeight: 700 }}>{t('reports.topDefects')}</h3>
            <div style={{ width: '100%', height: 350 }}>
              {loading ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t('reports.loadingChart')}</div>
              ) : paretoData.length > 0 ? (
                <ResponsiveContainer>
                  <BarChart data={paretoData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Occurrences" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>{t('reports.noDefectData')}</div>
              )}
            </div>
          </div>

          {/* Yield Trend Chart */}
          <div className="premium-table-card animate-slide-up" style={{ animationDelay: '0.2s', padding: '24px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '24px', color: '#0f172a', fontSize: '1.2rem', fontWeight: 700 }}>{t('reports.yieldTrend')}</h3>
            <div style={{ width: '100%', height: 350 }}>
              {loading ? (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t('reports.loadingChart')}</div>
              ) : yieldData.length > 0 ? (
                <ResponsiveContainer>
                  <AreaChart data={yieldData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorYield" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} unit="%" />
                    <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                    <Legend />
                    <Area type="monotone" dataKey="yieldRate" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorYield)" name="Yield Rate (%)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>{t('reports.noYieldData')}</div>
              )}
            </div>
          </div>
        </div>

        {/* Aggregated Summary Data Table */}
        <div className="premium-table-card animate-slide-up" style={{ animationDelay: '0.3s', marginTop: '24px' }}>
          <div style={{ padding: '24px', paddingBottom: '0' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#0f172a', fontSize: '1.2rem', fontWeight: 700 }}>{t('reports.yieldTable')}</h3>
          </div>
          <div className="report-table-wrap">
            <table className="report-table premium-table">
              <thead>
                <tr>
                  <th>{t('reports.colDate')}</th>
                  <th>{t('reports.colTotal')}</th>
                  <th>{t('reports.colPassed')}</th>
                  <th>{t('reports.colFailed')}</th>
                  <th>{t('reports.colYieldRate')}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="skeleton-row">
                      <td><div className="skeleton-box" style={{ width: '100px' }}></div></td>
                      <td><div className="skeleton-box" style={{ width: '80px' }}></div></td>
                      <td><div className="skeleton-box" style={{ width: '80px' }}></div></td>
                      <td><div className="skeleton-box" style={{ width: '80px' }}></div></td>
                      <td><div className="skeleton-box" style={{ width: '60px' }}></div></td>
                    </tr>
                  ))
                ) : yieldData.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8' }}>{t('reports.noYieldTableData')}</td>
                  </tr>
                ) : (
                  yieldData.map((row, idx) => {
                    const total = row.pass + row.fail;
                    return (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600 }}>{row.date}</td>
                        <td>{total}</td>
                        <td style={{ color: '#16a34a' }}>{row.pass}</td>
                        <td style={{ color: '#dc2626' }}>{row.fail}</td>
                        <td>
                          <span className={`badge-eqtype ${row.yieldRate >= 95 ? 'eq-SPI' : 'eq-POST_AOI'}`}>
                            {row.yieldRate}%
                          </span>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
