/**
 * Middleware to verify internal API key for cron jobs and internal services
 */
const verifyInternalApiKey = (req, res, next) => {
  const apiKey = req.headers["x-internal-api-key"];
  const expectedApiKey = process.env.INTERNAL_API_KEY;

  // If no internal API key is configured, skip this middleware
  if (!expectedApiKey) {
    console.warn(
      "⚠️ INTERNAL_API_KEY not configured. Internal API authentication disabled."
    );
    return next();
  }

  if (!apiKey) {
    return res.status(401).json({
      message: "Internal API key required",
      hint: "Add 'x-internal-api-key' header",
    });
  }

  if (apiKey !== expectedApiKey) {
    return res.status(401).json({
      message: "Invalid internal API key",
    });
  }

  // Mark request as internal
  req.isInternal = true;
  next();
};

module.exports = { verifyInternalApiKey };
