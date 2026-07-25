import re

def fix_loading(file_path):
    with open(file_path, "r") as f:
        content = f.read()

    # Replace trendData conditional
    old_trend = """            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">"""
    new_trend = """            {loading ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>{t('dashboard.loading')}</div>
            ) : trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">"""
    content = content.replace(old_trend, new_trend)

    old_trend_else = """              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>{t('dashboard.loading')}</div>
            )}
          </div>
        </div>"""
    new_trend_else = """              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>{t('dashboard.noDefectData') || 'No Data'}</div>
            )}
          </div>
        </div>"""
    content = content.replace(old_trend_else, new_trend_else)

    # Replace distData conditional
    old_dist = """            {distData.length > 0 ? (
              <ResponsiveContainer width="100%" height="250px">"""
    new_dist = """            {loading ? (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>{t('dashboard.loading')}</div>
            ) : distData.length > 0 ? (
              <ResponsiveContainer width="100%" height="250px">"""
    content = content.replace(old_dist, new_dist)

    old_dist_else = """              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>{t('dashboard.loading')}</div>
            )}"""
    new_dist_else = """              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>{t('dashboard.noDefectData') || 'No Data'}</div>
            )}"""
    content = content.replace(old_dist_else, new_dist_else)

    with open(file_path, "w") as f:
        f.write(content)

fix_loading("/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/SpiDashboard.tsx")
fix_loading("/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/PostAoiDashboard.tsx")
fix_loading("/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/PreAoiDashboard.tsx")
