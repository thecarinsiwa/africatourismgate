process.env.JWT_ACCESS_SECRET =
  process.env.JWT_ACCESS_SECRET ?? 'unit-test-access-secret-32chars-min!!';
process.env.JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET ?? 'unit-test-refresh-secret-32chars-min!';
process.env.SESSION_IDLE_LOCK_SECONDS =
  process.env.SESSION_IDLE_LOCK_SECONDS ?? '3600';
