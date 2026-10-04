$ErrorActionPreference = "SilentlyContinue"
cd C:\Users\user\Documents\Verde

Write-Host "Watchdog Online. Pushing every 2 minutes..."

while ($true) {
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $filename = "reportiteration_$timestamp.md"
    
    $content = @"
# Verde Repository - Live Watchdog Report

## Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

### Current Directory Structure
```text
📁 C:\Users\user\Documents\Verde
"@
    
    # Get top level folders
    $folders = Get-ChildItem -Directory | Select-Object -ExpandProperty Name
    foreach ($folder in $folders) {
        $content += "`n├── 📁 $folder"
    }
    
    # Get top level files
    $files = Get-ChildItem -File | Select-Object -ExpandProperty Name
    foreach ($file in $files) {
        $content += "`n├── 📄 $file"
    }
    
    $content += "`n````n"
    
    Set-Content -Path $filename -Value $content -Encoding UTF8
    
    # Git commands
    git add $filename
    git commit -m "Watchdog: Auto-generated report $timestamp"
    git push origin HEAD
    
    Write-Host "Pushed $filename to GitHub successfully."
    
    # Wait 2 minutes (120 seconds)
    Start-Sleep -Seconds 120
}
