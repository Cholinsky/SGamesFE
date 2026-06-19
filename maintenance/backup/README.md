# Respaldos SGames

Esta carpeta es para respaldos locales de la base de datos.

No subir respaldos reales al repositorio.

## Reglas

- Antes de limpiar datos, crear respaldo.
- Antes del evento, crear respaldo.
- Después de cambios grandes en producción, crear respaldo.
- No guardar contraseñas en archivos del repositorio.

## Formato recomendado

SGamesDB_backup_YYYY-MM-DD_HH-mm.sql

Ejemplo:

SGamesDB_backup_2026-06-18_21-30.sql

## Método recomendado

Usar SQL Server Management Studio:

1. Conectarse a la base de producción.
2. Click derecho sobre la base.
3. Tasks / Tareas.
4. Generate Scripts / Generar scripts.
5. Seleccionar tablas.
6. Advanced.
7. Types of data to script: Schema and data.
8. Guardar el archivo localmente.
9. Verificar que el archivo se generó correctamente.

## Antes de ejecutar scripts destructivos

Ejecutar:

- maintenance/sql/00_revisar_conteos.sql
- maintenance/sql/01_revisar_datos_prueba.sql
- maintenance/sql/05_resumen_evento.sql

Luego crear respaldo.

Después ejecutar scripts de limpieza primero con ROLLBACK.
