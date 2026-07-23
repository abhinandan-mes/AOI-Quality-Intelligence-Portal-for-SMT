import re

file_path = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/contexts/LanguageContext.tsx"
with open(file_path, "r") as f:
    content = f.read()

# Replace all occurrences of AOI related to machines (except title)
content = content.replace("'lines.aoiConfigs': { en: 'AOI Configurations', zh: 'AOI 配置' },", "'lines.postAoiConfigs': { en: 'Post AOI Configurations', zh: 'Post AOI 配置' },")
content = content.replace("'lines.aoiPaths': { en: 'Lines with AOI watch paths', zh: '带有 AOI 监控路径的产线' },", "'lines.postAoiPaths': { en: 'Lines with Post AOI watch paths', zh: '带有 Post AOI 监控路径的产线' },")
content = content.replace("'lines.colAoiPath': { en: 'AOI Watch Path', zh: 'AOI 监控路径' },", "'lines.colPostAoiPath': { en: 'Post AOI Watch Path', zh: 'Post AOI 监控路径' },")
content = content.replace("'lines.labelAoiPath': { en: 'AOI Watch Path', zh: 'AOI 监控路径' },", "'lines.labelPostAoiPath': { en: 'Post AOI Watch Path', zh: 'Post AOI 监控路径' },")

with open(file_path, "w") as f:
    f.write(content)
