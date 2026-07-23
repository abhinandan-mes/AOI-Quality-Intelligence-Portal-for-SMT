import re

file_path = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/UserManagement.tsx"
context_path = "/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/contexts/LanguageContext.tsx"

with open(file_path, "r") as f:
    content = f.read()

replacements = {
    '>NAME<': ">{t('users.colName')}<",
    '>USERNAME<': ">{t('users.colUsername')}<",
    '>ROLE<': ">{t('users.colRole')}<",
    '>STATUS<': ">{t('users.colStatus')}<",
    '>ACTIONS<': ">{t('users.colActions')}<",
    'Access Control Matrix': "{t('users.matrixTitle')}",
    'Permission</th>': "{t('users.colPermission')}</th>",
    '>Edit<': ">{t('users.edit')}<",
    '>Delete<': ">{t('users.delete')}<",
    'Full Name</label>': "{t('users.labelName')}</label>",
    'Username</label>': "{t('users.labelUsername')}</label>",
    'Role</label>': "{t('users.labelRole')}</label>",
    'Status</label>': "{t('users.labelStatus')}</label>",
    'Password</label>': "{t('users.labelPassword')}</label>",
    'New Password (Leave blank to keep current)</label>': "{t('users.labelNewPassword')}</label>",
    'Cancel</button>': "{t('users.cancel')}</button>",
    'Save Changes</button>': "{t('users.save')}</button>",
    'Create User</button>': "{t('users.create')}</button>",
    '>Active<': ">{t('users.active')}<",
    '>Inactive<': ">{t('users.inactive')}<",
    'Protected</span>': "{t('users.protected')}</span>",
    '>Inspector<': ">{t('users.roleInspector')}<",
    '>Manager<': ">{t('users.roleManager')}<",
    '>Admin<': ">{t('users.roleAdmin')}<",
    '>Super Admin<': ">{t('users.roleSuperAdmin')}<",
    'Edit User</h2>': "{t('users.editTitle')}</h2>"
}

for old, new in replacements.items():
    content = content.replace(old, new)

# specific hard replacements
content = content.replace("● Active", "● {t('users.active')}")
content = content.replace("● Inactive", "● {t('users.inactive')}")

with open(file_path, "w") as f:
    f.write(content)

with open(context_path, "r") as f:
    ctx = f.read()

new_keys = """
  // User Management Additions
  'users.colName': { en: 'NAME', zh: '姓名' },
  'users.colUsername': { en: 'USERNAME', zh: '用户名' },
  'users.colRole': { en: 'ROLE', zh: '角色' },
  'users.colStatus': { en: 'STATUS', zh: '状态' },
  'users.colActions': { en: 'ACTIONS', zh: '操作' },
  'users.matrixTitle': { en: 'Access Control Matrix', zh: '访问控制矩阵' },
  'users.colPermission': { en: 'Permission', zh: '权限' },
  'users.edit': { en: 'Edit', zh: '编辑' },
  'users.delete': { en: 'Delete', zh: '删除' },
  'users.labelName': { en: 'Full Name', zh: '全名' },
  'users.labelUsername': { en: 'Username', zh: '用户名' },
  'users.labelRole': { en: 'Role', zh: '角色' },
  'users.labelStatus': { en: 'Status', zh: '状态' },
  'users.labelPassword': { en: 'Password', zh: '密码' },
  'users.labelNewPassword': { en: 'New Password (Leave blank to keep current)', zh: '新密码（留空则保持当前）' },
  'users.cancel': { en: 'Cancel', zh: '取消' },
  'users.save': { en: 'Save Changes', zh: '保存更改' },
  'users.create': { en: 'Create User', zh: '创建用户' },
  'users.active': { en: 'Active', zh: '活跃' },
  'users.inactive': { en: 'Inactive', zh: '不活跃' },
  'users.protected': { en: 'Protected', zh: '受保护' },
  'users.roleInspector': { en: 'Inspector', zh: '检验员' },
  'users.roleManager': { en: 'Manager', zh: '经理' },
  'users.roleAdmin': { en: 'Admin', zh: '管理员' },
  'users.roleSuperAdmin': { en: 'Super Admin', zh: '超级管理员' },
  'users.editTitle': { en: 'Edit User', zh: '编辑用户' },
"""

if "'users.colName'" not in ctx:
    ctx = ctx.replace("// Analytics", new_keys + "\n  // Analytics")
    with open(context_path, "w") as f:
        f.write(ctx)

print("Updated UserManagement.tsx")
