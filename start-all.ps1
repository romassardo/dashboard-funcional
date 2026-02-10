# Script para iniciar todo el dashboard
# IMPORTANTE: Ejecutar start-tunnel.ps1 primero en otra terminal

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Dashboard Soporte Funcional" -ForegroundColor Cyan  
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que el túnel SSH esté activo
Write-Host "Verificando túnel SSH..." -ForegroundColor Yellow
$tunnel = Test-NetConnection -ComputerName localhost -Port 3307 -InformationLevel Quiet -WarningAction SilentlyContinue

if (-not $tunnel) {
    Write-Host ""
    Write-Host "ERROR: El túnel SSH no está activo!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Por favor, ejecuta primero en otra terminal:" -ForegroundColor Yellow
    Write-Host "  .\start-tunnel.ps1" -ForegroundColor Green
    Write-Host ""
    Write-Host "Deja esa terminal abierta y luego vuelve a ejecutar este script." -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host "Túnel SSH activo en puerto 3307" -ForegroundColor Green
Write-Host ""

# Iniciar backend
Write-Host "Iniciando backend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; Write-Host 'Backend API Server' -ForegroundColor Cyan; npm run dev"

Start-Sleep -Seconds 2

# Iniciar frontend  
Write-Host "Iniciando frontend..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; Write-Host 'Frontend Dev Server' -ForegroundColor Cyan; npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Dashboard iniciado exitosamente!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "URLs:" -ForegroundColor Yellow
Write-Host "  Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Backend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Presiona cualquier tecla para cerrar..." -ForegroundColor Gray
pause
