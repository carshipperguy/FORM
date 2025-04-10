import React from 'react';
import LocationAutocomplete from './LocationAutocomplete';
import { Label } from '@/components/ui/label';

const LocationSelector = ({ label, value, onChange, placeholder, required }) => {
  return (
    <div className="space-y-2">
      {label && (
        <Label className="text-sm font-medium text-gray-700">{label}</Label>
      )}
      <LocationAutocomplete
        value={value}
        onChange={onChange}
        placeholder={placeholder || "Enter city, state or zip"}
        required={required}
      />
    </div>
  );
};

export default LocationSelector;