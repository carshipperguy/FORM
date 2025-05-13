import React, { useState, useEffect } from 'react';
import { searchLocations, getPopularLocations } from '../lib/api';

const LocationAutocomplete = ({ value, onChange, placeholder, required }) => {
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [searchInput, setSearchInput] = useState(value || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load popular cities initially
  useEffect(() => {
    async function loadInitialOptions() {
      setIsLoading(true);
      try {
        const data = await getPopularLocations(200);
        setFilteredOptions(data);
      } catch (error) {
        console.error('Error loading popular cities:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadInitialOptions();
  }, []);
  
  // Update filtered options when search input changes
  useEffect(() => {
    const debounceTimeout = setTimeout(async () => {
      if (searchInput.length >= 2) {
        setIsLoading(true);
        try {
          const results = await searchLocations(searchInput, 200);
          setFilteredOptions(results);
        } catch (error) {
          console.error('Error searching locations:', error);
        } finally {
          setIsLoading(false);
        }
      }
    }, 300); // 300ms debounce
    
    return () => clearTimeout(debounceTimeout);
  }, [searchInput]);
  
  // Update the input value when the value prop changes
  useEffect(() => {
    setSearchInput(value || '');
  }, [value]);
  
  const handleInputChange = (e) => {
    const input = e.target.value;
    setSearchInput(input);
    onChange(input);
    setShowDropdown(true);
  };
  
  const handleOptionSelect = (option) => {
    onChange(option.value);
    setSearchInput(option.value);
    setShowDropdown(false);
  };
  
  return (
    <div className="location-autocomplete-container">
      <div className="location-input-container">
        <input
          type="text"
          value={searchInput}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder={placeholder || "Enter city, state, or ZIP"}
          required={required}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
        />
        
        {showDropdown && (
          <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
            {isLoading ? (
              <div className="py-3 px-3 text-gray-500 text-center text-sm">
                Loading locations...
              </div>
            ) : filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => (
                <div 
                  key={index} 
                  className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
                  onClick={() => handleOptionSelect(option)}
                >
                  <div className="flex items-center">
                    <span className="font-normal block truncate">
                      {option.city}, {option.state}
                    </span>
                  </div>
                  {option.zips && option.zips.length > 0 && (
                    <span className="text-gray-500 text-xs block ml-2">
                      ZIP: {option.zips.slice(0, 3).join(', ')}{option.zips.length > 3 ? '...' : ''}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="py-3 px-3 text-gray-500 text-center text-sm">
                No matching locations found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationAutocomplete;