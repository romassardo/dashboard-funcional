# ✅ Dashboard Funcional - Deployment Completado

## Estado del Deployment

**Fecha**: 10 de Febrero, 2026  
**Estado**: ✅ OPERATIVO

---

## URLs de Acceso

- **Dashboard**: http://10.12.32.4/
- **API Backend**: http://10.12.32.4/api/
- **Health Check**: http://10.12.32.4/api/health

---

## Arquitectura Implementada

```
┌─────────────────────────────────────────────────────────┐
│           Servidor Linux (10.12.32.4)                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Apache2 (Puerto 80)                              │   │
│  │  - Sirve: /var/www/dashboard-funcional/frontend/dist│
│  │  - Proxy: /api → http://localhost:3000/api       │   │
│  └──────────────────────────────────────────────────┘   │
│                        │                                  │
│                        ▼                                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Backend Node.js (Puerto 3000)                    │   │
│  │  - Gestionado por: PM2                            │   │
│  │  - Ubicación: /var/www/dashboard-funcional/backend│  │
│  │  - Proceso: dashboard-backend                     │   │
│  └──────────────────────────────────────────────────┘   │
│                        │                                  │
│                        ▼                                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │  MySQL (Puerto 3306)                              │   │
│  │  - Base de datos: funcional                       │   │
│  │  - Usuario: powerbi                               │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## Ubicaciones en el Servidor

### Aplicación
- **Ruta**: `/var/www/dashboard-funcional/`
- **Backend**: `/var/www/dashboard-funcional/backend/`
- **Frontend (compilado)**: `/var/www/dashboard-funcional/frontend/dist/`

### Configuración
- **Apache**: `/etc/apache2/sites-available/dashboard-funcional.conf`
- **PM2**: Proceso `dashboard-backend`
- **Logs Backend**: `~/.pm2/logs/dashboard-backend-*.log`
- **Logs Apache**: `/var/log/apache2/dashboard-*.log`

---

## Repositorio Git

- **GitHub**: https://github.com/romassardo/dashboard-funcional
- **Branch**: main

---

## Comandos Útiles

### Ver estado del backend
```bash
pm2 status
pm2 logs dashboard-backend
```

### Reiniciar backend
```bash
pm2 restart dashboard-backend
```

### Ver estado de Apache
```bash
sudo systemctl status apache2
sudo tail -f /var/log/apache2/dashboard-error.log
```

### Reiniciar Apache
```bash
sudo systemctl restart apache2
```

### Actualizar desde Git
```bash
cd /var/www/dashboard-funcional
git pull origin main

# Backend
cd backend
npm install
pm2 restart dashboard-backend

# Frontend
cd ../frontend
npm install
npm run build

# O usar el script automatizado:
cd /var/www/dashboard-funcional
chmod +x deploy.sh
./deploy.sh
```

---

## Verificación del Sistema

### Backend Health Check
```bash
curl http://localhost:3000/health
# Respuesta esperada: {"status":"ok","message":"Dashboard Funcional API is running"}
```

### Frontend
```bash
curl -I http://10.12.32.4/
# Respuesta esperada: HTTP/1.1 200 OK
```

### API
```bash
curl http://10.12.32.4/api/metrics/tickets-by-system
# Debe retornar JSON con datos
```

---

## Métricas Implementadas

1. ✅ **Tickets por Sistema** (Gráfico de torta)
2. ✅ **Tickets por Tipificación** (Gráfico de torta)
3. ✅ **Incidentes Funcionales** - Resueltos vs Cerrados (Gráfico de torta)
4. ✅ **Top 5 Usuarios** con más tickets (Gráfico de barras)
5. ✅ **Top 5 Departamentos** con más tickets (Gráfico de barras)
6. ✅ **Tabla de Requerimientos Funcionales** con detalles
7. ✅ **Filtros**: Rango de fechas, Año, Mes, Día

---

## Configuración de Base de Datos

- **Host**: localhost (desde el servidor)
- **Puerto**: 3306
- **Base de datos**: funcional
- **Usuario**: powerbi
- **Conexión**: Directa desde el backend en el mismo servidor

---

## Stack Tecnológico

### Backend
- Node.js + Express + TypeScript
- mysql2 (connection pool)
- PM2 para gestión de procesos

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- TailwindCSS + Glassmorphism
- Recharts (visualizaciones)
- Lucide React (iconos)

### Servidor
- Ubuntu 24.04 LTS
- Apache 2.4
- PM2 (process manager)

---

## Próximos Pasos (Opcionales)

### 1. Configurar HTTPS
```bash
sudo apt install certbot python3-certbot-apache
sudo certbot --apache -d tu-dominio.com
```

### 2. Configurar Dominio
Editar `/etc/apache2/sites-available/dashboard-funcional.conf`:
```apache
ServerName dashboard-funcional.tu-dominio.com
```

### 3. Monitoreo Avanzado
- Configurar alertas de PM2
- Implementar logging centralizado
- Configurar backups automáticos

### 4. Optimizaciones
- Habilitar compresión gzip en Apache
- Configurar cache headers
- Implementar CDN para assets estáticos

---

## Contacto y Soporte

**Desarrollador**: Rodrigo Massardo  
**Repositorio**: https://github.com/romassardo/dashboard-funcional  
**Documentación**: Ver `DEPLOYMENT.md` para detalles completos

---

## Notas Importantes

- ⚠️ Los archivos `.env` NO están en Git (están en `.gitignore`)
- ⚠️ Crear manualmente los archivos `.env` después de cada clone
- ✅ PM2 configurado para auto-inicio en reboot del servidor
- ✅ Backend y Frontend en el mismo servidor (no requiere túnel SSH)
- ✅ Sin autenticación (uso interno del sector)

---

**Estado**: 🟢 OPERATIVO  
**Última actualización**: 10 de Febrero, 2026
