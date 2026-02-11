# Dashboard Soporte Funcional - OsTicket

Dashboard ultra-moderno para visualizar métricas de la ticketera OsTicket del sector de Soporte Funcional y Data.

## 🚀 Stack Tecnológico

### Backend
- **Framework**: Node.js + Express + TypeScript
- **Base de datos**: MySQL (OsTicket)
- **Cliente DB**: mysql2 con connection pool
- **CORS**: Habilitado para desarrollo local

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI**: TailwindCSS + glassmorphism effects
- **Gráficos**: Recharts (biblioteca responsive)
- **Iconos**: Lucide React
- **HTTP Client**: Axios

## 📊 Características

### Métricas Implementadas
- ✅ **Tickets por Sistema**: Gráfico de torta (Fiscal, Gestión, Control de Cajas, etc.)
- ✅ **Tickets por Tipificación**: Gráfico de torta (Consulta, Incidente, Requerimiento, etc.)
- ✅ **Incidentes Funcionales**: Resueltos vs Cerrados
- ✅ **Top 5 Usuarios**: Gráfico de barras con más tickets
- ✅ **Top 5 Departamentos**: Gráfico de barras con porcentajes
- ✅ **Tabla de Requerimientos Funcionales**: Con modal de detalles

### Filtros Disponibles
- **Rango de fechas**: Desde/Hasta
- **Período individual**: Año, Mes, Día

## 🔧 Configuración

### Backend

1. Navegar a la carpeta backend:
```bash
cd backend
```

2. Las dependencias ya están instaladas. Copiar el archivo de ejemplo y completar las credenciales:
```bash
cp .env.example backend/.env
# Editar backend/.env con las credenciales reales
```

3. Iniciar el servidor:
```bash
npm run dev
```

El backend estará disponible en `http://localhost:3000`

### Frontend

1. Navegar a la carpeta frontend:
```bash
cd frontend
```

2. Las dependencias ya están instaladas. Variables de entorno en `.env`:
```env
VITE_API_URL=http://localhost:3000
```

3. Iniciar el desarrollo:
```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## 📁 Estructura del Proyecto

```
Dashboard Funcional/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts          # Conexión MySQL
│   │   ├── controllers/
│   │   │   └── metricsController.ts # Controladores de métricas
│   │   ├── routes/
│   │   │   └── metricsRoutes.ts     # Rutas API
│   │   ├── services/
│   │   │   └── ticketService.ts     # Lógica de negocio y queries
│   │   ├── types/
│   │   │   └── ticket.types.ts      # Interfaces TypeScript
│   │   └── server.ts                # Servidor Express
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── charts/
│   │   │   │   ├── PieChartCard.tsx
│   │   │   │   └── BarChartCard.tsx
│   │   │   ├── filters/
│   │   │   │   ├── DateRangeFilter.tsx
│   │   │   │   └── PeriodFilters.tsx
│   │   │   ├── tables/
│   │   │   │   └── RequirementsTable.tsx
│   │   │   └── ui/
│   │   │       └── Card.tsx
│   │   ├── lib/
│   │   │   └── utils.ts
│   │   ├── services/
│   │   │   └── api.ts               # Cliente API
│   │   ├── App.tsx                  # Componente principal
│   │   ├── main.tsx
│   │   └── index.css
│   ├── .env
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── README.md
```

## 🔌 API Endpoints

### Métricas
- `GET /api/metrics/tickets-by-system` - Tickets agrupados por sistema
- `GET /api/metrics/tickets-by-type` - Tickets agrupados por tipificación
- `GET /api/metrics/top-users` - Top usuarios con más tickets
- `GET /api/metrics/top-departments` - Top departamentos
- `GET /api/metrics/incidents-status` - Estado de incidentes funcionales
- `GET /api/metrics/functional-requirements` - Requerimientos funcionales
- `GET /api/metrics/monthly-summary` - Resumen mensual

### Parámetros de Filtro
Todos los endpoints aceptan:
- `from` (YYYY-MM-DD): Fecha desde
- `to` (YYYY-MM-DD): Fecha hasta
- `year` (number): Año
- `month` (number): Mes (1-12)
- `day` (number): Día (1-31)

## 🎨 Diseño UI

### Características del Diseño
- **Dark Mode**: Tema oscuro por defecto
- **Glassmorphism**: Efectos de cristal esmerilado en cards
- **Gradientes**: Fondos con gradientes vibrantes
- **Responsive**: Mobile-first design
- **Animaciones**: Transiciones suaves

### Paleta de Colores
- **Primario**: Azul (#3B82F6)
- **Secundario**: Púrpura (#8B5CF6)
- **Acento**: Varios colores para gráficos
- **Fondo**: Degradado oscuro (slate-900 a purple-900)

## 🔍 Base de Datos OsTicket

### Configuración Confirmada
- **Field ID 55**: Campo "Sistema" (list-7)
- **Status ID 2**: Resuelto (por el equipo)
- **Status ID 3**: Cerrado (por Ezequiel)

### Sistemas
- Fiscal (ID: 90)
- Gestion (ID: 89)
- Control de Cajas (ID: 88)
- Numis Baires / Giro / VyV (ID: 86)
- Riscos (ID: 91)
- Otro (ID: 106)

### Tipificaciones
- Consulta Data (ID: 131)
- Consulta Funcional (ID: 107)
- Incidente Funcional (ID: 92)
- Reporte Data (ID: 132)
- Reporte Funcional (ID: 93)
- Requerimiento Actualización-Modificación (ID: 94)
- Requerimiento Data (ID: 129)
- Requerimiento Funcional (ID: 127)

## 🚦 Iniciar Dashboard

### ⚠️ IMPORTANTE: Túnel SSH Requerido

La base de datos MySQL no es accesible directamente desde Windows. Necesitas crear un túnel SSH primero.

### Opción 1: Script Automático (Recomendado)

**Terminal 1** - Iniciar túnel SSH:
```powershell
.\start-tunnel.ps1
```
Ingresar contraseña SSH cuando se solicite.
**Dejar esta terminal abierta**

**Terminal 2** - Iniciar dashboard:
```powershell
.\start-all.ps1
```

### Opción 2: Manual (3 Terminales)

**Terminal 1** - Túnel SSH:
```bash
ssh -L 3307:localhost:3306 soporte@<SERVER_IP> -N
# Ingresar contraseña SSH cuando se solicite
# Dejar abierto
```

**Terminal 2** - Backend:
```bash
cd backend
npm run dev
```

**Terminal 3** - Frontend:
```bash
cd frontend
npm run dev
```

### Verificar Túnel SSH

Para verificar que el túnel está activo:
```powershell
Test-NetConnection -ComputerName localhost -Port 3307
```

Deberías ver `TcpTestSucceeded : True`

## 🔒 Seguridad

- Sin autenticación (uso interno del sector)
- Credenciales en .env (no commitear a Git)
- CORS configurado para localhost en desarrollo

## 📝 Notas de Desarrollo

- El backend usa **tsx watch** para hot reload
- El frontend usa **Vite HMR** para cambios instantáneos
- Todas las queries SQL están optimizadas con índices
- Los filtros son opcionales y combinables

## 🐛 Troubleshooting

### Backend no conecta a MySQL
- Verificar credenciales en `.env`
- Verificar que MySQL esté accesible desde la red
- Probar conexión: `mysql -h <DB_HOST> -u <DB_USER> -p`

### Frontend no carga datos
- Verificar que el backend esté corriendo en puerto 3000
- Revisar consola del navegador para errores CORS
- Verificar variable `VITE_API_URL` en `.env`

### Gráficos no se muestran
- Verificar que haya datos en la respuesta de la API
- Revisar formato de datos en tipos TypeScript
- Comprobar que Recharts esté instalado correctamente

## 👥 Autores

**Soporte Funcional y Data**

## 📄 Licencia

Uso interno - Todos los derechos reservados
