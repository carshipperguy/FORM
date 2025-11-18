// ... (keep all existing code above searchLocations) ...

/**
 * FIXED VERSION - Search for locations by query
 * 
 * FIXES APPLIED:
 * 1. Removed minimum 2-character restriction
 * 2. Better error handling
 * 3. Trim whitespace but allow single-character searches
 * 
 * @param {string} query - The search query (city, state, or zip)
 * @param {number} limit - Maximum number of results to return
 * @returns {Promise<Array>} - Array of location objects
 */
export async function searchLocations(query, limit = 200) {
  // 🔧 FIX #2: Allow single-character searches
  // Removed: if (!query || query.length < 2) return [];
  
  if (!query) return [];
  
  // Normalize the query for consistent caching
  const normalizedQuery = query.trim().toLowerCase();
  
  // 🔧 NEW: Return empty if only whitespace
  if (normalizedQuery.length === 0) return [];
  
  const cacheKey = `${normalizedQuery}:${limit}`;
  
  // Check if we have a cached result for this query
  const now = Date.now();
  const cachedResult = SEARCH_CACHE.get(cacheKey);
  if (cachedResult && (now - cachedResult.timestamp < SEARCH_CACHE_DURATION)) {
    console.log(`📦 Cache hit for "${normalizedQuery}"`);
    return cachedResult.data;
  }
  
  // Otherwise fetch from API
  try {
    console.log(`🌐 API request for "${normalizedQuery}"`);
    
    const results = await apiGet('/location-search', { query: normalizedQuery, limit });
    
    console.log(`✅ API returned ${results.length} results for "${normalizedQuery}"`);
    
    // Cache the results
    SEARCH_CACHE.set(cacheKey, {
      data: results,
      timestamp: now
    });
    
    // Clean up old cache entries to prevent memory leaks
    if (SEARCH_CACHE.size > 100) {
      const expiredTime = now - SEARCH_CACHE_DURATION;
      for (const [key, value] of SEARCH_CACHE.entries()) {
        if (value.timestamp < expiredTime) {
          SEARCH_CACHE.delete(key);
        }
      }
    }
    
    return results;
  } catch (error) {
    console.error(`❌ Error searching for "${normalizedQuery}":`, error);
    // If we have a cached result, return it even if expired as a fallback
    if (cachedResult) {
      console.log('⚠️ Using expired cache as fallback for location search');
      return cachedResult.data;
    }
    return [];
  }
}
