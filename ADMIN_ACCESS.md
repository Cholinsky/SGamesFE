# Acceso al Panel de Administración - SGames

## 🔐 Cómo acceder

### Desde la página principal:

1. Haz clic en el botón **"Admin"** en el menú superior (navegación de escritorio)
2. O en dispositivos móviles, abre el menú hamburguesa y selecciona **"Panel de Administración"**
3. Serás redirigido a la página de login

### Acceso directo:

Puedes acceder directamente a través de la URL: `/admin/login`

## 👤 Credenciales de demostración

```
Email: admin@sgames.com
Contraseña: admin123
```

## 📱 Características del sistema de autenticación

- **Protección de rutas**: Todas las rutas administrativas están protegadas
- **Sesión persistente**: La sesión se guarda en localStorage
- **Redirección automática**: Si intentas acceder a `/admin` sin estar autenticado, serás redirigido al login
- **Logout seguro**: Botón de cerrar sesión en el menú de usuario del panel admin

## 🎯 Rutas del panel de administración

Una vez autenticado, tendrás acceso a:

- `/admin` - Dashboard principal
- `/admin/postulaciones` - Gestión de postulaciones
- `/admin/horarios` - Constructor de horarios
- `/admin/publicaciones` - Gestión de publicaciones
- `/admin/configuracion` - Configuración del evento

## 🛡️ Seguridad

**IMPORTANTE**: Este es un sistema de autenticación de demostración. En producción:

1. Las credenciales deben ser validadas contra un backend real
2. Implementar JWT o sessions del lado del servidor
3. Agregar rate limiting para prevenir ataques de fuerza bruta
4. Implementar 2FA (autenticación de dos factores)
5. Usar HTTPS en producción
6. Implementar refresh tokens
7. Agregar logs de auditoría de accesos

## 🔄 Flujo de autenticación

```
1. Usuario visita la página pública
2. Hace clic en "Admin" en el navbar
3. Es redirigido a /admin/login
4. Ingresa credenciales
5. Si son válidas:
   - Usuario autenticado
   - Sesión guardada en localStorage
   - Redirigido a /admin (dashboard)
6. Si son inválidas:
   - Muestra mensaje de error
   - Permanece en login
```

## 🚪 Cerrar sesión

Para cerrar sesión:
1. Estando en el panel de administración
2. Haz clic en tu avatar/nombre en el header superior derecho
3. Selecciona "Cerrar Sesión"
4. Serás redirigido a la página principal

## 💻 Implementación técnica

El sistema utiliza:
- **Context API** de React para el estado global de autenticación
- **localStorage** para persistencia de sesión
- **Protected Routes** para proteger rutas administrativas
- **React Router** para la navegación

Archivos clave:
- `src/app/context/AuthContext.tsx` - Contexto de autenticación
- `src/app/components/ProtectedRoute.tsx` - Componente de protección de rutas
- `src/app/pages/admin/AdminLogin.tsx` - Página de login
- `src/app/layouts/AdminLayout.tsx` - Layout del panel con logout
