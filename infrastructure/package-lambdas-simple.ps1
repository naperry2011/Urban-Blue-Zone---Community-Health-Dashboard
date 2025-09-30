# Urban Blue Zone - Simple Lambda Function Packaging Script
# Packages only index.js files (AWS SDK is available in Lambda runtime)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Lambda Function Packaging (Simple)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Define functions and their paths
$functions = @(
    "backend/iot/vitals-processor",
    "backend/iot/checkins-processor",
    "backend/alerts/alert-processor",
    "backend/analytics/habit-analyzer",
    "backend/aggregator"
)

$packaged = 0

foreach ($funcPath in $functions) {
    $fullPath = Join-Path ".." $funcPath
    $indexFile = Join-Path $fullPath "index.js"
    $zipFile = Join-Path $fullPath "function.zip"

    Write-Host "Packaging: $funcPath" -ForegroundColor Yellow

    if (!(Test-Path $indexFile)) {
        Write-Host "  SKIP: index.js not found" -ForegroundColor Gray
        continue
    }

    # Remove old ZIP
    if (Test-Path $zipFile) {
        Remove-Item $zipFile -Force
    }

    # Create simple ZIP with just index.js
    Push-Location $fullPath
    Compress-Archive -Path "index.js" -DestinationPath "function.zip" -Force
    Pop-Location

    if (Test-Path $zipFile) {
        $size = [math]::Round((Get-Item $zipFile).Length / 1KB, 1)
        Write-Host "  Created: function.zip ($size KB)" -ForegroundColor Green
        $packaged++
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Packaged $packaged Lambda functions" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan
