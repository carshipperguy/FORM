import React, { useState, useEffect } from 'react';
// Use our API client instead of direct imports or fetch calls
import { searchLocations, getPopularLocations } from '../lib/api';
// Import CSS module instead of using inline styles
import styles from './LocationMenuSelector.module.css';

/**
 * A dropdown menu selector for locations that includes all cities and zip codes
 * from the US cities database. Uses server-side API for location search to optimize performance.
 */
const LocationMenuSelector = ({ value, onChange, placeholder, required, label }) => {
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load popular cities on initial render
  useEffect(() => {
    async function loadPopularCities() {
      // Only show loading indicator after a delay to avoid flicker for fast responses
      const loadingDelay = setTimeout(() => setIsLoading(true), 150);
      
      try {
        // Use our API client which handles development vs production environments
        const data = await getPopularLocations(200);
        setFilteredOptions(data);
      } catch (error) {
        console.error('Error loading popular cities:', error);
      } finally {
        clearTimeout(loadingDelay);
        setIsLoading(false);
      }
    }
    
    loadPopularCities();
  }, []);
  
  // Update filtered options when search input changes using API
  useEffect(() => {
    // Use debounce to avoid too many API calls
    const debounceTimeout = setTimeout(async () => {
      if (searchInput.length >= 2) {
        // Only show loading indicator after a delay to avoid flicker for fast responses
        const loadingDelay = setTimeout(() => setIsLoading(true), 150);
        
        try {
          // Use our API client which handles development vs production environments
          const data = await searchLocations(searchInput, 200);
          setFilteredOptions(data);
        } catch (error) {
          console.error('Error searching locations:', error);
        } finally {
          clearTimeout(loadingDelay);
          setIsLoading(false);
        }
      }
    }, 300); // 300ms debounce
    
    return () => clearTimeout(debounceTimeout);
  }, [searchInput]);
  
  const handleInputChange = (e) => {
    const input = e.target.value;
    setSearchInput(input);
    
    // Track the input but don't save it as a valid selection
    // User must select from dropdown to get a valid city/zip pair
    setShowDropdown(true);
  };
  
  const handleOptionSelect = (option) => {
    // Pass both the location string and the first ZIP code
    const primaryZip = option.zips && option.zips.length > 0 ? option.zips[0] : null;
    
    console.log('Selected location with ZIP:', {
      location: option.value,
      primaryZip
    });
    
    // Update the visible input field
    setSearchInput(option.value);
    
    // Pass both the location value and ZIP to the parent component
    onChange(option.value, primaryZip);
    
    setShowDropdown(false);
  };
  
  return (
    <div className={styles['location-menu-container']}>
      {label && <label className={styles['location-label']}>{label}</label>}
      
      <div className={styles['location-input-container']}>
        <input
          type="text"
          value={searchInput}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder={placeholder || "Search and select from dropdown (required)"}
          required={required}
          className={styles['location-input']}
        />
        
        {showDropdown && (
          <div className={styles['location-dropdown']}>
            {isLoading ? (
              <div className={styles['loading-indicator']}>Searching for locations...</div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div 
                  key={index} 
                  className={styles['location-option']}
                  onClick={() => handleOptionSelect(option)}
                >
                  <div className={styles['location-option-city']}>{option.city}, {option.state}</div>
                  {option.zips && option.zips.length > 0 && (
                    <div className={styles['location-option-zip']}>ZIP: {option.zips.slice(0, 3).join(', ')}{option.zips.length > 3 ? '...' : ''}</div>
                  )}
                </div>
              ))
            ) : (
              <div className={styles['no-results']}>No matching locations found. Try a different city name or ZIP code.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationMenuSelector;