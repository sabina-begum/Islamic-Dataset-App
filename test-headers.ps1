# PowerShell script to test security headers
param(
    [string]$Url = "http://localhost:5173"
)

Write-Host "Testing security headers for: $Url" -ForegroundColor Cyan
Write-Host ("=" * 50) -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri $Url -Method GET -UseBasicParsing
    $headers = $response.Headers
    
    $securityHeaders = @{
        'Content-Security-Policy' = $headers['Content-Security-Policy']
        'X-Frame-Options' = $headers['X-Frame-Options']
        'X-Content-Type-Options' = $headers['X-Content-Type-Options']
        'Referrer-Policy' = $headers['Referrer-Policy']
        'Permissions-Policy' = $headers['Permissions-Policy']
        'Strict-Transport-Security' = $headers['Strict-Transport-Security']
        'X-XSS-Protection' = $headers['X-XSS-Protection']
        'X-Download-Options' = $headers['X-Download-Options']
        'X-Permitted-Cross-Domain-Policies' = $headers['X-Permitted-Cross-Domain-Policies']
        'Cross-Origin-Embedder-Policy' = $headers['Cross-Origin-Embedder-Policy']
        'Cross-Origin-Opener-Policy' = $headers['Cross-Origin-Opener-Policy']
        'Cross-Origin-Resource-Policy' = $headers['Cross-Origin-Resource-Policy']
        'X-DNS-Prefetch-Control' = $headers['X-DNS-Prefetch-Control']
    }
    
    Write-Host "Security Headers Analysis:" -ForegroundColor Yellow
    Write-Host ""
    
    $score = 0
    $total = 0
    
    foreach ($header in $securityHeaders.GetEnumerator()) {
        $total++
        if ($header.Value) {
            $score++
            Write-Host "OK $($header.Key): $($header.Value)" -ForegroundColor Green
        } else {
            Write-Host "MISSING $($header.Key): MISSING" -ForegroundColor Red
        }
    }
    
    $percentage = [math]::Round(($score / $total) * 100)
    $grade = "F"
    
    if ($percentage -ge 90) { $grade = "A+" }
    elseif ($percentage -ge 80) { $grade = "A" }
    elseif ($percentage -ge 70) { $grade = "B" }
    elseif ($percentage -ge 60) { $grade = "C" }
    elseif ($percentage -ge 50) { $grade = "D" }
    
    Write-Host ""
    Write-Host "Score: $score/$total ($percentage%)" -ForegroundColor Cyan
    Write-Host "Grade: $grade" -ForegroundColor Cyan
    
    if ($grade -eq "A+") {
        Write-Host "Excellent! Your security headers are properly configured!" -ForegroundColor Green
    } else {
        Write-Host "Warning: Some security headers are missing. Check your _headers file." -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "Error testing headers: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Make sure your development server is running on $Url" -ForegroundColor Yellow
}
