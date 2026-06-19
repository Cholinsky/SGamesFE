BEGIN TRANSACTION;

PRINT '=== PREVIEW: Aplicaciones de prueba que se eliminarian ===';

SELECT
    Id,
    RunnerName,
    Email,
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
    OR Email LIKE '%ejemplo%';

PRINT '=== PREVIEW: Redes sociales ligadas a aplicaciones de prueba ===';

SELECT
    asn.*
FROM ApplicationSocialNetworks asn
INNER JOIN Applications a
    ON asn.ApplicationId = a.Id
WHERE
    a.RunnerName LIKE '%test%'
    OR a.RunnerName LIKE '%prueba%'
    OR a.RunnerName LIKE '%demo%'
    OR a.Email LIKE '%test%'
    OR a.Email LIKE '%prueba%'
    OR a.Email LIKE '%demo%'
    OR a.Email LIKE '%example%'
    OR a.Email LIKE '%ejemplo%';

PRINT '=== PREVIEW: Entradas de horario ligadas a aplicaciones de prueba ===';

SELECT
    se.*
FROM ScheduleEntries se
INNER JOIN Applications a
    ON se.ApplicationId = a.Id
WHERE
    a.RunnerName LIKE '%test%'
    OR a.RunnerName LIKE '%prueba%'
    OR a.RunnerName LIKE '%demo%'
    OR a.Email LIKE '%test%'
    OR a.Email LIKE '%prueba%'
    OR a.Email LIKE '%demo%'
    OR a.Email LIKE '%example%'
    OR a.Email LIKE '%ejemplo%';

DELETE se
FROM ScheduleEntries se
INNER JOIN Applications a
    ON se.ApplicationId = a.Id
WHERE
    a.RunnerName LIKE '%test%'
    OR a.RunnerName LIKE '%prueba%'
    OR a.RunnerName LIKE '%demo%'
    OR a.Email LIKE '%test%'
    OR a.Email LIKE '%prueba%'
    OR a.Email LIKE '%demo%'
    OR a.Email LIKE '%example%'
    OR a.Email LIKE '%ejemplo%';

DELETE asn
FROM ApplicationSocialNetworks asn
INNER JOIN Applications a
    ON asn.ApplicationId = a.Id
WHERE
    a.RunnerName LIKE '%test%'
    OR a.RunnerName LIKE '%prueba%'
    OR a.RunnerName LIKE '%demo%'
    OR a.Email LIKE '%test%'
    OR a.Email LIKE '%prueba%'
    OR a.Email LIKE '%demo%'
    OR a.Email LIKE '%example%'
    OR a.Email LIKE '%ejemplo%';

DELETE FROM Applications
WHERE
    RunnerName LIKE '%test%'
    OR RunnerName LIKE '%prueba%'
    OR RunnerName LIKE '%demo%'
    OR Email LIKE '%test%'
    OR Email LIKE '%prueba%'
    OR Email LIKE '%demo%'
    OR Email LIKE '%example%'
    OR Email LIKE '%ejemplo%';

PRINT '=== RESULTADO DESPUES DE LA LIMPIEZA ===';

SELECT COUNT(*) AS ApplicationsRestantes
FROM Applications;

SELECT COUNT(*) AS ScheduleEntriesRestantes
FROM ScheduleEntries;

SELECT COUNT(*) AS ApplicationSocialNetworksRestantes
FROM ApplicationSocialNetworks;

-- IMPORTANTE:
-- Primero ejecuta con ROLLBACK.
-- Si todo se ve bien, cambia ROLLBACK por COMMIT.

ROLLBACK;
-- COMMIT;
