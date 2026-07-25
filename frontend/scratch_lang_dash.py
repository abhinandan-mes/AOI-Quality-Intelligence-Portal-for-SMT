import re

file_path = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/contexts/LanguageContext.tsx"
with open(file_path, "r") as f:
    content = f.read()

content = content.replace(
    "'menu.dashboard': { en: 'Dashboard', zh: '仪表板' }",
    "'menu.dashboard': { en: 'SPI & Post AOI Dashboard', zh: 'SPI 与 Post AOI 仪表板' }"
)

with open(file_path, "w") as f:
    f.write(content)
