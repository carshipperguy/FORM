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
 */
export function searchLocations(query: string, limit?: number): Promise<LocationOption[]>;

/**
 * Get popular locations
 */
export function getPopularLocations(limit?: number): Promise<LocationOption[]>;