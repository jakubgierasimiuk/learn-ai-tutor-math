# Mentavo - Supabase Diagnostics Script
# Usage: powershell -ExecutionPolicy Bypass -File scripts\supabase-diagnostics.ps1

$env:SUPABASE_ACCESS_TOKEN = "sbp_a1a40e747101a1135f6596fe4d57cbf2d21e5460"
$supabase = "C:\Users\K\bin\supabase.exe"
$projectRef = "rfcjhdxsczcwbpknudyy"
$anonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmY2poZHhzY3pjd2Jwa251ZHl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMjY5NDgsImV4cCI6MjA2ODYwMjk0OH0.Fljfz9HWi_N_hEZ4UKvk-PMKAWr4fbW_NJIE73dShoY"

Write-Host "=========================================="
Write-Host "MENTAVO - SUPABASE DIAGNOSTICS"
Write-Host "=========================================="
Write-Host ""

# 1. Check CLI
Write-Host "=== Supabase CLI ==="
if (Test-Path $supabase) {
    $version = & $supabase --version
    Write-Host "CLI Version: $version"
} else {
    Write-Host "ERROR: Supabase CLI not found at $supabase"
    exit 1
}
Write-Host ""

# 2. List Edge Functions
Write-Host "=== Edge Functions Status ==="
& $supabase functions list --project-ref $projectRef | Select-Object -First 15
Write-Host ""

# 3. Check Secrets
Write-Host "=== Configured Secrets ==="
& $supabase secrets list --project-ref $projectRef
Write-Host ""

# 4. Test API
Write-Host "=== API Test (study-tutor) ==="
$url = "https://$projectRef.supabase.co/functions/v1/study-tutor"
$body = '{"endpoint":"chat","message":"test","messages":[]}'
$headers = @{
    "Authorization" = "Bearer $anonKey"
    "Content-Type" = "application/json; charset=utf-8"
}

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Headers $headers -Body ([System.Text.Encoding]::UTF8.GetBytes($body)) -TimeoutSec 60
    Write-Host "Status: OK"
    $shortMsg = if ($response.message.Length -gt 100) { $response.message.Substring(0, 100) + "..." } else { $response.message }
    Write-Host "Response: $shortMsg"
} catch {
    Write-Host "Status: ERROR"
    Write-Host "Message: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "=========================================="
Write-Host "DIAGNOSTICS COMPLETE"
Write-Host "=========================================="
