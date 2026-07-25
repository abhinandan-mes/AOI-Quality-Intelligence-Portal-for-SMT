with open("/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/PreAoiDashboard.tsx", "r") as f:
    content = f.read()

content = content.replace(
    "`http://${window.location.hostname}:5050/api/dashboard/data?timeframe=${timeframe}&machineType=PRE_AOI`",
    "`http://${window.location.hostname}:5050/api/dashboard/data?timeframe=${timeframe}&machineType=PRE_AOI&limit=10`"
)

content = content.replace(
    "{t('dashboard.topLines') || 'Top 5 Lines by Defects'}",
    "'Top 10 Lines by Defects'"
)

with open("/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/PreAoiDashboard.tsx", "w") as f:
    f.write(content)
