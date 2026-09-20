/**
 * Redis client (optional).
 *
 * If REDIS_URL is not set, this module exports `null` and the app runs exactly
 * as before — every read goes straight to MongoDB. If REDIS_URL is set but the
 * server is unreachable, commands fail fast and the cache layer falls back to
 * MongoDB (see services/cache.js). Nothing here can crash the process.
 */

const REDIS_URL = process.env.REDIS_URL;

let client = null;

if (REDIS_URL) {
  try {
    // Lazy require so the dependency is only needed when Redis is actually used.
    const Redis = require("ioredis");

    client = new Redis(REDIS_URL, {
      // Fail fast instead of buffering commands while disconnected.
      enableOfflineQueue: false,
      maxRetriesPerRequest: 2,
      // Give up reconnecting after a handful of attempts so a dead Redis
      // never turns into an infinite retry loop.
      retryStrategy(times) {
        if (times > 5) return null;
        return Math.min(times * 200, 2000);
      },
    });

    let loggedError = false;
    client.on("error", (err) => {
      if (!loggedError) {
        loggedError = true;
        console.warn("[redis] unavailable — cache disabled, reads fall back to MongoDB:", err.message);
      }
    });
    client.on("connect", () => {
      loggedError = false;
      console.log("[redis] connected");
    });
  } catch (err) {
    // A malformed REDIS_URL (e.g. accidentally pasting a `redis-cli ...`
    // command instead of a plain URL) throws SYNCHRONOUSLY here, before any
    // 'error' listener above can catch it. Without this try/catch that
    // crashes the whole server at boot — exactly what "nothing here can
    // crash the process" is supposed to guarantee.
    client = null;
    console.warn("[redis] invalid REDIS_URL — cache disabled, reads fall back to MongoDB:", err.message);
  }
} else {
  console.log("[redis] REDIS_URL not set — cache disabled, reads go straight to MongoDB");
}

module.exports = client;
