/**
 * FIXED VERSION - Search for locations by query string
 * 
 * FIXES APPLIED:
 * 1. Removed minimum 2-character restriction
 * 2. Better ZIP code matching (startsWith for better UX)
 * 3. Improved filtering logic
 */
export function searchLocations(query: string, limit: number = 200): LocationOption[] {
  if (!initialized) {
    console.warn('⚠️ Location service not initialized yet');
    return [];
  }
  
  // 🔧 FIX #2: Allow single-character searches
  // Removed: if (!query || query.length < 2) return [];
  if (!query) return [];

  const queryLower = query.trim().toLowerCase();
  if (queryLower.length === 0) return [];
  
  console.log(`🔍 Server searching for: "${queryLower}"`);
  
  // Search by city, state, or zip code
  const matches = locationOptions.filter(option => {
    // Match by city (starts with or contains)
    if (option.city.toLowerCase().startsWith(queryLower)) {
      return true;
    }
    if (option.city.toLowerCase().includes(queryLower)) {
      return true;
    }
    
    // Match by state (starts with or exact match)
    if (option.state.toLowerCase().startsWith(queryLower)) {
      return true;
    }
    
    // Match by full location value
    if (option.value.toLowerCase().includes(queryLower)) {
      return true;
    }
    
    // 🔧 IMPROVED: Better ZIP code matching
    // Match ZIPs that START with the query for better UX
    if (option.zips && option.zips.some(zip => zip.startsWith(queryLower))) {
      return true;
    }
    
    // Also match ZIPs that contain the query (fallback)
    if (option.zips && option.zips.some(zip => zip.includes(queryLower))) {
      return true;
    }
    
    return false;
  });

  console.log(`✅ Server found ${matches.length} matches for "${queryLower}"`);

  // Return lightweight objects with just the needed fields
  return matches.slice(0, limit).map(option => ({
    value: option.value,
    city: option.city, 
    state: option.state,
    zips: option.zips.slice(0, 5) // Limit ZIP list for reduced payload size
  }));
}
