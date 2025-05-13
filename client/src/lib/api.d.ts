/**
 * API client type definitions
 */

export interface LocationOption {
  value: string;
  label?: string;
  city: string;
  state: string;
  zips: string[];
  zip?: string;
  population?: number;
}

/**
 * Make a GET request to the API
 * @param endpoint - The API endpoint (without /api prefix)
 * @param params - Query parameters to include in the request
 * @returns The response data
 */
export function apiGet<T>(endpoint: string, params?: Record<string, any>): Promise<T>;

/**
 * Make a POST request to the API
 * @param endpoint - The API endpoint (without /api prefix)
 * @param data - The data to send in the request body
 * @returns The response data
 */
export function apiPost<T>(endpoint: string, data?: Record<string, any>): Promise<T>;

/**
 * Search for locations by query
 * @param query - The search query (city, state, or zip)
 * @param limit - Maximum number of results to return
 * @returns Array of location objects
 */
export function searchLocations(query: string, limit?: number): Promise<LocationOption[]>;

/**
 * Get popular locations
 * @param limit - Maximum number of results to return
 * @param bypassCache - Whether to bypass the cache
 * @returns Array of location objects
 */
export function getPopularLocations(limit?: number, bypassCache?: boolean): Promise<LocationOption[]>;