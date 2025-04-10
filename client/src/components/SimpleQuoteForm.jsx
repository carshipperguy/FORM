import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { vehicleTypes, years, makes, modelsByMake } from "@/lib/vehicle-data";
import LocationMenuSelector from "./LocationMenuSelector";

const SimpleQuoteForm = () => {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    pickupLocation: "",
    dropoffLocation: "",
    vehicleType: "",
    year: "",
    make: "",
    model: "",
    shipmentDate: "",
    name: "",
    phone: "",
    email: ""
  });
  
  const [availableModels, setAvailableModels] = useState([]);
  const [isStandardVehicle, setIsStandardVehicle] = useState(false);

  // Determine if vehicle type is a standard car/truck/SUV
  useEffect(() => {
    const standardType = formData.vehicleType === "car" || 
                         formData.vehicleType === "truck" || 
                         formData.vehicleType === "suv";
    setIsStandardVehicle(standardType);
  }, [formData.vehicleType]);

  // Get available models for standard vehicles
  useEffect(() => {
    if (isStandardVehicle && formData.make) {
      setAvailableModels(modelsByMake[formData.make] || []);
    } else {
      setAvailableModels([]);
    }
  }, [formData.make, isStandardVehicle]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // When vehicle type changes, reset the year, make, and model fields
    if (name === "vehicleType") {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        year: "",
        make: "",
        model: ""
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleLocationChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Normally we would validate the form here
    
    // For demonstration, navigate to the quote page with sample data
    const quoteData = {
      ...formData,
      openTransportPrice: 1200,
      enclosedTransportPrice: 1680,
      transitTime: 3,
      distance: 1200
    };

    const params = new URLSearchParams({
      data: encodeURIComponent(JSON.stringify(quoteData))
    });

    navigate(`/final-quote?${params.toString()}`);
  };

  return (
    <div className="simple-form-container">
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <div className="form-header">
            <h2>Origin & Destination</h2>
          </div>
          <div className="form-fields">
            <div className="form-field">
              <LocationMenuSelector
                value={formData.pickupLocation}
                onChange={(value) => handleLocationChange("pickupLocation", value)}
                placeholder="Ship From (City, State or ZIP)"
                required
              />
            </div>
            <div className="form-field">
              <LocationMenuSelector
                value={formData.dropoffLocation}
                onChange={(value) => handleLocationChange("dropoffLocation", value)}
                placeholder="Ship To (City, State or ZIP)"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-header">
            <h2>Vehicle Details</h2>
          </div>
          <div className="form-fields">
            <div className="form-field">
              <select 
                name="vehicleType" 
                value={formData.vehicleType} 
                onChange={handleChange} 
                required
              >
                <option value="">What Would You Like To Ship?</option>
                {vehicleTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
{isStandardVehicle ? (
              // Dropdown menus for standard vehicles (car/truck/SUV)
              <>
                <div className="form-field">
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <select
                    name="make"
                    value={formData.make}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Make</option>
                    {makes.map((make) => (
                      <option key={make} value={make}>
                        {make}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <select
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    required
                    disabled={!formData.make}
                  >
                    <option value="">Model</option>
                    {availableModels.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              // Free text inputs for non-standard vehicles (anything else)
              <>
                <div className="form-field">
                  <input
                    type="text"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    placeholder="Year"
                    required
                  />
                </div>
                <div className="form-field">
                  <input
                    type="text"
                    name="make"
                    value={formData.make}
                    onChange={handleChange}
                    placeholder="Make"
                    required
                  />
                </div>
                <div className="form-field">
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="Model"
                    required
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="form-section">
          <div className="form-header">
            <h2>Shipment Details</h2>
          </div>
          <div className="form-fields">
            <div className="form-field">
              <input 
                type="date" 
                name="shipmentDate" 
                value={formData.shipmentDate} 
                onChange={handleChange}
                required 
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            {formData.shipmentDate && (
              <>
                <div className="form-field">
                  <input 
                    type="text"
                    name="name"
                    value={formData.name || ''}
                    onChange={handleChange}
                    placeholder="Your Name"
                    required
                  />
                </div>
                <div className="form-field">
                  <input 
                    type="tel"
                    name="phone"
                    value={formData.phone || ''}
                    onChange={handleChange}
                    placeholder="Phone Number"
                    required
                  />
                </div>
                <div className="form-field">
                  <input 
                    type="email"
                    name="email"
                    value={formData.email || ''}
                    onChange={handleChange}
                    placeholder="Email Address"
                    required
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <button type="submit" className="submit-btn">Submit</button>
      </form>

      <style>{`
        .simple-form-container {
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
          font-family: Arial, sans-serif;
        }

        .form-section {
          margin-bottom: 15px;
        }

        .form-header {
          background-color: #0a3252;
          color: white;
          padding: 10px;
          font-weight: 500;
        }

        .form-header h2 {
          margin: 0;
          font-size: 16px;
        }

        .form-fields {
          padding: 15px;
          background-color: #f5f5f5;
        }

        .form-field {
          margin-bottom: 10px;
          transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
        }
        
        .form-field.hidden {
          opacity: 0;
          transform: translateY(-10px);
          height: 0;
          margin: 0;
          overflow: hidden;
        }

        .form-field input,
        .form-field select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 3px;
          font-size: 14px;
        }
        
        .location-field [role="combobox"] {
          width: 100%;
          height: 38px;
          border: 1px solid #ddd;
          border-radius: 3px;
          font-size: 14px;
          display: flex;
          align-items: center;
          background-color: white;
        }

        .submit-btn {
          width: 100%;
          padding: 12px;
          background-color: #0a3252;
          color: white;
          border: none;
          font-weight: bold;
          cursor: pointer;
          font-size: 16px;
        }

        .submit-btn:hover {
          background-color: #0a4169;
        }

        /* Always use mobile styling regardless of device (for iframe) */
        .simple-form-container {
          width: 308px !important;
          max-width: 308px !important;
        }
      `}</style>
    </div>
  );
};

export default SimpleQuoteForm;