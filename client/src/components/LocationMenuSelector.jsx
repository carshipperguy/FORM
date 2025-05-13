import React, { useState, useEffect } from 'react';
// Remove the import of the large city-data.json file
// import { locationOptions } from '../lib/location-data';

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
      setIsLoading(true);
      try {
        // In development, use port 5000 directly to bypass Vite proxy issues
        const apiUrl = import.meta.env.DEV 
          ? 'http://localhost:5000/api/location-search/popular'
          : '/api/location-search/popular';
        
        const response = await fetch(apiUrl);
        if (response.ok) {
          const data = await response.json();
          setFilteredOptions(data);
        } else {
          console.error('Failed to load popular cities:', response.statusText);
        }
      } catch (error) {
        console.error('Error loading popular cities:', error);
      } finally {
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
        setIsLoading(true);
        try {
          const response = await fetch(`/api/location-search?query=${encodeURIComponent(searchInput)}`);
          if (response.ok) {
            const data = await response.json();
            setFilteredOptions(data);
          } else {
            console.error('Failed to search locations:', response.statusText);
          }
        } catch (error) {
          console.error('Error searching locations:', error);
        } finally {
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
    <div className="location-menu-container">
      {label && <label className="location-label">{label}</label>}
      
      <div className="location-input-container">
        <input
          type="text"
          value={searchInput}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder={placeholder || "Search and select from dropdown (required)"}
          required={required}
          className="location-input"
        />
        
        {showDropdown && (
          <div className="location-dropdown">
            {isLoading ? (
              <div className="loading-indicator">Loading locations...</div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div 
                  key={index} 
                  className="location-option"
                  onClick={() => handleOptionSelect(option)}
                >
                  <div className="location-option-city">{option.city}, {option.state}</div>
                  {option.zips && option.zips.length > 0 && (
                    <div className="location-option-zip">ZIP: {option.zips.slice(0, 3).join(', ')}{option.zips.length > 3 ? '...' : ''}</div>
                  )}
                </div>
              ))
            ) : (
              <div className="no-results">No matching locations found</div>
            )}
          </div>
        )}
      </div>
      
      <style>{`
        .location-menu-container {
          position: relative;
          width: 100%;
        }
        
        .location-label {
          display: block;
          margin-bottom: 5px;
          font-size: 14px;
          font-weight: 500;
        }
        
        .location-input-container {
          position: relative;
        }
        
        .location-input {
          width: 100%;
          padding: 10px;
          border: 1px solid #E5E7EB;
          border-radius: 0;
          font-size: 14px;
          color: #718096;
          box-shadow: none;
          height: 40px;
          box-sizing: border-box;
        }
        
        .location-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          max-height: 300px;
          overflow-y: auto;
          background-color: white;
          border: 1px solid #E5E7EB;
          border-top: none;
          border-radius: 0;
          z-index: 1000;
          box-shadow: none;
        }
        
        .location-option {
          padding: 8px 10px;
          cursor: pointer;
          border-bottom: 1px solid #E5E7EB;
        }
        
        .location-option:last-child {
          border-bottom: none;
        }
        
        .location-option:hover {
          background-color: #f9fafb;
        }
        
        .location-option-city {
          font-size: 14px;
        }
        
        .location-option-zip {
          font-size: 12px;
          color: #718096;
          margin-top: 2px;
        }
        
        .selection-info {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 12px;
        }
        
        .selection-status {
          padding: 2px 5px;
          border-radius: 2px;
        }
        
        .selection-status.complete {
          color: #059669;
        }
        
        .selection-status.incomplete {
          color: #b91c1c;
        }
        
        .loading-indicator {
          padding: 12px;
          text-align: center;
          color: #718096;
          font-size: 14px;
        }
        
        .no-results {
          padding: 12px;
          text-align: center;
          color: #718096;
          font-size: 14px;
        }
      `}</style>
    </div>
  );
};

export default LocationMenuSelector;