/**
 * API client for making requests to the server
 * Handles the different environments (development vs production)
 */

// In development, the Vite server runs on a different port than the Express server
// Use the appropriate base URL for API requests
const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:5000/api'
  : '/api';

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

/**
 * Search for locations by query
 * @param {string} query - The search query (city, state, or zip)
 * @param {number} limit - Maximum number of results to return
 * @returns {Promise<Array>} - Array of location objects
 */
export async function searchLocations(query, limit = 200) {
  if (!query || query.length < 2) return [];
  
  return apiGet('/location-search', { query, limit });
}

/**
 * Get popular locations
 * @param {number} limit - Maximum number of results to return
 * @returns {Promise<Array>} - Array of location objects
 */
export async function getPopularLocations(limit = 200) {
  return apiGet('/location-search/popular', { limit });
}