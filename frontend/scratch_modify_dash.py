import re

def modify_file(file_path, comp_name, lang_key, machine_type):
    with open(file_path, "r") as f:
        content = f.read()

    # Rename component
    content = content.replace("export default function Dashboard()", f"export default function {comp_name}()")
    
    # Update heading
    content = content.replace("t('menu.dashboard')", f"t('{lang_key}')")
    
    # Add machineType parameter to axios calls
    # Find endpoints ending with `?timeframe=${timeframe}` and append `&machineType=SPI`
    content = content.replace("?timeframe=${timeframe}`", f"?timeframe=${{timeframe}}&machineType={machine_type}`")

    with open(file_path, "w") as f:
        f.write(content)

modify_file("/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/SpiDashboard.tsx", "SpiDashboard", "menu.spiDashboard", "SPI")
modify_file("/Users/abhinandan/Documents/AOI-Quality-Intelligence-Portal-for-SMT/frontend/src/pages/PostAoiDashboard.tsx", "PostAoiDashboard", "menu.postAoiDashboard", "POST_AOI")

