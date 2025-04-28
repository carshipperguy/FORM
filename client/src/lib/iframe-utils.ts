/**
 * Iframe Utility Functions
 * 
 * This module provides utilities to ensure consistent cross-origin and iframe-safe operations
 */

/**
 * Creates an absolute URL that works in both direct and iframe embedded contexts
 * 
 * @param path Relative or absolute path
 * @returns Absolute URL using the current origin
 */
export function createAbsoluteUrl(path: string): string {
  // If already an absolute URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // Get the current origin
  const origin = window.location.origin;
  
  // Ensure path starts with a slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${origin}${normalizedPath}`;
}

/**
 * Create fetch options with credentials included for cross-origin requests
 * 
 * @param options Existing fetch options object (optional)
 * @returns New fetch options with credentials included
 */
export function createFetchOptions(options?: RequestInit): RequestInit {
  return {
    ...options,
    credentials: 'include',
  };
}

/**
 * Make a fetch request that works consistently in iframe environments
 * 
 * @param url Relative or absolute URL
 * @param options Fetch options
 * @returns Fetch Promise
 */
export function iframeSafeFetch(url: string, options?: RequestInit): Promise<Response> {
  const absoluteUrl = createAbsoluteUrl(url);
  const fetchOptions = createFetchOptions(options);
  
  return fetch(absoluteUrl, fetchOptions);
}

/**
 * Extracts all URL parameters from the current location
 * Works in both direct and iframe embedded contexts
 * 
 * @returns Object with all URL parameters
 */
export function getUrlParameters(): Record<string, string> {
  const params: Record<string, string> = {};
  const searchParams = new URLSearchParams(window.location.search);
  
  // Use forEach instead of for...of to avoid TypeScript iterator issues
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
}

/**
 * Detects if the current page is running in an iframe
 * 
 * @returns Boolean indicating if running in iframe
 */
export function isRunningInIframe(): boolean {
  try {
    return window !== window.top;
  } catch (e) {
    // If accessing window.top throws an error due to cross-origin restrictions,
    // we're definitely in an iframe
    return true;
  }
}

/**
 * Logs iframe environment debug information to console
 */
export function logIframeDebugInfo(): void {
  const inIframe = isRunningInIframe();
  console.log('🔍 IFRAME DEBUG INFO:');
  console.log(`- Running in iframe: ${inIframe}`);
  console.log(`- Current origin: ${window.location.origin}`);
  console.log(`- Referrer: ${document.referrer}`);
  
  try {
    // Try to determine parent URL (may fail due to cross-origin restrictions)
    const parentUrl = inIframe ? (window.parent?.location?.href || 'Unknown (cross-origin)') : 'N/A';
    console.log(`- Parent URL: ${parentUrl}`);
  } catch (e) {
    console.log('- Parent URL: Unknown (cross-origin restriction)');
  }
}