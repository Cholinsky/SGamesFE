PRINT '=== SGames - Revision de horario ===';

SELECT
    e.Name AS EventName,
    e.IsActive,
    e.IsPublished,
    sd.DayDate,
    se.Id AS ScheduleEntryId,
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
INNER JOIN Events e
    ON sd.EventId = e.Id
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

PRINT '=== Runs aprobadas que NO estan en horario ===';

SELECT
    a.Id,
    a.RunnerName,
    g.Name AS Game,
    c.Name AS Category,
    p.Name AS Platform,
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
