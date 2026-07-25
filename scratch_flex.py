import os

files = [
    "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/SpiDashboard.tsx",
    "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/PostAoiDashboard.tsx",
    "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/PreAoiDashboard.tsx"
]

for file_path in files:
    if not os.path.exists(file_path): continue
    with open(file_path, "r") as f:
        content = f.read()

    # In dashboard-main, the last card is:
    # <div className="table-card" style={{ padding: '20px 24px' }}>
    # or similar
    # We replace it with flex: 1
    content = content.replace(
        """<div className="table-card" style={{ padding: '20px 24px' }}>
          <div className="table-header-flex">
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>{t('dashboard.recentInspections')}</h3>""",
        """<div className="table-card" style={{ padding: '20px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="table-header-flex">
            <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a' }}>{t('dashboard.recentInspections')}</h3>"""
    )
    
    # In dashboard-sidebar, the last card is:
    # <div className="chart-card" style={{ marginTop: '24px', paddingBottom: '24px' }}>
    content = content.replace(
        """<div className="chart-card" style={{ marginTop: '24px', paddingBottom: '24px' }}>
          <div className="chart-card-title">{t('dashboard.topLines')""",
        """<div className="chart-card" style={{ marginTop: '24px', paddingBottom: '24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="chart-card-title">{t('dashboard.topLines')"""
    )

    with open(file_path, "w") as f:
        f.write(content)

