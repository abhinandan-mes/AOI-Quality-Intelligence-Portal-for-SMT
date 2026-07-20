import React from 'react';

export default function Dashboard() {
  return (
    <div className="reports-container">
      <div className="reports-heading">
        <div>
          <h2 className="premium-heading-gradient" style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800 }}>Dashboard Overview</h2>
          <p style={{ color: '#64748b', marginTop: '8px' }}>System metrics and quality intelligence.</p>
        </div>
      </div>
      <div className="premium-kpi-card">
        <p>Dashboard is under construction. Please use Barcode History.</p>
      </div>
    </div>
  );
}
