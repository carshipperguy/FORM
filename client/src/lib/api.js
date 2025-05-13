/**
 * API client for making requests to the server
 * Handles the different environments (development vs production)
 * 
 * This client ensures that:
 * 1. In development, direct API calls to port 5000 are used for testing
 * 2. In production, relative paths are used to maintain proper tracking
 * 3. All API requests include proper error handling
 * 4. Performance is optimized by caching frequently accessed data
 */

// Get the current base URL to handle all environments (development, iframe, etc.)
// This ensures API calls work in all contexts including when embedded
const API_BASE_URL = '/api';

// Cache for popular locations to avoid unnecessary API calls
const API_CACHE = {
  popularLocations: null,
  lastFetched: 0,
  cacheDuration: 5 * 60 * 1000 // 5 minutes in milliseconds
};

/**
 * Make a GET request to the API
 * @param {string} endpoint - The API endpoint (without /api prefix)
 * @param {Object} params - Query parameters to include in the request
 * @returns {Promise<any>} - The response data
 */
export async function apiGet(endpoint, params = {}) {
  // Build query string from params object
  const queryString = Object.keys(params).length 
    ? '?' + new URLSearchParams(params).toString()
    : '';
    
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}${queryString}`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Make a POST request to the API
 * @param {string} endpoint - The API endpoint (without /api prefix)
 * @param {Object} data - The data to send in the request body
 * @returns {Promise<any>} - The response data
 */
export async function apiPost(endpoint, data = {}) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error posting to ${endpoint}:`, error);
    throw error;
  }
}

// Cache for location search queries to avoid unnecessary API calls
const SEARCH_CACHE = new Map();
const SEARCH_CACHE_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds

/**
 * Search for locations by query
 * @param {string} query - The search query (city, state, or zip)
 * @param {number} limit - Maximum number of results to return
 * @returns {Promise<Array>} - Array of location objects
 */
export async function searchLocations(query, limit = 200) {
  if (!query || query.length < 2) return [];
  
  // Normalize the query for consistent caching
  const normalizedQuery = query.trim().toLowerCase();
  const cacheKey = `${normalizedQuery}:${limit}`;
  
  // Check if we have a cached result for this query
  const now = Date.now();
  const cachedResult = SEARCH_CACHE.get(cacheKey);
  if (cachedResult && (now - cachedResult.timestamp < SEARCH_CACHE_DURATION)) {
    return cachedResult.data;
  }
  
  // Otherwise fetch from API
  try {
    // Use consistent API path for all environments
    const results = await apiGet('/location-search', { query: normalizedQuery, limit });
    
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
    console.error('Error searching locations:', error);
    // If we have a cached result, return it even if expired as a fallback
    if (cachedResult) {
      console.log('Using expired cache as fallback for location search');
      return cachedResult.data;
    }
    return [];
  }
}

/**
 * Get popular locations
 * @param {number} limit - Maximum number of results to return
 * @param {boolean} bypassCache - Whether to bypass the cache
 * @returns {Promise<Array>} - Array of location objects
 */
export async function getPopularLocations(limit = 200, bypassCache = false) {
  // Check if we have a valid cache and not bypassing
  const now = Date.now();
  if (!bypassCache && API_CACHE.popularLocations && 
      (now - API_CACHE.lastFetched < API_CACHE.cacheDuration)) {
    // Return cached data if available and not expired
    return API_CACHE.popularLocations.slice(0, limit);
  }
  
  // Otherwise fetch from API
  try {
    // Use consistent API path for all environments
    const results = await apiGet('/location-search/popular', { limit });
    
    // Update cache
    API_CACHE.popularLocations = results;
    API_CACHE.lastFetched = now;
    
    return results;
  } catch (error) {
    console.error('Error fetching popular locations:', error);
    // If we have cached data, return it even if expired as a fallback
    if (API_CACHE.popularLocations) {
      console.log('Using expired cache as fallback for popular locations');
      return API_CACHE.popularLocations.slice(0, limit);
    }
    return [];
  }
}