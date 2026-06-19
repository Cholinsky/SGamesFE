PRINT '=== SGames - Revision de integridad general ===';

------------------------------------------------------------
-- 1. Eventos activos duplicados
------------------------------------------------------------

PRINT '=== Eventos activos ===';

SELECT
    Id,
    Name,
    StartDate,
    EndDate,
    IsActive,
    IsPublished,
    CreatedAt
FROM Events
WHERE IsActive = 1;

PRINT '=== Validacion: debe existir SOLO 1 evento activo ===';

SELECT
    COUNT(*) AS TotalEventosActivos
FROM Events
WHERE IsActive = 1;


------------------------------------------------------------
-- 2. Settings duplicados
------------------------------------------------------------

PRINT '=== Settings existentes ===';

SELECT
    Id,
    EventName,
    ContactEmail,
    TwitchUrl,
    YoutubeUrl,
    DiscordUrl,
    TwitterUrl
FROM Settings
ORDER BY Id;

PRINT '=== Validacion: normalmente debe existir SOLO 1 registro en Settings ===';

SELECT
    COUNT(*) AS TotalSettings
FROM Settings;


------------------------------------------------------------
-- 3. Postulaciones sin relaciones principales
------------------------------------------------------------

PRINT '=== Postulaciones sin evento valido ===';

SELECT
    a.Id,
    a.RunnerName,
    a.Email,
    a.EventId,
    a.Status,
    a.SubmittedAt
FROM Applications a
LEFT JOIN Events e
    ON a.EventId = e.Id
WHERE e.Id IS NULL;

PRINT '=== Postulaciones sin juego valido ===';

SELECT
    a.Id,
    a.RunnerName,
    a.Email,
    a.GameId,
    a.Status,
    a.SubmittedAt
FROM Applications a
LEFT JOIN Games g
    ON a.GameId = g.Id
WHERE g.Id IS NULL;

PRINT '=== Postulaciones sin categoria valida ===';

SELECT
    a.Id,
    a.RunnerName,
    a.Email,
    a.CategoryId,
    a.Status,
    a.SubmittedAt
FROM Applications a
LEFT JOIN Categories c
    ON a.CategoryId = c.Id
WHERE c.Id IS NULL;

PRINT '=== Postulaciones sin plataforma valida ===';

SELECT
    a.Id,
    a.RunnerName,
    a.Email,
    a.PlatformId,
    a.Status,
    a.SubmittedAt
FROM Applications a
LEFT JOIN Platforms p
    ON a.PlatformId = p.Id
WHERE p.Id IS NULL;


------------------------------------------------------------
-- 4. Estados raros en postulaciones
------------------------------------------------------------

PRINT '=== Estados distintos encontrados en Applications ===';

SELECT
    Status,
    COUNT(*) AS Total
FROM Applications
GROUP BY Status
ORDER BY Total DESC;

PRINT '=== Postulaciones con estado no reconocido ===';

SELECT
    Id,
    RunnerName,
    Email,
    Status,
    SubmittedAt
FROM Applications
WHERE Status NOT IN (
    'Pending',
    'Approved',
    'Rejected'
);


------------------------------------------------------------
-- 5. Prioridades raras en postulaciones
------------------------------------------------------------

PRINT '=== Prioridades distintas encontradas en Applications ===';

SELECT
    Priority,
    COUNT(*) AS Total
FROM Applications
GROUP BY Priority
ORDER BY Total DESC;

PRINT '=== Postulaciones con prioridad vacia o nula ===';

SELECT
    Id,
    RunnerName,
    Email,
    Status,
    Priority,
    SubmittedAt
FROM Applications
WHERE
    Priority IS NULL
    OR LTRIM(RTRIM(Priority)) = '';


------------------------------------------------------------
-- 6. Postulaciones aprobadas fuera del horario
------------------------------------------------------------

PRINT '=== Postulaciones aprobadas que NO estan en horario ===';

SELECT
    a.Id,
    a.RunnerName,
    a.Email,
    g.Name AS Game,
    c.Name AS Category,
    p.Name AS Platform,
    a.EstimatedTimeMinutes,
    a.Status,
    a.SubmittedAt
FROM Applications a
INNER JOIN Games g
    ON a.GameId = g.Id
INNER JOIN Categories c
    ON a.CategoryId = c.Id
INNER JOIN Platforms p
    ON a.PlatformId = p.Id
WHERE
    a.Status = 'Approved'
    AND NOT EXISTS (
        SELECT 1
        FROM ScheduleEntries se
        WHERE se.ApplicationId = a.Id
    )
ORDER BY a.SubmittedAt DESC;


------------------------------------------------------------
-- 7. Entradas de horario sin relaciones validas
------------------------------------------------------------

PRINT '=== ScheduleEntries sin dia valido ===';

SELECT
    se.Id,
    se.ScheduleDayId,
    se.ApplicationId,
    se.EntryType,
    se.StartTime,
    se.DurationMinutes,
    se.PositionOrder
FROM ScheduleEntries se
LEFT JOIN ScheduleDays sd
    ON se.ScheduleDayId = sd.Id
WHERE sd.Id IS NULL;

PRINT '=== ScheduleEntries con ApplicationId pero sin postulacion valida ===';

SELECT
    se.Id,
    se.ScheduleDayId,
    se.ApplicationId,
    se.EntryType,
    se.StartTime,
    se.DurationMinutes,
    se.PositionOrder
FROM ScheduleEntries se
LEFT JOIN Applications a
    ON se.ApplicationId = a.Id
WHERE
    se.ApplicationId IS NOT NULL
    AND a.Id IS NULL;

PRINT '=== ScheduleEntries con duracion invalida ===';

SELECT
    se.Id,
    se.ScheduleDayId,
    se.ApplicationId,
    se.EntryType,
    se.StartTime,
    se.DurationMinutes,
    se.PositionOrder
FROM ScheduleEntries se
WHERE
    se.DurationMinutes IS NULL
    OR se.DurationMinutes <= 0;

PRINT '=== ScheduleEntries con EntryType vacio ===';

SELECT
    se.Id,
    se.ScheduleDayId,
    se.ApplicationId,
    se.EntryType,
    se.StartTime,
    se.DurationMinutes,
    se.PositionOrder
FROM ScheduleEntries se
WHERE
    se.EntryType IS NULL
    OR LTRIM(RTRIM(se.EntryType)) = '';


------------------------------------------------------------
-- 8. Dias de horario duplicados
------------------------------------------------------------

PRINT '=== Dias duplicados por evento ===';

SELECT
    EventId,
    DayDate,
    COUNT(*) AS Total
FROM ScheduleDays
GROUP BY
    EventId,
    DayDate
HAVING COUNT(*) > 1;

PRINT '=== Detalle de dias de horario ===';

SELECT
    e.Name AS EventName,
    sd.Id AS ScheduleDayId,
    sd.DayDate
FROM ScheduleDays sd
INNER JOIN Events e
    ON sd.EventId = e.Id
ORDER BY
    e.Name,
    sd.DayDate;


------------------------------------------------------------
-- 9. Posibles choques de horario
------------------------------------------------------------

PRINT '=== Posibles choques: misma fecha, misma hora ===';

SELECT
    sd.DayDate,
    se.StartTime,
    COUNT(*) AS TotalRunsEnMismaHora
FROM ScheduleEntries se
INNER JOIN ScheduleDays sd
    ON se.ScheduleDayId = sd.Id
GROUP BY
    sd.DayDate,
    se.StartTime
HAVING COUNT(*) > 1
ORDER BY
    sd.DayDate,
    se.StartTime;

PRINT '=== Detalle de runs por dia/hora ===';

SELECT
    sd.DayDate,
    se.StartTime,
    se.DurationMinutes,
    se.PositionOrder,
    a.RunnerName,
    g.Name AS Game,
    c.Name AS Category,
    p.Name AS Platform
FROM ScheduleEntries se
INNER JOIN ScheduleDays sd
    ON se.ScheduleDayId = sd.Id
LEFT JOIN Applications a
    ON se.ApplicationId = a.Id
LEFT JOIN Games g
    ON a.GameId = g.Id
LEFT JOIN Categories c
    ON a.CategoryId = c.Id
LEFT JOIN Platforms p
    ON a.PlatformId = p.Id
ORDER BY
    sd.DayDate,
    se.StartTime,
    se.PositionOrder;


------------------------------------------------------------
-- 10. Redes sociales de postulaciones con relaciones rotas
------------------------------------------------------------

PRINT '=== ApplicationSocialNetworks sin postulacion valida ===';

SELECT
    asn.Id,
    asn.ApplicationId,
    asn.SocialNetworkId,
    asn.Url
FROM ApplicationSocialNetworks asn
LEFT JOIN Applications a
    ON asn.ApplicationId = a.Id
WHERE a.Id IS NULL;

PRINT '=== ApplicationSocialNetworks sin red social valida ===';

SELECT
    asn.Id,
    asn.ApplicationId,
    asn.SocialNetworkId,
    asn.Url
FROM ApplicationSocialNetworks asn
LEFT JOIN SocialNetworks sn
    ON asn.SocialNetworkId = sn.Id
WHERE sn.Id IS NULL;

PRINT '=== ApplicationSocialNetworks con URL vacia ===';

SELECT
    asn.Id,
    asn.ApplicationId,
    asn.SocialNetworkId,
    sn.Name AS SocialNetwork,
    asn.Url
FROM ApplicationSocialNetworks asn
LEFT JOIN SocialNetworks sn
    ON asn.SocialNetworkId = sn.Id
WHERE
    asn.Url IS NULL
    OR LTRIM(RTRIM(asn.Url)) = '';


------------------------------------------------------------
-- 11. Catalogos duplicados
------------------------------------------------------------

PRINT '=== Juegos duplicados por nombre ===';

SELECT
    Name,
    COUNT(*) AS Total
FROM Games
GROUP BY Name
HAVING COUNT(*) > 1;

PRINT '=== Categorias duplicadas por nombre ===';

SELECT
    Name,
    COUNT(*) AS Total
FROM Categories
GROUP BY Name
HAVING COUNT(*) > 1;

PRINT '=== Plataformas duplicadas por nombre ===';

SELECT
    Name,
    COUNT(*) AS Total
FROM Platforms
GROUP BY Name
HAVING COUNT(*) > 1;

PRINT '=== Redes sociales duplicadas por nombre ===';

SELECT
    Name,
    COUNT(*) AS Total
FROM SocialNetworks
GROUP BY Name
HAVING COUNT(*) > 1;


------------------------------------------------------------
-- 12. Usuarios y roles
------------------------------------------------------------

PRINT '=== Usuarios sin rol valido ===';

SELECT
    u.Id,
    u.Username,
    u.Email,
    u.IsActive,
    u.RoleId
FROM Users u
LEFT JOIN Roles r
    ON u.RoleId = r.Id
WHERE r.Id IS NULL;

PRINT '=== Usuarios inactivos ===';

SELECT
    Id,
    Username,
    Email,
    IsActive,
    RoleId,
    CreatedAt
FROM Users
WHERE IsActive = 0;

PRINT '=== Roles existentes ===';

SELECT
    Id,
    Name,
    CreatedAt
FROM Roles
ORDER BY Id;


------------------------------------------------------------
-- 13. Publicaciones con datos incompletos
------------------------------------------------------------

PRINT '=== Publicaciones sin autor valido ===';

SELECT
    p.Id,
    p.Title,
    p.Category,
    p.AuthorId,
    p.IsVisible,
    p.CreatedAt
FROM Posts p
LEFT JOIN Users u
    ON p.AuthorId = u.Id
WHERE u.Id IS NULL;

PRINT '=== Publicaciones con titulo, contenido o categoria vacia ===';

SELECT
    Id,
    Title,
    Category,
    IsVisible,
    CreatedAt
FROM Posts
WHERE
    Title IS NULL
    OR LTRIM(RTRIM(Title)) = ''
    OR Content IS NULL
    OR LTRIM(RTRIM(Content)) = ''
    OR Category IS NULL
    OR LTRIM(RTRIM(Category)) = '';


------------------------------------------------------------
-- 14. Resumen final rapido
------------------------------------------------------------

PRINT '=== Resumen rapido de posibles problemas ===';

SELECT
    'Eventos activos' AS Revision,
    COUNT(*) AS Total
FROM Events
WHERE IsActive = 1

UNION ALL

SELECT
    'Settings',
    COUNT(*)
FROM Settings

UNION ALL

SELECT
    'Postulaciones con estado raro',
    COUNT(*)
FROM Applications
WHERE Status NOT IN (
    'Pending',
    'Approved',
    'Rejected'
)

UNION ALL

SELECT
    'ScheduleEntries sin dia valido',
    COUNT(*)
FROM ScheduleEntries se
LEFT JOIN ScheduleDays sd
    ON se.ScheduleDayId = sd.Id
WHERE sd.Id IS NULL

UNION ALL

SELECT
    'ScheduleEntries con ApplicationId roto',
    COUNT(*)
FROM ScheduleEntries se
LEFT JOIN Applications a
    ON se.ApplicationId = a.Id
WHERE
    se.ApplicationId IS NOT NULL
    AND a.Id IS NULL

UNION ALL

SELECT
    'ApplicationSocialNetworks con postulacion rota',
    COUNT(*)
FROM ApplicationSocialNetworks asn
LEFT JOIN Applications a
    ON asn.ApplicationId = a.Id
WHERE a.Id IS NULL

UNION ALL

SELECT
    'ApplicationSocialNetworks con red social rota',
    COUNT(*)
FROM ApplicationSocialNetworks asn
LEFT JOIN SocialNetworks sn
    ON asn.SocialNetworkId = sn.Id
WHERE sn.Id IS NULL

UNION ALL

SELECT
    'Usuarios sin rol valido',
    COUNT(*)
FROM Users u
LEFT JOIN Roles r
    ON u.RoleId = r.Id
WHERE r.Id IS NULL

UNION ALL

SELECT
    'Publicaciones sin autor valido',
    COUNT(*)
FROM Posts p
LEFT JOIN Users u
    ON p.AuthorId = u.Id
WHERE u.Id IS NULL;

