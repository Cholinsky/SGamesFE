````md
# Mantenimiento SGames

Esta carpeta contiene scripts y guías para revisar, limpiar y respaldar la base de datos de SGames.

El objetivo es tener un flujo seguro para mantenimiento sin afectar datos reales por accidente.

---

## Estructura

```txt
maintenance/
├── sql/
│   ├── 00_revisar_conteos.sql
│   ├── 01_revisar_datos_prueba.sql
│   ├── 02_limpiar_datos_prueba_seguro.sql
│   ├── 03_revisar_horario.sql
│   ├── 04_revisar_publicaciones.sql
│   ├── 05_resumen_evento.sql
│   └── 06_revisar_integridad.sql
│
├── backups/
│   └── README.md
│
└── README.md
````

---

## Orden recomendado de revisión

Para una revisión normal de producción, ejecutar en este orden:

```txt
00_revisar_conteos.sql
01_revisar_datos_prueba.sql
03_revisar_horario.sql
04_revisar_publicaciones.sql
05_resumen_evento.sql
06_revisar_integridad.sql
```

El script `02_limpiar_datos_prueba_seguro.sql` debe ejecutarse únicamente cuando se quiera limpiar datos de prueba.

---

## Descripción de scripts

### `00_revisar_conteos.sql`

Muestra conteos generales de tablas principales:

* Usuarios
* Eventos
* Postulaciones
* Horario
* Redes sociales
* Publicaciones
* Settings

Útil para revisar rápidamente el estado general de la base.

---

### `01_revisar_datos_prueba.sql`

Busca posibles datos de prueba o demo.

Detecta registros con palabras como:

```txt
test
prueba
demo
example
ejemplo
placeholder
```

Debe ejecutarse antes de limpiar información falsa.

---

### `02_limpiar_datos_prueba_seguro.sql`

Limpia postulaciones de prueba y datos relacionados.

Este script está protegido con transacción.

Por defecto debe quedar así:

```sql
ROLLBACK;
-- COMMIT;
```

Primero se ejecuta con `ROLLBACK` para revisar qué eliminaría.

Sólo cuando se confirme que todo está correcto, cambiar a:

```sql
-- ROLLBACK;
COMMIT;
```

No ejecutar con `COMMIT` sin respaldo reciente.

---

### `03_revisar_horario.sql`

Revisa el horario del evento.

Muestra:

* Días del horario
* Runs agregadas
* Horas
* Duraciones
* Runner
* Juego
* Categoría
* Plataforma
* Días duplicados
* Runs aprobadas que aún no están en horario

---

### `04_revisar_publicaciones.sql`

Revisa publicaciones administrativas.

Muestra:

* Publicaciones visibles
* Publicaciones ocultas
* Autor
* Categoría
* Fecha de creación
* Fecha de publicación
* Fecha de expiración

---

### `05_resumen_evento.sql`

Muestra un resumen del evento activo.

Incluye:

* Evento activo
* Fechas
* Estado publicado/despublicado
* Configuración general
* Resumen de postulaciones por estado
* Resumen por plataforma
* Resumen por juego

---

### `06_revisar_integridad.sql`

Revisa posibles problemas de integridad.

Detecta:

* Más de un evento activo
* Más de un registro en Settings
* Postulaciones sin evento válido
* Postulaciones sin juego válido
* Postulaciones sin categoría válida
* Postulaciones sin plataforma válida
* Estados raros
* Prioridades vacías
* ScheduleEntries con relaciones rotas
* Días duplicados
* Choques por misma fecha y hora
* Redes sociales ligadas a postulaciones inexistentes
* Usuarios sin rol válido
* Publicaciones sin autor válido

Este script no borra ni modifica información.

---

## Flujo recomendado antes de limpiar datos

Antes de ejecutar cualquier limpieza:

1. Ejecutar `00_revisar_conteos.sql`.
2. Ejecutar `01_revisar_datos_prueba.sql`.
3. Ejecutar `05_resumen_evento.sql`.
4. Crear respaldo local de la base.
5. Ejecutar `02_limpiar_datos_prueba_seguro.sql` con `ROLLBACK`.
6. Revisar los resultados.
7. Si todo es correcto, cambiar `ROLLBACK` por `COMMIT`.
8. Ejecutar nuevamente `00_revisar_conteos.sql`.
9. Ejecutar `06_revisar_integridad.sql`.

---

## Flujo recomendado antes del evento

Antes de publicar el horario final:

1. Ejecutar `00_revisar_conteos.sql`.
2. Ejecutar `03_revisar_horario.sql`.
3. Ejecutar `05_resumen_evento.sql`.
4. Ejecutar `06_revisar_integridad.sql`.
5. Revisar que no existan runs aprobadas fuera del horario.
6. Revisar que no existan días duplicados.
7. Revisar que el evento activo sea correcto.
8. Crear respaldo local.
9. Publicar horario desde el panel admin.
10. Probar la página pública de horario.

---

## Reglas de seguridad

* No subir respaldos reales al repositorio.
* No subir archivos `.bak`, `.bacpac` o dumps con datos reales.
* No guardar contraseñas en scripts.
* No ejecutar scripts destructivos sin respaldo.
* No usar `COMMIT` si no se revisó primero con `ROLLBACK`.
* Probar primero en local cuando sea posible.

---

## Comandos Git recomendados

Después de agregar o modificar scripts:

```bash
git add maintenance/
git commit -m "Update maintenance scripts"
git push
```

---

## Estado actual

Scripts principales de mantenimiento:

```txt
Completado para MVP
```

Pendientes futuros opcionales:

* Automatizar respaldos.
* Crear exportación manual desde panel admin.
* Crear checklist pre-evento.
* Crear checklist post-evento.

```
```
