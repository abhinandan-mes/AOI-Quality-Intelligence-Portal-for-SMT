import re

file_path = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/ActivityLogs.tsx"

with open(file_path, "r") as f:
    content = f.read()

# 1. Remove CHECKLIST_SUBMIT and CHECKPOINT_SUBMIT from getActivityLabel
content = content.replace("      case 'CHECKLIST_SUBMIT': return language === 'zh' ? '提交' : 'Submit';\n", "")
content = content.replace("      case 'CHECKPOINT_SUBMIT': return language === 'zh' ? '提交' : 'Submit';\n", "")

# 2. Remove from getActivityBadgeClass
content = content.replace("      case 'CHECKLIST_SUBMIT': return 'badge-submit';\n", "")
content = content.replace("      case 'CHECKPOINT_SUBMIT': return 'badge-submit';\n", "")

# 3. Remove from getEntityLabel
content = content.replace("    if (type === 'CHECKLIST_SUBMIT') return 'Checklist';\n", "")
content = content.replace("    if (type === 'CHECKPOINT_SUBMIT') return 'Checkpoint';\n", "")

# 4. Remove calculations
calc_block = """  // Count checklist and checksheet submissions for TODAY (local date)
  const todayStr = new Date().toLocaleDateString('en-CA');
  const todayChecklistCount = logs.filter(l => {
    if (l.activity_type !== 'CHECKLIST_SUBMIT') return false;
    const logDateStr = new Date(l.created_at).toLocaleDateString('en-CA');
    return logDateStr === todayStr;
  }).length;

  const todayCheckpointCount = logs.filter(l => {
    if (l.activity_type !== 'CHECKPOINT_SUBMIT') return false;
    const logDateStr = new Date(l.created_at).toLocaleDateString('en-CA');
    return logDateStr === todayStr;
  }).length;"""
content = content.replace(calc_block, "")

# 5. Remove cards
cards_block = """        <div className="activity-stat-card">
          <div className="card-media card-grad-blue">
            <PlusIcon />
          </div>
          <div className="card-info">
            <span className="card-label">{language === 'zh' ? '今日安全表' : 'DAILY CHECKLISTS'}</span>
            <strong className="card-val">{todayChecklistCount}</strong>
          </div>
        </div>

        <div className="activity-stat-card">
          <div className="card-media card-grad-rose">
            <ClockIcon />
          </div>
          <div className="card-info">
            <span className="card-label">{language === 'zh' ? '今日功能表' : 'DAILY CHECKSHEETS'}</span>
            <strong className="card-val">{todayCheckpointCount}</strong>
          </div>
        </div>"""
content = content.replace(cards_block, "")

# 6. Remove options from select
content = content.replace("              <option value=\"CHECKLIST_SUBMIT\">{language === 'zh' ? '提交安全表' : 'Submit Checklist'}</option>\n", "")
content = content.replace("              <option value=\"CHECKPOINT_SUBMIT\">{language === 'zh' ? '提交功能表' : 'Submit Checksheet'}</option>\n", "")

with open(file_path, "w") as f:
    f.write(content)

print("Removed Checklists and Checksheets from ActivityLogs.tsx")
