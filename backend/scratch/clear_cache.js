// Quick cache clear for property-types - run once to invalidate the in-memory cache
const { cache } = require('./middleware/cache');

try {
  const allKeys = cache.keys();
  let cleared = 0;
  allKeys.forEach(key => {
    if (key.includes('property-types') || key.includes('property_types')) {
      cache.del(key);
      cleared++;
      console.log('Cleared cache key:', key);
    }
  });
  console.log(`Cleared ${cleared} cache entries`);
  if (cleared === 0) {
    console.log('No property-types cache entries found (may already be expired or not cached yet)');
  }
} catch (e) {
  console.log('Cache module not accessible from this process (expected). Cache will expire automatically within 10 minutes.');
}
