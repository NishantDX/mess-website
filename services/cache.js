/**
 * Best-effort cache helpers on top of config/redis.js.
 *
 * Every function is guarded: if Redis is disabled (no REDIS_URL) or throws,
 * cacheGet returns null and cacheSet / cacheDel do nothing. Callers just treat
 * a null from cacheGet as "not cached" and read from MongoDB.
 */

const client = require("../config/redis");

async function cacheGet(key) {
  if (!client) return null;
  try {
    const raw = await client.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

async function cacheSet(key, value, ttlSeconds = 3600) {
  if (!client) return;
  try {
    await client.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (err) {
    /* ignore — cache is best-effort */
  }
}

async function cacheDel(...keys) {
  if (!client || keys.length === 0) return;
  try {
    await client.del(keys.flat());
  } catch (err) {
    /* ignore */
  }
}

module.exports = { cacheGet, cacheSet, cacheDel };
