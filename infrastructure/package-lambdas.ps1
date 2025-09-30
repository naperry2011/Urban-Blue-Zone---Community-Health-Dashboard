# Urban Blue Zone - Lambda Function Packaging Script
# This script packages all Lambda functions into ZIP files for deployment

param(
    [Parameter(Mandatory=$false)]
    [string]$BackendPath = "..\backend"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Lambda Function Packaging" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$functions = @(
    @{Name="IoT Vitals Processor"; Path="iot/vitals-processor"},
    @{Name="IoT Checkins Processor"; Path="iot/checkins-processor"},
    @{Name="Alert Processor"; Path="alerts/alert-processor"},
    @{Name="Habit Analyzer"; Path="analytics/habit-analyzer"},
    @{Name="Aggregator"; Path="aggregator"}
)

$packaged = 0
$failed = 0

foreach ($func in $functions) {
    $funcPath = Join-Path $BackendPath $func.Path
    $zipFile = Join-Path $funcPath "function.zip"

    Write-Host "Packaging: $($func.Name)" -ForegroundColor Yellow
    Write-Host "  Path: $funcPath" -ForegroundColor White

    if (!(Test-Path $funcPath)) {
        Write-Host "  ERROR: Directory not found: $funcPath" -ForegroundColor Red
        $failed++
        continue
    }

    # Check if index.js exists
    if (!(Test-Path (Join-Path $funcPath "index.js"))) {
        Write-Host "  ERROR: index.js not found in $funcPath" -ForegroundColor Red
        $failed++
        continue
    }

    # Remove old ZIP if exists
    if (Test-Path $zipFile) {
        Remove-Item $zipFile -Force
        Write-Host "  Removed old ZIP file" -ForegroundColor Gray
    }

    # Create ZIP file
    try {
        # Change to function directory
        Push-Location $funcPath

        # Check if node_modules exists
        $hasNodeModules = Test-Path "node_modules"

        if ($hasNodeModules) {
            # Package with node_modules
            Write-Host "  Creating ZIP with dependencies..." -ForegroundColor White
            Compress-Archive -Path "index.js", "node_modules", "package.json" -DestinationPath "function.zip" -CompressionLevel Fastest -Force
        } else {
            # Package without node_modules (will need runtime installation)
            Write-Host "  Creating ZIP without dependencies (will use layers)..." -ForegroundColor White
            if (Test-Path "package.json") {
                Compress-Archive -Path "index.js", "package.json" -DestinationPath "function.zip" -CompressionLevel Fastest -Force
            } else {
                Compress-Archive -Path "index.js" -DestinationPath "function.zip" -CompressionLevel Fastest -Force
            }
        }

        Pop-Location

        $zipSize = (Get-Item $zipFile).Length / 1MB
        Write-Host "  ZIP created: function.zip ($([math]::Round($zipSize, 2)) MB)" -ForegroundColor Green
        $packaged++
    } catch {
        Write-Host "  ERROR: Failed to create ZIP: $_" -ForegroundColor Red
        Pop-Location
        $failed++
    }

    Write-Host ""
}

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Packaging Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total Functions: $($functions.Count)" -ForegroundColor White
Write-Host "Packaged: $packaged" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Gray" })
Write-Host "========================================`n" -ForegroundColor Cyan

if ($failed -gt 0) {
    Write-Host "WARNING: Some functions failed to package" -ForegroundColor Yellow
    Write-Host "You may need to create them manually or update paths`n" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "All Lambda functions packaged successfully!" -ForegroundColor Green
    Write-Host "`nNext step: Run 'terraform init && terraform apply'`n" -ForegroundColor Yellow
    exit 0
}
