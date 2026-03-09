const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 600, checkperiod: 120 }); // cache for 10 minutes

const cacheMiddleware = (duration) => {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }

        // Create a unique key based on URL and query params
        const key = req.originalUrl || req.url;

        // Check if we have a cached response
        const cachedResponse = cache.get(key);

        if (cachedResponse) {
            // Send cached response
            return res.json(cachedResponse);
        } else {
            // Override res.json to cache the response before sending it
            const originalJson = res.json;
            res.json = (body) => {
                // Only cache successful responses
                // We consider response successful if body.success !== false
                // Sometimes APIs don't return success payload, but HTTP status handles it usually
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    cache.set(key, body, duration || 600); // Default to 10 minutes (600s)
                }

                // Restore original function and call it
                res.json = originalJson;
                return res.json(body);
            };
            next();
        }
    };
};

module.exports = { cacheMiddleware, cache };
