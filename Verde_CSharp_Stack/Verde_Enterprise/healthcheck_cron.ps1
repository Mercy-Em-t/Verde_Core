$url = $env:HEALTHCHECK_URL
if (-not $url) {
    Write-Error "HEALTHCHECK_URL environment variable is not set."
    exit 1
}

while ($true) {
    try {
        Invoke-RestMethod -Uri $url -Method Get
        Write-Host "Healthcheck sent successfully to $url."
    } catch {
        Write-Host "Failed to send healthcheck: $_"
    }
    Start-Sleep -Seconds 300
}
