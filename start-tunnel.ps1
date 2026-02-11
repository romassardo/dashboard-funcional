# Script para iniciar el túnel SSH a MySQL
# Ejecutar este script en una terminal separada antes de iniciar el backend

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Túnel SSH a Base de Datos MySQL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Creando túnel SSH..." -ForegroundColor Yellow
Write-Host "Puerto local: 3307 -> Remoto: localhost:3306" -ForegroundColor Gray
Write-Host ""
Write-Host "Ingresar contraseña SSH cuando se solicite" -ForegroundColor Green
Write-Host ""
Write-Host "Deja esta ventana abierta mientras uses el dashboard" -ForegroundColor Yellow
Write-Host ""

# Crear el túnel SSH
$serverIp = $env:DASHBOARD_SERVER_IP ?? "10.12.32.4"
ssh -L 3307:localhost:3306 soporte@$serverIp -N
