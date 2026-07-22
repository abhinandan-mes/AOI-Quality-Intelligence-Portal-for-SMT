import { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useLanguage } from '../contexts/LanguageContext';

export default function Dashboard() {
  const { t } = useLanguage();
  const [timeframe, setTimeframe] = useState<'today' | 'weekly' | 'monthly'>('weekly');
  const [summary, setSummary] = useState<any>({ totalInspections: 0, passCount: 0, defectCount: 0, activeMachinesCount: 0 });
  const [trendData, setTrendData] = useState<any[]>([]);
  const [distData, setDistData] = useState<any[]>([]);
  const [topComponents, setTopComponents] = useState<any[]>([]);
  const [recentInspections, setRecentInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [summaryRes, dataRes] = await Promise.all([
        axios.get(`http://${window.location.hostname}:5050/api/dashboard/summary?timeframe=${timeframe}`),
        axios.get(`http://${window.location.hostname}:5050/api/dashboard/data?timeframe=${timeframe}`)
      ]);
      setSummary(summaryRes.data);
      setTrendData(dataRes.data.trendData);
      setDistData(dataRes.data.distData);
      setTopComponents(dataRes.data.topComponents);
      setRecentInspections(dataRes.data.recentInspections);
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const getStatusColor = (status: string) => {
    const s = status.toUpperCase();
    if (['PASS', 'GOOD'].includes(s)) return '#10b981'; // Green
    if (['FAIL', 'NG'].includes(s)) return '#ef4444'; // Red
    if (['WARNING'].includes(s)) return '#f59e0b'; // Orange
    return '#3b82f6'; // Blue
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1 className="premium-heading-gradient" style={{ margin: 0, fontSize: '2.2rem', fontWeight: 700, letterSpacing: '-0.5px' }}>{t('menu.dashboard')}</h1>
          <div className="subtitle">
            {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')} | Last refreshed {new Date().toLocaleTimeString()}
          </div>
        </div>
        
        <div className="timeframe-toggle">
          <button 
            className={`timeframe-btn ${timeframe === 'today' ? 'active' : ''}`}
            onClick={() => setTimeframe('today')}
          >
            Today
          </button>
          <button 
            className={`timeframe-btn ${timeframe === 'weekly' ? 'active' : ''}`}
            onClick={() => setTimeframe('weekly')}
          >
            Weekly
          </button>
          <button 
            className={`timeframe-btn ${timeframe === 'monthly' ? 'active' : ''}`}
            onClick={() => setTimeframe('monthly')}
          >
            Monthly
          </button>
        </div>
      </div>

      <div className="summary-cards-grid">
        <div className="summary-card blue">
          <div className="summary-card-title">{t('dashboard.totalInspections')}</div>
          <div className="summary-card-value">{summary.totalInspections.toLocaleString()}</div>
          <div className="summary-card-subtitle">Total panel barcodes</div>
        </div>
        <div className="summary-card green">
          <div className="summary-card-title">{t('dashboard.passedBoards')}</div>
          <div className="summary-card-value">{summary.passCount.toLocaleString()}</div>
          <div className="summary-card-subtitle">Boards passed inspection</div>
        </div>
        <div className="summary-card orange">
          <div className="summary-card-title">{t('dashboard.defectsDetected')}</div>
          <div className="summary-card-value">{summary.defectCount.toLocaleString()}</div>
          <div className="summary-card-subtitle">Total individual defects</div>
        </div>
        <div className="summary-card teal">
          <div className="summary-card-title">{t('dashboard.activeMachines')}</div>
          <div className="summary-card-value">{summary.activeMachinesCount.toLocaleString()}</div>
          <div className="summary-card-subtitle">In-progress sessions</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-card-title">Output Trend</div>
          <div className="chart-card-subtitle">Inspections by {timeframe === 'today' ? 'hour' : 'day'} (selected range)</div>
          <div style={{ height: 300, width: '100%' }}>
            {!loading && trendData.length > 0 ? (
              <ResponsiveContainer>
                <BarChart data={trendData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={60} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Loading...</div>
            )}
          </div>
        </div>

        <div className="chart-card">
          <div className="chart-card-title">Yield Distribution</div>
          <div className="chart-card-subtitle">Pass vs Fail ratio</div>
          <div style={{ height: 300, width: '100%', position: 'relative' }}>
            {!loading && distData.length > 0 ? (
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={distData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {distData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getStatusColor(entry.name)} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>Loading...</div>
            )}
            
            {/* Custom Legend to match screenshot dot style */}
            <div style={{ position: 'absolute', right: 10, top: '40%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {distData.map((d, i) => (
                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: '#334155', fontWeight: 600 }}>
                  <div style={{ width: '8px', height: '8px', backgroundColor: getStatusColor(d.name) }}></div>
                  {d.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="tables-grid">
        <div className="table-card" style={{ padding: '20px 24px' }}>
          <div className="table-header-flex">
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>Top Defective Components</h3>
            <div className="status-live-dot">Live</div>
          </div>
          
          <table className="vivo-table" style={{ marginTop: '16px' }}>
            <thead>
              <tr>
                <th>#</th>
                <th>Component</th>
                <th>Defect</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              {topComponents.length > 0 ? topComponents.map((comp, idx) => (
                <tr key={idx}>
                  <td style={{ color: '#64748b' }}>{idx + 1}</td>
                  <td style={{ fontWeight: 700 }}>{comp.component}</td>
                  <td style={{ color: '#ef4444' }}>{comp.defectType}</td>
                  <td>{comp.count}</td>
                </tr>
              )) : (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>No defect data</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-card" style={{ padding: '20px 24px' }}>
          <div className="table-header-flex">
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>Recent Inspections</h3>
            <button style={{ background: 'transparent', border: '1px solid #e2e8f0', padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', color: '#64748b', cursor: 'pointer' }}>⬇ Export CSV</button>
          </div>
          
          <table className="vivo-table" style={{ marginTop: '16px' }}>
            <thead>
              <tr>
                <th>Barcode</th>
                <th>Line</th>
                <th>Machine</th>
                <th>Status</th>
                <th>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {recentInspections.length > 0 ? recentInspections.map((insp, idx) => (
                <tr key={idx}>
                  <td style={{ color: '#3b82f6', fontWeight: 600 }}>{insp.barcode}</td>
                  <td>{insp.line}</td>
                  <td>{insp.machine}</td>
                  <td>
                    <span style={{ color: ['PASS', 'GOOD'].includes(insp.status) ? '#10b981' : '#ef4444', fontWeight: 600, fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: 4, height: 4, borderRadius: '50%', background: ['PASS', 'GOOD'].includes(insp.status) ? '#10b981' : '#ef4444' }}></div>
                      {insp.status}
                    </span>
                  </td>
                  <td style={{ color: '#64748b' }}>{insp.timestamp}</td>
                </tr>
              )) : (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: '#94a3b8', padding: '24px' }}>No recent inspections</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
