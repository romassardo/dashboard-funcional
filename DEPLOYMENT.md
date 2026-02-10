# Guía de Deployment - Dashboard Funcional

## 1. Configuración Inicial en GitHub

### Crear repositorio en GitHub
1. Ve a https://github.com/new
2. Nombre: `dashboard-funcional`
3. Descripción: Dashboard de métricas OsTicket - Soporte Funcional
4. **Privado** (recomendado por contener credenciales)
5. **NO** inicializar con README, .gitignore o licencia
6. Crear repositorio

### Conectar repositorio local con GitHub
```bash
cd "c:\Proyectos\Dashboard Funcional"
git remote add origin https://github.com/TU_USUARIO/dashboard-funcional.git
git branch -M main
git push -u origin main
```

## 2. Setup en el Servidor Linux

### Clonar repositorio
```bash
ssh soporte@10.12.32.4
cd /var/www
sudo rm -rf dashboard-funcional  # Limpiar instalación anterior
sudo git clone https://github.com/TU_USUARIO/dashboard-funcional.git
sudo chown -R soporte:soporte dashboard-funcional
cd dashboard-funcional
```

### Configurar variables de entorno

**Backend** (`/var/www/dashboard-funcional/backend/.env`):
```bash
cat > backend/.env << EOF
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=powerbi
DB_PASSWORD=Diego2024@
DB_NAME=funcional
CORS_ORIGIN=*
EOF
```

**Frontend** (`/var/www/dashboard-funcional/frontend/.env`):
```bash
cat > frontend/.env << EOF
VITE_API_URL=http://10.12.32.4:3000
EOF
```

### Instalar dependencias y compilar

```bash
# Backend
cd backend
npm install --production
cd ..

# Frontend
cd frontend
npm install
npm run build
cd ..
```

## 3. Configurar Nginx (Servidor Web)

Crear archivo de configuración para Nginx:

```bash
sudo nano /etc/nginx/sites-available/dashboard-funcional
```

Contenido:
```nginx
server {
    listen 80;
    server_name 10.12.32.4;  # o tu dominio

    # Frontend (archivos estáticos compilados)
    location / {
        root /var/www/dashboard-funcional/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # Headers de seguridad
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }

    # Backend API (proxy a Node.js)
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Activar sitio:
```bash
sudo ln -s /etc/nginx/sites-available/dashboard-funcional /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 4. Configurar Backend como Servicio (PM2 o systemd)

### Opción A: PM2 (Recomendado)

```bash
# Instalar PM2 globalmente
sudo npm install -g pm2

# Iniciar backend
cd /var/www/dashboard-funcional/backend
pm2 start npm --name "dashboard-backend" -- run dev

# Guardar configuración
pm2 save
pm2 startup
```

### Opción B: systemd

```bash
sudo nano /etc/systemd/system/dashboard-backend.service
```

Contenido:
```ini
[Unit]
Description=Dashboard Funcional Backend
After=network.target mysql.service

[Service]
Type=simple
User=soporte
WorkingDirectory=/var/www/dashboard-funcional/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm run dev
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Activar:
```bash
sudo systemctl daemon-reload
sudo systemctl enable dashboard-backend
sudo systemctl start dashboard-backend
sudo systemctl status dashboard-backend
```

## 5. Actualizaciones Futuras

Cuando hagas cambios al código:

```bash
# Desde tu PC Windows
cd "c:\Proyectos\Dashboard Funcional"
git add .
git commit -m "Descripción de cambios"
git push origin main

# En el servidor Linux
ssh soporte@10.12.32.4
cd /var/www/dashboard-funcional
chmod +x deploy.sh
./deploy.sh
```

O manualmente:
```bash
cd /var/www/dashboard-funcional
git pull origin main
cd backend && npm install --production && cd ..
cd frontend && npm install && npm run build && cd ..
pm2 restart dashboard-backend  # o: sudo systemctl restart dashboard-backend
```

## 6. Verificación

### Backend
```bash
curl http://localhost:3000/health
# Debe responder: {"status":"ok","message":"Dashboard Funcional API is running"}
```

### Frontend
Abrir navegador: `http://10.12.32.4/`

### Logs
```bash
# PM2
pm2 logs dashboard-backend

# systemd
sudo journalctl -u dashboard-backend -f

# Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## 7. Seguridad

### Importante
- Los archivos `.env` **NO** están en Git (están en `.gitignore`)
- Debes crearlos manualmente en el servidor después de clonar
- Considera usar variables de entorno del sistema o herramientas como `dotenv-vault`

### Firewall
Si tienes firewall activo:
```bash
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp  # Si usas HTTPS
```

## 8. URLs Finales

- **Dashboard**: http://10.12.32.4/
- **API**: http://10.12.32.4/api/metrics/
- **Health Check**: http://10.12.32.4/api/health

## Troubleshooting

### Backend no inicia
```bash
cd /var/www/dashboard-funcional/backend
npm run dev  # Ver errores directamente
```

### Frontend muestra pantalla blanca
```bash
# Verificar que el build se completó
ls -la /var/www/dashboard-funcional/frontend/dist/
# Debe contener index.html y carpeta assets/
```

### Errores 502 Bad Gateway
```bash
# Verificar que el backend está corriendo
curl http://localhost:3000/health
# Verificar configuración de Nginx
sudo nginx -t
```
