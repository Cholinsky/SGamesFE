# Respaldos SGames

Esta carpeta está pensada para organizar respaldos locales de la base de datos de SGames.

No subir respaldos reales al repositorio.

---

## Importante

Los respaldos pueden contener información sensible, como:

- Correos de runners
- Discord de participantes
- Redes sociales
- Postulaciones
- Datos de usuarios admin
- Información interna del evento

Por seguridad, los respaldos reales deben quedarse sólo en la máquina local o en un almacenamiento privado.

---

## Archivos que NO deben subirse al repo

No subir archivos como:

```txt
*.bak
*.bacpac
*.sqlbak
*.dump
*.zip
*.rar
*.7z
````

Tampoco subir scripts `.sql` que contengan datos reales exportados de producción.

---

## Recomendación para `.gitignore`

Agregar estas reglas al `.gitignore` del proyecto:

```gitignore
# =========================
# Database backups
# =========================
maintenance/backups/*
!maintenance/backups/README.md
*.bak
*.bacpac
*.sqlbak
*.dump
```

Esto permite conservar este README en GitHub, pero evita subir respaldos reales.

---

## Cuándo hacer respaldo

Crear respaldo en estos casos:

* Antes de limpiar datos de prueba.
* Antes de ejecutar scripts con `COMMIT`.
* Antes de modificar datos importantes en producción.
* Antes de publicar el horario final.
* Después de cerrar postulaciones.
* Antes del evento.
* Después del evento.
* Antes de hacer cambios grandes en tablas o controladores.

---

## Nombre recomendado para respaldos

Usar este formato:

```txt
SGamesDB_backup_YYYY-MM-DD_HH-mm.sql
```

Ejemplos:

```txt
SGamesDB_backup_2026-06-18_21-30.sql
SGamesDB_backup_2026-07-31_pre_evento.sql
SGamesDB_backup_2026-08-02_post_evento.sql
```

---

## Método recomendado con SQL Server Management Studio

Para generar un respaldo en formato script:

1. Abrir SQL Server Management Studio.
2. Conectarse a la base de datos.
3. Click derecho sobre la base.
4. Seleccionar `Tasks`.
5. Seleccionar `Generate Scripts`.
6. Elegir las tablas necesarias o toda la base.
7. Entrar a `Advanced`.
8. Buscar `Types of data to script`.
9. Seleccionar `Schema and data`.
10. Guardar el archivo localmente.
11. Verificar que el archivo se generó correctamente.
12. Guardarlo fuera del repositorio o dentro de `maintenance/backups/`, pero sin subirlo a Git.

---

## Método recomendado para revisión rápida antes de respaldo

Antes de crear respaldo, ejecutar:

```txt
maintenance/sql/00_revisar_conteos.sql
maintenance/sql/05_resumen_evento.sql
maintenance/sql/06_revisar_integridad.sql
```

Esto ayuda a confirmar el estado de la base antes de guardar la copia.

---

## Flujo seguro antes de limpiar datos

1. Ejecutar `00_revisar_conteos.sql`.
2. Ejecutar `01_revisar_datos_prueba.sql`.
3. Crear respaldo local.
4. Ejecutar `02_limpiar_datos_prueba_seguro.sql` con `ROLLBACK`.
5. Revisar resultados.
6. Si todo está correcto, cambiar a `COMMIT`.
7. Ejecutar nuevamente `00_revisar_conteos.sql`.
8. Ejecutar `06_revisar_integridad.sql`.
9. Guardar un segundo respaldo si la limpieza fue importante.

---

## Dónde guardar respaldos reales

Opciones recomendadas:

```txt
C:\Backups\SGames\
D:\Backups\SGames\
Unidad externa privada
Google Drive privado
OneDrive privado
```

Evitar guardarlos en:

```txt
Repositorio público
Carpetas sincronizadas públicamente
Discord
Chats
Correos sin cifrar
```

---

## Checklist rápido de respaldo

Antes de considerar un respaldo como válido:

```txt
[ ] El archivo existe.
[ ] El archivo tiene peso mayor a 0 KB.
[ ] El archivo abre correctamente en un editor.
[ ] El script contiene tablas esperadas.
[ ] El archivo no fue subido al repositorio.
[ ] El nombre incluye fecha y contexto.
```

---

## Estado actual

Respaldos manuales recomendados para el MVP.

Automatización futura opcional:

* Script PowerShell local.
* Tarea programada.
* Exportación desde panel admin.
* Copia automática a almacenamiento privado.
