import re

file_path = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/layouts/MainLayout.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Replace single Dashboard link with two links
old_link = """            <NavLink to="/spi-post-aoi-dashboard" style={({ isActive }) => navItemStyle(isActive)}>
              {t('menu.dashboard') || 'SPI & Post AOI Dashboard'}
            </NavLink>"""
new_links = """            <NavLink to="/spi-dashboard" style={({ isActive }) => navItemStyle(isActive)}>
              {t('menu.spiDashboard') || 'SPI Dashboard'}
            </NavLink>
            <NavLink to="/post-aoi-dashboard" style={({ isActive }) => navItemStyle(isActive)}>
              {t('menu.postAoiDashboard') || 'Post AOI Dashboard'}
            </NavLink>"""

content = content.replace(old_link, new_links)

with open(file_path, "w") as f:
    f.write(content)
