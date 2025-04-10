import React, { useState } from "react";
import { useLocation } from "wouter";

const SimpleQuoteForm = () => {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    pickupLocation: "",
    dropoffLocation: "",
    vehicleType: "",
    year: "",
    make: "",
    model: "",
    shipmentDate: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
              <input 
                type="text" 
                name="pickupLocation" 
                value={formData.pickupLocation} 
                onChange={handleChange}
                placeholder="Ship From" 
                required 
              />
            </div>
            <div className="form-field">
              <input 
                type="text" 
                name="dropoffLocation" 
                value={formData.dropoffLocation} 
                onChange={handleChange}
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
                <option value="Sedan">Sedan</option>
                <option value="SUV">SUV</option>
                <option value="Truck">Truck</option>
                <option value="Van">Van</option>
              </select>
            </div>
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
                placeholder="Vehicle Make" 
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
          </div>
        </div>

        <div className="form-section">
          <div className="form-header">
            <h2>Shipment Details</h2>
          </div>
          <div className="form-fields">
            <div className="form-field">
              <input 
                type="text" 
                name="shipmentDate" 
                value={formData.shipmentDate} 
                onChange={handleChange}
                placeholder="MM-DD-YY" 
                required 
              />
            </div>
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
        }

        .form-field input,
        .form-field select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 3px;
          font-size: 14px;
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

        @media (max-width: 639px) {
          .simple-form-container {
            width: 308px !important;
          }
        }
        
        @media (min-width: 640px) and (max-width: 1023px) {
          .simple-form-container {
            width: 560px !important;
          }
        }
        
        @media (min-width: 1024px) {
          .simple-form-container {
            width: 1125px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default SimpleQuoteForm;