PRINT '=== SGames - Posibles datos de prueba ===';

SELECT
    Id,
    RunnerName,
    Email,
    DiscordUser,
    Status,
    SubmittedAt
FROM Applications
WHERE
    RunnerName LIKE '%test%'
    OR RunnerName LIKE '%prueba%'
    OR RunnerName LIKE '%demo%'
    OR Email LIKE '%test%'
    OR Email LIKE '%prueba%'
    OR Email LIKE '%demo%'
    OR Email LIKE '%example%'
    OR Email LIKE '%ejemplo%'
ORDER BY SubmittedAt DESC;

SELECT
    Id,
    Name,
    StartDate,
    EndDate,
    IsActive,
    IsPublished
FROM Events
WHERE
    Name LIKE '%test%'
    OR Name LIKE '%prueba%'
    OR Name LIKE '%demo%';

SELECT
    Id,
    Title,
    Category,
    IsVisible,
    CreatedAt
FROM Posts
WHERE
    Title LIKE '%test%'
    OR Title LIKE '%prueba%'
    OR Title LIKE '%demo%'
    OR Title LIKE '%falso%'
    OR Title LIKE '%placeholder%'
ORDER BY CreatedAt DESC;
