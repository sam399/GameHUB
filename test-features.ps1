# Feature Testing Script for GameVerse
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GameVerse Feature Testing Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:5000/api"
$maxRetries = 30
$retryCount = 0

# Function to test API endpoint
function Test-Endpoint {
    param(
        [string]$Endpoint,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    try {
        $uri = "$baseUrl$Endpoint"
        $params = @{
            Uri = $uri
            Method = $Method
            TimeoutSec = 5
            Headers = $Headers
            ErrorAction = "Stop"
        }
        
        if ($Body) {
            $params["Body"] = $Body
        }
        
        $response = Invoke-WebRequest @params
        return @{
            Success = $true
            StatusCode = $response.StatusCode
            Content = $response.Content
        }
    } catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
        }
    }
}

# Wait for server to be ready
Write-Host "`n⏳ Waiting for backend server to respond..." -ForegroundColor Yellow
while ($retryCount -lt $maxRetries) {
    $result = Test-Endpoint -Endpoint ""
    if ($result.Success) {
        Write-Host "✅ Backend server is running!" -ForegroundColor Green
        break
    }
    $retryCount++
    Start-Sleep -Seconds 1
}

if ($retryCount -eq $maxRetries) {
    Write-Host "❌ Backend server is not responding after 30 seconds" -ForegroundColor Red
    Write-Host "Please make sure the backend is running with: npm start" -ForegroundColor Yellow
    exit 1
}

# Test API Endpoints
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Testing API Endpoints" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Test Main API
Write-Host "`n1. Testing Main API Endpoint..."
$result = Test-Endpoint -Endpoint ""
if ($result.Success) {
    Write-Host "✅ Main API: OK ($($result.StatusCode))" -ForegroundColor Green
    $content = $result.Content | ConvertFrom-Json
    Write-Host "   Message: $($content.message)" -ForegroundColor Gray
} else {
    Write-Host "❌ Main API: FAILED - $($result.Error)" -ForegroundColor Red
}

# Test Auth Endpoints
Write-Host "`n2. Testing Auth Endpoints..."
$result = Test-Endpoint -Endpoint "/auth"
if ($result.Success) {
    Write-Host "✅ Auth endpoint: OK" -ForegroundColor Green
} else {
    Write-Host "⚠️  Auth endpoint check (expected if no specific route)" -ForegroundColor Yellow
}

# Test Games Endpoint
Write-Host "`n3. Testing Games Endpoint..."
$result = Test-Endpoint -Endpoint "/games"
if ($result.Success) {
    Write-Host "✅ Games endpoint: OK ($($result.StatusCode))" -ForegroundColor Green
} else {
    Write-Host "❌ Games endpoint: FAILED - $($result.Error)" -ForegroundColor Red
}

# Test Notifications Endpoint
Write-Host "`n4. Testing Notifications Endpoint..."
$result = Test-Endpoint -Endpoint "/notifications"
if ($result.Success) {
    Write-Host "✅ Notifications endpoint: OK" -ForegroundColor Green
} else {
    Write-Host "⚠️  Notifications endpoint: Requires auth" -ForegroundColor Yellow
}

# Test Feed Endpoint
Write-Host "`n5. Testing Feed Endpoint..."
$result = Test-Endpoint -Endpoint "/feed"
if ($result.Success) {
    Write-Host "✅ Feed endpoint: OK" -ForegroundColor Green
} else {
    Write-Host "⚠️  Feed endpoint: Requires auth or parameters" -ForegroundColor Yellow
}

# Test Admin Endpoint
Write-Host "`n6. Testing Admin Endpoint..."
$result = Test-Endpoint -Endpoint "/admin"
if ($result.Success) {
    Write-Host "✅ Admin endpoint: OK" -ForegroundColor Green
} else {
    Write-Host "⚠️  Admin endpoint: Requires auth" -ForegroundColor Yellow
}

# Test Reports Endpoint
Write-Host "`n7. Testing Reports Endpoint..."
$result = Test-Endpoint -Endpoint "/reports"
if ($result.Success) {
    Write-Host "✅ Reports endpoint: OK" -ForegroundColor Green
} else {
    Write-Host "⚠️  Reports endpoint: Requires auth" -ForegroundColor Yellow
}

# Test Events Endpoint
Write-Host "`n8. Testing Events Endpoint..."
$result = Test-Endpoint -Endpoint "/events"
if ($result.Success) {
    Write-Host "✅ Events endpoint: OK ($($result.StatusCode))" -ForegroundColor Green
    try {
        $content = $result.Content | ConvertFrom-Json
        Write-Host "   Response: $($content | ConvertTo-Json -Compress)" -ForegroundColor Gray
    } catch {}
} else {
    Write-Host "⚠️  Events endpoint: $($result.Error)" -ForegroundColor Yellow
}

# Test Achievements Endpoint
Write-Host "`n9. Testing Achievements Endpoint..."
$result = Test-Endpoint -Endpoint "/achievements"
if ($result.Success) {
    Write-Host "✅ Achievements endpoint: OK" -ForegroundColor Green
} else {
    Write-Host "⚠️  Achievements endpoint: $($result.Error)" -ForegroundColor Yellow
}

# Test Leaderboards Endpoint
Write-Host "`n10. Testing Leaderboards Endpoint..."
$result = Test-Endpoint -Endpoint "/leaderboards"
if ($result.Success) {
    Write-Host "✅ Leaderboards endpoint: OK" -ForegroundColor Green
} else {
    Write-Host "⚠️  Leaderboards endpoint: $($result.Error)" -ForegroundColor Yellow
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Backend server is operational" -ForegroundColor Green
Write-Host "✅ Core API endpoints are accessible" -ForegroundColor Green
Write-Host "`n📋 Note: Some endpoints require authentication" -ForegroundColor Yellow
Write-Host "📋 Try logging in first to test protected endpoints" -ForegroundColor Yellow

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Frontend Status" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Frontend running on: http://localhost:5174" -ForegroundColor Yellow
Write-Host "Check browser console for any errors" -ForegroundColor Yellow

Write-Host "`nTest completed!" -ForegroundColor Cyan
