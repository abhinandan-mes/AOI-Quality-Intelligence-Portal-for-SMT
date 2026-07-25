import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Reports.css';
import { 
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LabelList,
  AreaChart, Area 
} from 'recharts';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useLanguage } from '../contexts/LanguageContext';
import TimeframeToggle from '../components/TimeframeToggle';

export default function Reports() {
  const paretoColors = ['#dc2626', '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#06b6d4', '#3b82f6'];

  const { t } = useLanguage();
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [spiPareto, setSpiPareto] = useState<any[]>([]);
  const [preAoiPareto, setPreAoiPareto] = useState<any[]>([]);
  const [postAoiPareto, setPostAoiPareto] = useState<any[]>([]);
  
  const [spiYield, setSpiYield] = useState<any[]>([]);
  const [postAoiYield, setPostAoiYield] = useState<any[]>([]);
  
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
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, [startDate, endDate]);

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

  const renderPareto = (data: any[], title: string) => (
    <div className="premium-table-card animate-slide-up" style={{ padding: '24px', flex: 1, minWidth: '400px' }}>
      <h3 style={{ marginTop: 0, marginBottom: '24px', color: '#0f172a', fontSize: '1.2rem', fontWeight: 700 }}>{title} (Top 10)</h3>
      <div style={{ width: '100%', height: 350 }}>
        {loading ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t('reports.loadingChart') || 'Loading...'}</div>
        ) : data.length > 0 ? (
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
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
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>{t('reports.noDefectData') || 'No Data'}</div>
        )}
      </div>
    </div>
  );

  const renderYield = (data: any[], title: string) => (
    <div className="premium-table-card animate-slide-up" style={{ padding: '24px', flex: 1, minWidth: '400px' }}>
      <h3 style={{ marginTop: 0, marginBottom: '24px', color: '#0f172a', fontSize: '1.2rem', fontWeight: 700 }}>{title}</h3>
      <div style={{ width: '100%', height: 350 }}>
        {loading ? (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{t('reports.loadingChart') || 'Loading...'}</div>
        ) : data.length > 0 ? (
          <ResponsiveContainer>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`colorYield-${title.replace(/\s/g,'')}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} unit="%" />
              <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
              <Legend />
              <Area type="monotone" dataKey="yieldRate" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill={`url(#colorYield-${title.replace(/\s/g,'')})`} name="Yield Rate (%)">
                <LabelList dataKey="yieldRate" position="top" fill="#10b981" fontSize={12} formatter={(val: any) => `${val}%`} />
              </Area>
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>{t('reports.noYieldData') || 'No Data'}</div>
        )}
      </div>
    </div>
  );

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
              {t('reports.generatePdf') || 'Generate PDF'}
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

        </div>
      </div>

      {error && <div className="machine-card-rejection animate-slide-up" style={{ marginBottom: '20px' }}>{error}</div>}

      <div id="report-dashboard">
        {/* SPI Section */}
        <h2 style={{ color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '16px' }}>SPI Reports</h2>
        <div style={{ display: 'flex', gap: '24px', marginBottom: '40px', flexWrap: 'wrap' }}>
          {renderPareto(spiPareto, 'SPI Top Defects')}
          {renderYield(spiYield, 'SPI Yield Trend')}
        </div>

        {/* POST AOI Section */}
        <h2 style={{ color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '16px' }}>Post AOI Reports</h2>
        <div style={{ display: 'flex', gap: '24px', marginBottom: '40px', flexWrap: 'wrap' }}>
          {renderPareto(postAoiPareto, 'Post AOI Top Defects')}
          {renderYield(postAoiYield, 'Post AOI Yield Trend')}
        </div>

        {/* PRE AOI Section */}
        <h2 style={{ color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginBottom: '16px' }}>Pre AOI Reports</h2>
        <div style={{ display: 'flex', gap: '24px', marginBottom: '40px', flexWrap: 'wrap' }}>
          {renderPareto(preAoiPareto, 'Pre AOI Top Defects')}
          
          <div className="premium-table-card animate-slide-up" style={{ padding: '24px', flex: 1, minWidth: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', border: '1px dashed #cbd5e1' }}>
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
