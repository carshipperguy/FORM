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
    
    // Allow manually entered values to pass through
    // Extract zip code if user enters one in the format "City, ST 12345"
    const zipMatch = input.match(/(\d{5})$/);
    const extractedZip = zipMatch ? zipMatch[1] : null;
    
    onChange(input, extractedZip);
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
          placeholder={placeholder || "Enter city or select from dropdown"}
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
      `}</style>
    </div>
  );
};

export default LocationMenuSelector;