import re

js_file = "/Users/abhinandan/Documents/vivo-AOI-webapp_update-main/client/src/components/ActivityLog.js"
tsx_file = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/ActivityLogs.tsx"

with open(js_file, "r") as f:
    content = f.read()

# Replace apiService imports and usage
content = content.replace("import apiService from '../services/api';", "import axios from 'axios';")
content = content.replace("apiService.getActivityLogs()", "axios.get(`http://${window.location.hostname}:5050/api/activity-logs`)")
content = content.replace("apiService.getAllUsers()", "axios.get(`http://${window.location.hostname}:5050/api/users`)")

# Change name
content = content.replace("export default function ActivityLog({ currentUser }) {", "export default function ActivityLogs() {\n  const currentUser = { role: 'admin', full_name: 'Admin' };")

# Fix css import
content = content.replace("import './ActivityLog.css';", "import './ActivityLog.css';")

# Fix LanguageContext import path
content = content.replace("import { useLanguage } from '../contexts/LanguageContext';", "import { useLanguage } from '../contexts/LanguageContext';")

with open(tsx_file, "w") as f:
    f.write(content)

print("ActivityLogs.tsx generated")
