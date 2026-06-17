# SGames - Sistema de Gestión de Eventos de Speedrun

Una aplicación web moderna y completa para la gestión de postulaciones y horarios de eventos de speedrunning.

## 🎮 Características Principales

### Para Usuarios Públicos
- **Página de Inicio**: Hero principal, características del evento, estadísticas y FAQ
- **Formulario de Postulación**: Envío de speedruns con validación completa
- **Horario Público**: Visualización del programa del evento con filtros

### Para Administradores
- **Dashboard**: Estadísticas y métricas del evento
- **Gestión de Postulaciones**: Tabla con filtros, aprobación/rechazo de runs
- **Constructor de Horarios**: Organizador drag & drop para crear el schedule
- **Sistema de Estados**: Seguimiento de postulaciones y publicaciones

## 🎨 Diseño

### Paleta de Colores
- **Fondo**: Gris oscuro (950, 900, 800)
- **Acentos Primarios**: Cyan (#06b6d4) y Púrpura (#9333ea)
- **Gradientes**: Cyan → Púrpura para elementos destacados
- **Estados**:
  - Verde: Aprobado/Éxito
  - Amarillo: Pendiente/Warning
  - Rojo: Rechazado/Error
  - Azul: Información

### Tipografía
- Fuentes modernas y legibles
- Escala clara de tamaños
- Uso de font-mono para horarios

## 📁 Estructura del Proyecto

```
src/app/
├── components/
│   ├── ui/              # Componentes de UI (shadcn/ui)
│   ├── StatusBadge.tsx  # Badge de estados
│   ├── StatCard.tsx     # Tarjetas de estadísticas
│   ├── EmptyState.tsx   # Estado vacío
│   └── LoadingSpinner.tsx
├── context/
│   └── AppContext.tsx   # Estado global
├── layouts/
│   ├── PublicLayout.tsx # Layout público
│   └── AdminLayout.tsx  # Layout admin
├── pages/
│   ├── HomePage.tsx
│   ├── PostulacionPage.tsx
│   ├── HorarioPage.tsx
│   ├── DesignSystemPage.tsx
│   ├── NotFound.tsx
│   └── admin/
│       ├── AdminDashboard.tsx
│       ├── AdminPostulaciones.tsx
│       └── AdminHorarios.tsx
├── routes.tsx
└── App.tsx
```

## 🚀 Pantallas Implementadas

### 1. Página de Inicio (`/`)
- Hero con título y llamados a la acción
- Sección de características con iconos
- Estadísticas del evento
- FAQ con acordeón
- Footer con redes sociales

### 2. Formulario de Postulación (`/postulacion`)
- Información personal (nombre, email)
- Información del speedrun (juego, categoría, tiempo, plataforma)
- Video demostrativo (validación de URL de YouTube)
- Redes sociales dinámicas (agregar/eliminar)
- Validación de formularios con react-hook-form
- Mensajes de éxito/error

### 3. Horario Público (`/horario`)
- Filtros por día y juego
- Organización por días (Viernes, Sábado, Domingo)
- Badges de estado: En vivo, Próximo, Completado
- Información completa de cada run

### 4. Dashboard Admin (`/admin`)
- 4 tarjetas de estadísticas principales
- Gráfica de actividad semanal (recharts)
- Distribución por plataforma (gráfica de pastel)
- Lista de postulaciones recientes

### 5. Gestión de Postulaciones (`/admin/postulaciones`)
- Tabla completa de postulaciones
- Filtros por estado, plataforma y búsqueda
- Acciones: Ver detalle, Aprobar, Rechazar
- Modal con información completa de la postulación

### 6. Constructor de Horarios (`/admin/horarios`)
- Sistema drag & drop con react-dnd
- Columnas por día del evento
- Reorganización visual de runs
- Edición de horarios
- Estados: Borrador/Publicado
- Guardar y publicar horarios

### 7. Sistema de Diseño (`/design-system`)
- Documentación completa de componentes
- Paleta de colores
- Botones y variantes
- Inputs y formularios
- Badges y estados
- Cards
- Iconos

## 🛠️ Tecnologías Utilizadas

- **React 18** - Framework principal
- **React Router 7** - Navegación y rutas
- **TypeScript** - Tipado estático
- **Tailwind CSS v4** - Estilos
- **Radix UI** - Componentes base accesibles
- **shadcn/ui** - Sistema de componentes
- **React Hook Form** - Manejo de formularios
- **React DnD** - Drag and drop
- **Recharts** - Gráficas y visualizaciones
- **Lucide React** - Iconos
- **Sonner** - Notificaciones toast

## 🎯 Componentes Reutilizables

### StatusBadge
Muestra el estado de postulaciones, horarios, etc.
```tsx
<StatusBadge status="pending" />
<StatusBadge status="approved" />
<StatusBadge status="rejected" />
```

### StatCard
Tarjeta de estadística para el dashboard
```tsx
<StatCard
  title="Total Postulaciones"
  value="147"
  icon={FileText}
  gradient="from-cyan-500 to-blue-600"
  change="+12%"
/>
```

### EmptyState
Estado vacío con mensaje y acción opcional
```tsx
<EmptyState
  title="No hay postulaciones"
  description="Cuando recibas postulaciones, aparecerán aquí"
  icon={<FileText />}
  action={<Button>Crear</Button>}
/>
```

## 📱 Responsive Design

La aplicación es completamente responsive:
- **Mobile**: Menú hamburguesa, columnas apiladas
- **Tablet**: Grids de 2 columnas
- **Desktop**: Grids de 3-4 columnas, sidebar visible

## 🔐 Rutas

### Públicas
- `/` - Página de inicio
- `/postulacion` - Formulario de postulación
- `/horario` - Horario público del evento
- `/design-system` - Sistema de diseño

### Administrativas
- `/admin` - Dashboard
- `/admin/postulaciones` - Gestión de postulaciones
- `/admin/horarios` - Constructor de horarios

## 🎨 Estados de la Aplicación

### Postulaciones
- **Pendiente**: Postulación recibida, en revisión
- **Aprobada**: Postulación aceptada para el evento
- **Rechazada**: Postulación no aceptada

### Horarios
- **Borrador**: Horario en construcción, no visible públicamente
- **Publicado**: Horario oficial publicado

### Runs (en horario público)
- **En vivo**: Run actualmente en curso
- **Próximo**: Siguiente run programado
- **Completado**: Run finalizado

## 🚦 Próximos Pasos Sugeridos

1. **Integración con Backend**
   - Conectar con API REST o GraphQL
   - Persistencia real de datos
   - Autenticación de administradores

2. **Supabase Integration**
   - Base de datos PostgreSQL
   - Auth para administradores
   - Real-time updates

3. **Mejoras Adicionales**
   - Export de horarios (PDF, imagen)
   - Sistema de notificaciones
   - Chat en vivo durante el evento
   - Integración con Twitch
   - Donaciones y metas

## 📄 Licencia

Este proyecto es un demo/template para eventos de speedrunning.
