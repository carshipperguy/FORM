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
    // Only the "car/truck/suv" type should use dropdown menus
    const standardType = formData.vehicleType === "car/truck/suv";
    setIsStandardVehicle(standardType);
    
    console.log("Vehicle type changed:", formData.vehicleType);
    console.log("Is standard vehicle:", standardType);
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
                placeholder="Ship From"
                required
              />
            </div>
            <div className="form-field">
              <LocationMenuSelector
                value={formData.dropoffLocation}
                onChange={(value) => handleLocationChange("dropoffLocation", value)}
                placeholder="Ship To"
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
                placeholder="MM-DD-YY"
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
          margin-bottom: 10px;
        }

        .form-header {
          background-color: #002C42;
          color: white;
          padding: 8px 15px;
          font-weight: 500;
        }

        .form-header h2 {
          margin: 0;
          font-size: 16px;
        }

        .form-fields {
          padding: 10px;
          background-color: white;
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
          padding: 12px;
          border: 1px solid #E5E7EB;
          border-radius: 0;
          font-size: 14px;
          color: #718096;
          box-shadow: none;
        }
        
        .location-field [role="combobox"] {
          width: 100%;
          height: 44px;
          border: 1px solid #e2e8f0;
          border-radius: 3px;
          font-size: 14px;
          display: flex;
          align-items: center;
          background-color: white;
          color: #718096;
        }

        .submit-btn {
          width: 100%;
          padding: 15px;
          background-color: #002C42;
          color: white;
          border: none;
          font-weight: bold;
          cursor: pointer;
          font-size: 16px;
          margin-top: 0;
        }

        .submit-btn:hover {
          background-color: #003b59;
        }

        /* Always use mobile styling regardless of device (for iframe) */
        .simple-form-container {
          width: 308px !important;
          max-width: 308px !important;
        }
        
        /* Override date input appearance to look like the screenshot */
        input[type="date"]::-webkit-calendar-picker-indicator {
          position: absolute;
          right: 10px;
        }
        
        /* Match the exact placeholders from the screenshot */
        .form-field input::placeholder {
          color: #a0aec0;
        }
      `}</style>
    </div>
  );
};

export default SimpleQuoteForm;