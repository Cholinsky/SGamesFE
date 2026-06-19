PRINT '=== SGames - Revision de publicaciones ===';

SELECT
    p.Id,
    p.Title,
    p.Category,
    p.IsVisible,
    p.PublishDate,
    p.ExpireDate,
    u.Username AS Author,
    p.CreatedAt
FROM Posts p
INNER JOIN Users u
    ON p.AuthorId = u.Id
ORDER BY p.CreatedAt DESC;

PRINT '=== Publicaciones visibles ===';

SELECT
    p.Id,
    p.Title,
    p.Category,
    p.PublishDate,
    p.CreatedAt
FROM Posts p
WHERE p.IsVisible = 1
ORDER BY
    ISNULL(p.PublishDate, p.CreatedAt) DESC;

PRINT '=== Publicaciones ocultas ===';

SELECT
    p.Id,
    p.Title,
    p.Category,
    p.CreatedAt
FROM Posts p
WHERE p.IsVisible = 0
ORDER BY p.CreatedAt DESC;
