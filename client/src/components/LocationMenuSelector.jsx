import React, { useState, useEffect } from 'react';
import { locationOptions } from '../lib/location-data';

/**
 * A dropdown menu selector for locations that includes all cities and zip codes
 * from the US cities database.
 */
const LocationMenuSelector = ({ value, onChange, placeholder, required, label }) => {
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Update filtered options when search input changes
  useEffect(() => {
    if (searchInput.length >= 2) {
      const lowerInput = searchInput.toLowerCase();
      const results = locationOptions
        .filter(option => 
          option.city.toLowerCase().includes(lowerInput) || 
          option.state.toLowerCase().includes(lowerInput) ||
          (option.zips && option.zips.some(zip => zip.includes(lowerInput)))
        )
        .slice(0, 200); // Limit for performance
      
      setFilteredOptions(results);
    } else {
      // Show most populated cities by default
      setFilteredOptions(locationOptions.slice(0, 200));
    }
  }, [searchInput]);
  
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
    <div className="location-menu-container">
      {label && <label className="location-label">{label}</label>}
      
      <div className="location-input-container">
        <input
          type="text"
          value={searchInput}
          onChange={handleInputChange}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
          placeholder={placeholder || "Enter city, state, or ZIP"}
          required={required}
          className="location-input"
        />
        
        {showDropdown && filteredOptions.length > 0 && (
          <div className="location-dropdown">
            {filteredOptions.map((option, index) => (
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
            ))}
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
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 3px;
          font-size: 14px;
        }
        
        .location-dropdown {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          max-height: 300px;
          overflow-y: auto;
          background-color: white;
          border: 1px solid #ddd;
          border-top: none;
          border-radius: 0 0 3px 3px;
          z-index: 1000;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .location-option {
          padding: 8px 12px;
          cursor: pointer;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .location-option:hover {
          background-color: #f8f8f8;
        }
        
        .location-option-city {
          font-size: 14px;
        }
        
        .location-option-zip {
          font-size: 12px;
          color: #666;
          margin-top: 2px;
        }
      `}</style>
    </div>
  );
};

export default LocationMenuSelector;