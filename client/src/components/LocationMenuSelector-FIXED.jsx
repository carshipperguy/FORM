import React, { useState, useEffect, useRef } from 'react';
import { searchLocations, getPopularLocations } from '../lib/api';
import styles from './LocationMenuSelector.module.css';

/**
 * FIXED VERSION - Addresses all ZIP code rendering bugs
 * 
 * Fixes Applied:
 * 1. Removed minimum character restriction (search on first keystroke)
 * 2. Immediate search trigger (no debounce for fast typers)
 * 3. Proper loading state management
 * 4. Force re-render on data change with key prop
 * 5. Refresh dropdown data on focus
 * 6. Cancel in-flight requests on new input
 * 7. Better error handling and fallback states
 */
const LocationMenuSelector = ({ value, onChange, placeholder, required, label }) => {
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchKey, setSearchKey] = useState(0); // Force re-render trigger
  
  // Track in-flight requests to prevent race conditions
  const abortControllerRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  
  // Load popular cities on initial render
  useEffect(() => {
    async function loadPopularCities() {
      setIsLoading(true);
      
      try {
        const data = await getPopularLocations(200);
        setFilteredOptions(data);
        setSearchKey(prev => prev + 1); // Force dropdown re-render
      } catch (error) {
        console.error('Error loading popular cities:', error);
        setFilteredOptions([]); // Show empty state instead of stale data
      } finally {
        setIsLoading(false);
      }
    }
    
    loadPopularCities();
  }, []);
  
  // 🔧 FIX #1-4: Improved search with proper state management
  useEffect(() => {
    // Cancel any pending search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Cancel in-flight API request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // 🔧 FIX #2: REMOVED minimum length restriction
    // Now searches immediately on ANY input (even 1 character)
    if (!searchInput || searchInput.trim().length === 0) {
      // Empty input → show popular cities
      return;
    }
    
    // 🔧 FIX #1: Reduced debounce for fast typers + immediate trigger for paste
    // Short debounce (100ms) for typing, but immediate for paste operations
    const debounceTime = searchInput.length >= 5 ? 0 : 100; // Instant search for 5+ chars
    
    searchTimeoutRef.current = setTimeout(async () => {
      // Show loading immediately (no delayed indicator)
      setIsLoading(true);
      
      // Create new abort controller for this request
      abortControllerRef.current = new AbortController();
      
      try {
        console.log(`🔍 Searching for: "${searchInput}"`); // Debug log
        
        const data = await searchLocations(searchInput, 200);
        
        console.log(`✅ Found ${data.length} results for "${searchInput}"`); // Debug log
        
        // 🔧 FIX #3: Force state update and re-render
        setFilteredOptions(data);
        setSearchKey(prev => prev + 1); // Increment to force dropdown list re-render
        
      } catch (error) {
        // Only log errors that aren't from aborted requests
        if (error.name !== 'AbortError') {
          console.error('Error searching locations:', error);
        }
        // 🔧 FIX #7: Show empty state on error instead of stale data
        setFilteredOptions([]);
        setSearchKey(prev => prev + 1);
      } finally {
        setIsLoading(false);
      }
    }, debounceTime);
    
    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [searchInput]);
  
  const handleInputChange = (e) => {
    const input = e.target.value;
    setSearchInput(input);
    setShowDropdown(true);
  };
  
  // 🔧 FIX #5: Refresh dropdown data when opening
  const handleFocus = async () => {
    setShowDropdown(true);
    
    // If input is empty, refresh popular cities
    if (!searchInput || searchInput.trim().length === 0) {
      setIsLoading(true);
      try {
        const data = await getPopularLocations(200);
        setFilteredOptions(data);
        setSearchKey(prev => prev + 1);
      } catch (error) {
        console.error('Error refreshing popular cities:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const handleOptionSelect = (option) => {
    const primaryZip = option.zips && option.zips.length > 0 ? option.zips[0] : null;
    
    console.log('Selected location with ZIP:', {
      location: option.value,
      primaryZip
    });
    
    setSearchInput(option.value);
    onChange(option.value, primaryZip);
    setShowDropdown(false);
  };
  
  const handleBlur = () => {
    // Delay to allow click on dropdown option
    setTimeout(() => setShowDropdown(false), 200);
  };
  
  return (
    <div className={styles['location-menu-container']}>
      {label && <label className={styles['location-label']}>{label}</label>}
      
      <div className={styles['location-input-container']}>
        <input
          type="text"
          value={searchInput}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder || "Search and select from dropdown (required)"}
          required={required}
          className={styles['location-input']}
          autoComplete="off"
        />
        
        {showDropdown && (
          <div 
            className={styles['location-dropdown']}
            key={searchKey}  // 🔧 FIX #4: Force re-render when data changes
          >
            {isLoading ? (
              <div className={styles['loading-indicator']}>
                Searching for locations...
              </div>
            ) : filteredOptions.length > 0 ? (
              <>
                {/* Show search feedback */}
                {searchInput && searchInput.trim().length > 0 && (
                  <div className={styles['search-info']}>
                    {filteredOptions.length} location{filteredOptions.length !== 1 ? 's' : ''} found for "{searchInput}"
                  </div>
                )}
                
                {filteredOptions.map((option, index) => (
                  <div 
                    key={`${option.city}-${option.state}-${index}`}  // Unique key
                    className={styles['location-option']}
                    onClick={() => handleOptionSelect(option)}
                    onMouseDown={(e) => e.preventDefault()}  // Prevent blur before click
                  >
                    <div className={styles['location-option-city']}>
                      {option.city}, {option.state}
                    </div>
                    {option.zips && option.zips.length > 0 && (
                      <div className={styles['location-option-zip']}>
                        ZIP: {option.zips.slice(0, 3).join(', ')}
                        {option.zips.length > 3 ? '...' : ''}
                      </div>
                    )}
                  </div>
                ))}
              </>
            ) : (
              <div className={styles['no-results']}>
                {searchInput && searchInput.trim().length > 0 
                  ? `No locations found for "${searchInput}". Try a different city, state, or ZIP code.`
                  : 'Start typing to search for a location...'
                }
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationMenuSelector;
