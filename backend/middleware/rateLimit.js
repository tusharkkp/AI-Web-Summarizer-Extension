function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function createRateLimiter({
  windowMs = positiveInteger(process.env.RATE_LIMIT_WINDOW_MS, 10 * 60 * 1000),
  maxRequests = positiveInteger(process.env.RATE_LIMIT_MAX, 20),
} = {}) {
  const requests = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const clientId = req.ip || req.socket.remoteAddress || "unknown";

    for (const [key, entry] of requests) {
      if (entry.resetAt <= now) requests.delete(key);
    }

    const current = requests.get(clientId) || { count: 0, resetAt: now + windowMs };

    if (current.count >= maxRequests) {
      const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
      res.setHeader("Retry-After", retryAfterSeconds);
      return res.status(429).json({
        success: false,
        message: "Too many summary requests. Please try again shortly.",
      });
    }

    current.count += 1;
    requests.set(clientId, current);
    res.setHeader("RateLimit-Limit", maxRequests);
    res.setHeader("RateLimit-Remaining", Math.max(0, maxRequests - current.count));
    next();
  };
}
