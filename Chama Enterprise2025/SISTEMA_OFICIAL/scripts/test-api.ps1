# Import shifts via PowerShell + curl
$API_BASE = "http://localhost:5000/api"

Write-Host "🚀 Importando turnos via API..." -ForegroundColor Cyan

# Login
Write-Host "`n🔐 Fazendo login..." -ForegroundColor Yellow
$loginResponse = curl -s -X POST "$API_BASE/auth/login" -H "Content-Type: application/json" -d "@scripts/login.json" | ConvertFrom-Json
$token = $loginResponse.data.accessToken
Write-Host "✓ Login realizado!" -ForegroundColor Green

# Get drivers
Write-Host "`n📋 Buscando motoristas..." -ForegroundColor Yellow
$driversResponse = curl -s "$API_BASE/drivers" -H "Authorization: Bearer $token" | ConvertFrom-Json
Write-Host "✓ Encontrados $($driversResponse.Length) motoristas" -ForegroundColor Green

# Get vehicles
Write-Host "`n🚗 Buscando veículos..." -ForegroundColor Yellow
$vehiclesResponse = curl -s "$API_BASE/vehicles" -H "Authorization: Bearer $token" | ConvertFrom-Json
Write-Host "✓ Encontrados $($vehiclesResponse.Length) veículos" -ForegroundColor Green

Write-Host "`n✨ Pronto para importar! Execute manualmente os POSTs ou continue o script..." -ForegroundColor Cyan
Write-Host "Token: $token" -ForegroundColor Gray
