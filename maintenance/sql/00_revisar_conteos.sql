PRINT '=== SGames - Conteos generales ===';

SELECT 'Users' AS Tabla, COUNT(*) AS Total
FROM Users;

SELECT 'Events' AS Tabla, COUNT(*) AS Total
FROM Events;

SELECT 'Applications' AS Tabla, COUNT(*) AS Total
FROM Applications;

SELECT 'Applications Pending' AS Tabla, COUNT(*) AS Total
FROM Applications
WHERE Status = 'Pending';

SELECT 'Applications Approved' AS Tabla, COUNT(*) AS Total
FROM Applications
WHERE Status = 'Approved';

SELECT 'Applications Rejected' AS Tabla, COUNT(*) AS Total
FROM Applications
WHERE Status = 'Rejected';

SELECT 'Games' AS Tabla, COUNT(*) AS Total
FROM Games;

SELECT 'Categories' AS Tabla, COUNT(*) AS Total
FROM Categories;

SELECT 'Platforms' AS Tabla, COUNT(*) AS Total
FROM Platforms;

SELECT 'ScheduleDays' AS Tabla, COUNT(*) AS Total
FROM ScheduleDays;

SELECT 'ScheduleEntries' AS Tabla, COUNT(*) AS Total
FROM ScheduleEntries;

SELECT 'SocialNetworks' AS Tabla, COUNT(*) AS Total
FROM SocialNetworks;

SELECT 'ApplicationSocialNetworks' AS Tabla, COUNT(*) AS Total
FROM ApplicationSocialNetworks;

SELECT 'Posts' AS Tabla, COUNT(*) AS Total
FROM Posts;

SELECT 'Settings' AS Tabla, COUNT(*) AS Total
FROM Settings;
