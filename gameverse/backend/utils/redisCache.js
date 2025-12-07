/**
 * Redis Caching Utility for News API and other cacheable data
 * Requires: redis package (npm install redis)
 * ENV: REDIS_URL (default: redis://localhost:6379)
 */

let redis = null;

const initRedis = () => {
  try {
    // Graceful fallback if Redis not available
    redis = require('redis');
    console.log('Redis cache utility loaded (requires redis connection)');
  } catch (err) {
    console.warn('Redis not installed or unavailable; will use fallback cache');
  }
};

/**
 * Get cached value or compute if missing
 * @param {string} key - Cache key
 * @param {number} ttlSeconds - Time to live in seconds
 * @param {Function} fetchFn - Async function to compute value if not cached
 * @returns {Promise<any>}
 */
const getOrCompute = async (key, ttlSeconds, fetchFn) => {
  try {
    if (!redis) {
      // Fallback: no Redis, just call function
      return await fetchFn();
    }

    const client = redis.createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    
    try {
      await client.connect();
      const cached = await client.get(key);
      
      if (cached) {
        console.log(`Cache HIT: ${key}`);
        return JSON.parse(cached);
      }

      console.log(`Cache MISS: ${key}, computing...`);
      const result = await fetchFn();
      
      // Set with TTL
      await client.setEx(key, ttlSeconds, JSON.stringify(result));
      
      return result;
    } finally {
      await client.quit();
    }
  } catch (err) {
    console.warn(`Cache operation failed for ${key}:`, err.message);
    // Fallback: compute without caching
    return await fetchFn();
  }
};

/**
 * Invalidate a cache key
 * @param {string} key - Cache key to invalidate
 */
const invalidate = async (key) => {
  try {
    if (!redis) return;

    const client = redis.createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    
    try {
      await client.connect();
      await client.del(key);
      console.log(`Cache invalidated: ${key}`);
    } finally {
      await client.quit();
    }
  } catch (err) {
    console.warn(`Cache invalidation failed for ${key}:`, err.message);
  }
};

/**
 * Invalidate all keys matching pattern
 * @param {string} pattern - Pattern to match (e.g., 'feed:*')
 */
const invalidatePattern = async (pattern) => {
  try {
    if (!redis) return;

    const client = redis.createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    
    try {
      await client.connect();
      const keys = await client.keys(pattern);
      if (keys.length > 0) {
        await client.del(keys);
        console.log(`Cache invalidated (pattern ${pattern}): ${keys.length} keys`);
      }
    } finally {
      await client.quit();
    }
  } catch (err) {
    console.warn(`Cache pattern invalidation failed for ${pattern}:`, err.message);
  }
};

initRedis();

module.exports = {
  getOrCompute,
  invalidate,
  invalidatePattern
};
