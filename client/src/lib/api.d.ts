/**
 * Type definitions for API client
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
 */
export function apiGet(endpoint: string, params?: Record<string, any>): Promise<any>;

/**
 * Make a POST request to the API
 */
export function apiPost(endpoint: string, data?: Record<string, any>): Promise<any>;

/**
 * Search for locations by query
 * @param query The search query string (city, state, or ZIP)
 * @param limit Maximum number of results to return
 * @returns Promise resolving to an array of location options
 */
export function searchLocations(query: string, limit?: number): Promise<LocationOption[]>;

/**
 * Get popular locations
 * @param limit Maximum number of results to return
 * @param bypassCache Whether to bypass the cache
 * @returns Promise resolving to an array of location options
 */
export function getPopularLocations(limit?: number, bypassCache?: boolean): Promise<LocationOption[]>;