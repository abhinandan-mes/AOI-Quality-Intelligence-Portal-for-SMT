import re

files = [
    "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/Reports.tsx",
    "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/Analytics.tsx"
]

for file_path in files:
    with open(file_path, "r") as f:
        content = f.read()

    # 1. Update useEffect dependency array
    if "fetchReportsData();\n  }, []);" in content:
        content = content.replace("fetchReportsData();\n  }, []);", "fetchReportsData();\n  }, [startDate, endDate]);")
    
    if "fetchAnalytics();\n  }, []);" in content:
        content = content.replace("fetchAnalytics();\n  }, []);", "fetchAnalytics();\n  }, [startDate, endDate, selectedLine]);")

    # 2. Remove the "Update Dashboard" button block
    button_html_reports = """          <button className="btn-primary-search" onClick={fetchReportsData}>
            {t('reports.updateDashboard')}
          </button>"""
    button_html_reports2 = """          <button className="btn-primary-search" onClick={fetchReportsData}>
            {t('reports.updateDashboard') || 'Update Dashboard'}
          </button>"""
    button_html_analytics = """          <button className="btn-primary-search" onClick={fetchAnalytics}>
            {t('analytics.update')}
          </button>"""

    content = content.replace(button_html_reports, "")
    content = content.replace(button_html_reports2, "")
    content = content.replace(button_html_analytics, "")

    with open(file_path, "w") as f:
        f.write(content)

