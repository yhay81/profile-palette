WITH session_funnel AS (
  SELECT
    session_id,
    MAX(name = 'visited') AS visited,
    MAX(name = 'started') AS activated,
    MAX(name = 'ready') AS value_created,
    MAX(name = 'exported') AS job_completed,
    MAX(name = 'shared') AS share_intent
  FROM product_events
  GROUP BY session_id
)
SELECT
  COALESCE(SUM(visited), 0) AS users,
  COALESCE(SUM(activated), 0) AS activated,
  COALESCE(SUM(value_created), 0) AS value_created,
  COALESCE(SUM(job_completed), 0) AS job_completed,
  COALESCE(SUM(share_intent), 0) AS share_intent,
  (
    SELECT COUNT(*)
    FROM (
      SELECT session_id
      FROM product_events
      WHERE name = 'exported'
      GROUP BY session_id
      HAVING COUNT(DISTINCT occurred_on) >= 2
    )
  ) AS returned,
  (
    SELECT COUNT(DISTINCT session_id)
    FROM product_events
    WHERE name = 'visited'
      AND created_at >= unixepoch() - 604800
  ) AS users_7d,
  (
    SELECT COUNT(DISTINCT session_id)
    FROM product_events
    WHERE name = 'exported'
      AND created_at >= unixepoch() - 604800
  ) AS exports_7d
FROM session_funnel;
