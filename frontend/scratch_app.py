import re

file_path = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/App.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Add new imports
content = content.replace(
    "import Dashboard from './pages/Dashboard'",
    "import SpiDashboard from './pages/SpiDashboard'\nimport PostAoiDashboard from './pages/PostAoiDashboard'"
)

# Update redirect in PrivateRoute
content = content.replace('to="/spi-post-aoi-dashboard"', 'to="/spi-dashboard"')

# Update routes
old_route = '<Route path="spi-post-aoi-dashboard" element={<Dashboard />} />'
new_routes = '<Route path="spi-dashboard" element={<SpiDashboard />} />\n          <Route path="post-aoi-dashboard" element={<PostAoiDashboard />} />'
content = content.replace(old_route, new_routes)

with open(file_path, "w") as f:
    f.write(content)
