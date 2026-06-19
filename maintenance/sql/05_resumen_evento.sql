PRINT '=== SGames - Resumen del evento activo ===';

SELECT
    Id,
    Name,
    Description,
    StartDate,
    EndDate,
    StreamUrl,
    DiscordUrl,
    IsActive,
    IsPublished,
    CreatedAt
FROM Events
WHERE IsActive = 1;

PRINT '=== Configuracion general ===';

SELECT *
FROM Settings;

PRINT '=== Resumen de postulaciones por estado ===';

SELECT
    Status,
    COUNT(*) AS Total
FROM Applications
GROUP BY Status;

PRINT '=== Resumen por plataforma ===';

SELECT
    p.Name AS Platform,
    COUNT(*) AS Total
FROM Applications a
INNER JOIN Platforms p
    ON a.PlatformId = p.Id
GROUP BY p.Name
ORDER BY Total DESC;

PRINT '=== Resumen por juego ===';

SELECT
    g.Name AS Game,
    COUNT(*) AS Total
FROM Applications a
INNER JOIN Games g
    ON a.GameId = g.Id
GROUP BY g.Name
ORDER BY Total DESC;
