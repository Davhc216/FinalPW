# Script de Pruebas para Windows PowerShell
# Ejecutar con: .\ejecutar-pruebas.ps1

Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   SISTEMA DE PRUEBAS - BANCO VIRTUAL" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════`n" -ForegroundColor Cyan

# Verificar que el backend esté corriendo
Write-Host "Verificando que el backend esté corriendo..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/api/health" -Method GET -TimeoutSec 2
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend está corriendo`n" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend no está corriendo. Por favor inicia el servidor primero:" -ForegroundColor Red
    Write-Host "   cd backend" -ForegroundColor Yellow
    Write-Host "   npm run dev`n" -ForegroundColor Yellow
    exit 1
}

# Ejecutar pruebas
Write-Host "Ejecutando pruebas automatizadas...`n" -ForegroundColor Yellow
Set-Location backend
node test-api.js
$exitCode = $LASTEXITCODE
Set-Location ..

if ($exitCode -eq 0) {
    Write-Host "`n✅ Todas las pruebas pasaron correctamente!" -ForegroundColor Green
} else {
    Write-Host "`n❌ Algunas pruebas fallaron. Revisa los errores arriba." -ForegroundColor Red
}

exit $exitCode

