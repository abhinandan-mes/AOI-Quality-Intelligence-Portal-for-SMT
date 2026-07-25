import re

app_file = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/App.tsx"
with open(app_file, "r") as f:
    app_content = f.read()

app_content = app_content.replace('to="/dashboard"', 'to="/spi-post-aoi-dashboard"')
app_content = app_content.replace('path="dashboard"', 'path="spi-post-aoi-dashboard"')

with open(app_file, "w") as f:
    f.write(app_content)

layout_file = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/layouts/MainLayout.tsx"
with open(layout_file, "r") as f:
    layout_content = f.read()

layout_content = layout_content.replace('to="/dashboard"', 'to="/spi-post-aoi-dashboard"')

with open(layout_file, "w") as f:
    f.write(layout_content)
