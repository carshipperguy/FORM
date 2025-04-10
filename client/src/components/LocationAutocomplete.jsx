import React, { useState, useEffect, useRef } from 'react';

// Top US cities for autocomplete suggestions
const popularLocations = [
  "New York, NY",
  "Los Angeles, CA",
  "Chicago, IL",
  "Houston, TX",
  "Phoenix, AZ",
  "Philadelphia, PA",
  "San Antonio, TX",
  "San Diego, CA",
  "Dallas, TX",
  "San Jose, CA",
  "Austin, TX",
  "Jacksonville, FL",
  "Columbus, OH",
  "San Francisco, CA",
  "Charlotte, NC",
  "Indianapolis, IN",
  "Seattle, WA",
  "Denver, CO",
  "Washington, DC",
  "Boston, MA",
  "Miami, FL"
];

const LocationAutocomplete = ({ value, onChange, placeholder, required }) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    // Set input value when the component prop changes
    if (value !== undefined && value !== inputValue) {
      setInputValue(value);
    }
  }, [value]);

  useEffect(() => {
    // Add click outside listener to close the suggestions dropdown
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsFocused(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Notify parent component of the change
    onChange(newValue);
    
    // Filter suggestions based on input
    if (newValue.trim().length > 1) {
      const filteredLocations = popularLocations.filter(location => 
        location.toLowerCase().includes(newValue.toLowerCase())
      );
      setSuggestions(filteredLocations);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    onChange(suggestion);
    setSuggestions([]);
    setIsFocused(false);
  };

  return (
    <div className="location-autocomplete" ref={wrapperRef}>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsFocused(true)}
        placeholder={placeholder || "Enter location"}
        required={required}
        className="location-input"
      />
      
      {isFocused && suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <li 
              key={index} 
              onClick={() => handleSuggestionClick(suggestion)}
              className="suggestion-item"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}

      <style>
        {`
          .location-autocomplete {
            position: relative;
            width: 100%;
          }
          
          .location-input {
            width: 100%;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 3px;
            font-size: 14px;
          }
          
          .suggestions-list {
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            max-height: 200px;
            overflow-y: auto;
            background-color: white;
            border: 1px solid #ddd;
            border-top: none;
            border-radius: 0 0 3px 3px;
            z-index: 10;
            padding: 0;
            margin: 0;
            list-style: none;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          
          .suggestion-item {
            padding: 8px 12px;
            cursor: pointer;
            font-size: 14px;
          }
          
          .suggestion-item:hover {
            background-color: #f0f0f0;
          }
        `}
      </style>
    </div>
  );
};

export default LocationAutocomplete;