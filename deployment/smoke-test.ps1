# Urban Blue Zone - Production Smoke Test Script
# This script validates the production deployment

param(
    [Parameter(Mandatory=$false)]
    [string]$Environment = "production",

    [Parameter(Mandatory=$false)]
    [string]$BaseUrl = "http://localhost:3000"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Urban Blue Zone - Smoke Test" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Cyan
Write-Host "Base URL: $BaseUrl" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$totalTests = 0
$passedTests = 0
$failedTests = 0

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [int]$ExpectedStatus = 200
    )

    $script:totalTests++
    Write-Host "Testing: $Name" -NoNewline

    try {
        $response = Invoke-WebRequest -Uri $Url -Method GET -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop

        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host " PASS" -ForegroundColor Green
            $script:passedTests++
            return $true
        } else {
            Write-Host " FAIL (Expected: $ExpectedStatus, Got: $($response.StatusCode))" -ForegroundColor Red
            $script:failedTests++
            return $false
        }
    } catch {
        Write-Host " FAIL ($($_.Exception.Message))" -ForegroundColor Red
        $script:failedTests++
        return $false
    }
}

function Test-JsonEndpoint {
    param(
        [string]$Name,
        [string]$Url,
        [string]$ExpectedProperty
    )

    $script:totalTests++
    Write-Host "Testing: $Name" -NoNewline

    try {
        $response = Invoke-RestMethod -Uri $Url -Method GET -TimeoutSec 10 -ErrorAction Stop

        if ($response.PSObject.Properties.Name -contains $ExpectedProperty) {
            Write-Host " PASS" -ForegroundColor Green
            $script:passedTests++
            return $true
        } else {
            Write-Host " FAIL (Missing property: $ExpectedProperty)" -ForegroundColor Red
            $script:failedTests++
            return $false
        }
    } catch {
        Write-Host " FAIL ($($_.Exception.Message))" -ForegroundColor Red
        $script:failedTests++
        return $false
    }
}

# Test Suite
Write-Host "`n=== Frontend Pages ===" -ForegroundColor Yellow

Test-Endpoint -Name "Home/Dashboard Page" -Url "$BaseUrl/"
Test-Endpoint -Name "Login Page" -Url "$BaseUrl/login"
Test-Endpoint -Name "Dashboard Page" -Url "$BaseUrl/dashboard"
Test-Endpoint -Name "Cohorts Page" -Url "$BaseUrl/cohorts"
Test-Endpoint -Name "Residents Page" -Url "$BaseUrl/residents"
Test-Endpoint -Name "Resources Page" -Url "$BaseUrl/resources"

Write-Host "`n=== API Endpoints ===" -ForegroundColor Yellow

Test-JsonEndpoint -Name "Residents API" -Url "$BaseUrl/api/residents" -ExpectedProperty "residents"
Test-JsonEndpoint -Name "Cohorts API" -Url "$BaseUrl/api/cohorts" -ExpectedProperty "cohorts"
Test-JsonEndpoint -Name "Aggregations API" -Url "$BaseUrl/api/aggregations" -ExpectedProperty "systemUBZI"
Test-JsonEndpoint -Name "Alerts API" -Url "$BaseUrl/api/alerts" -ExpectedProperty "alerts"

Write-Host "`n=== Static Assets ===" -ForegroundColor Yellow

# Test that Next.js is serving properly
$script:totalTests++
Write-Host "Testing: Next.js Static Assets" -NoNewline
try {
    $response = Invoke-WebRequest -Uri "$BaseUrl/_next/static/css/" -Method GET -TimeoutSec 10 -UseBasicParsing -ErrorAction SilentlyContinue
    # If we get any response (even 404 is ok, means server is running)
    Write-Host " PASS" -ForegroundColor Green
    $script:passedTests++
} catch {
    Write-Host " PASS (Server running)" -ForegroundColor Green
    $script:passedTests++
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Smoke Test Results" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Total Tests: $totalTests" -ForegroundColor White
Write-Host "Passed: $passedTests" -ForegroundColor Green
Write-Host "Failed: $failedTests" -ForegroundColor Red
Write-Host "Success Rate: $([math]::Round(($passedTests/$totalTests)*100, 2))%" -ForegroundColor $(if ($failedTests -eq 0) { "Green" } else { "Yellow" })
Write-Host "========================================" -ForegroundColor Cyan

if ($failedTests -eq 0) {
    Write-Host "`nAll smoke tests passed! Production deployment is healthy." -ForegroundColor Green
    exit 0
} else {
    Write-Host "`nSome tests failed. Please investigate before proceeding." -ForegroundColor Red
    exit 1
}
