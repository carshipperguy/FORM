import React, { useState } from "react";
import { useLocation } from "wouter";

const QuoteOptions = ({ data }) => {
  const [selectedTransport, setSelectedTransport] = useState("Open");
  const [, navigate] = useLocation();

  // Use passed data or fallback to default values if none provided
  const formData = data || {
    vehicleType: "Sedan",
    year: "2022",
    make: "Toyota",
    model: "Camry",
    shipmentDate: new Date().toLocaleDateString(),
    distance: 1200,
    openTransportPrice: 765,
    enclosedTransportPrice: 1071,
    transitTime: 3,
  };

  const getPrice = (type) => {
    return type === "Enclosed" ? formData.enclosedTransportPrice : formData.openTransportPrice;
  };
  
  const handleReserve = () => {
    const transportType = selectedTransport === "Open" ? "open" : "enclosed";
    const price = transportType === "open" ? formData.openTransportPrice : formData.enclosedTransportPrice;
    
    const searchParams = new URLSearchParams();
    searchParams.append("transportType", transportType);
    searchParams.append("price", price);
    searchParams.append("data", encodeURIComponent(JSON.stringify(formData)));
    
    navigate(`/checkout?${searchParams.toString()}`);
  };

  return (
    <div className="form-container">
      <div className="quote-summary">
        <h2>Quote Details</h2>
        
        <div className="vehicle-info">
          <h3>Vehicle Information</h3>
          <p>{formData.year} {formData.make} {formData.model}</p>
          <p>
            <span className="label">Distance:</span> 
            <span className="value">{formData.distance} miles</span>
          </p>
          <p>
            <span className="label">Estimated Transit Time:</span> 
            <span className="value">{formData.transitTime} days</span>
          </p>
          <p>
            <span className="label">From:</span> 
            <span className="value">{formData.pickupLocation}</span>
          </p>
          <p>
            <span className="label">To:</span> 
            <span className="value">{formData.dropoffLocation}</span>
          </p>
        </div>
        
        <div className="pricing-cards">
          <div className="card">
            <h3>Standard Transport</h3>
            <button 
              className={selectedTransport === "Open" ? "active" : ""} 
              onClick={() => setSelectedTransport("Open")}
            >
              Open
            </button>
            <button 
              className={selectedTransport === "Enclosed" ? "active" : ""} 
              onClick={() => setSelectedTransport("Enclosed")}
            >
              Enclosed
            </button>
            <p>${getPrice(selectedTransport)}</p>
            <button className="reserve-btn" onClick={handleReserve}>
              Reserve Now
            </button>
          </div>
          <div className="card">
            <h3>Express Transport</h3>
            <button 
              className={selectedTransport === "Open" ? "active" : ""} 
              onClick={() => setSelectedTransport("Open")}
            >
              Open
            </button>
            <button 
              className={selectedTransport === "Enclosed" ? "active" : ""} 
              onClick={() => setSelectedTransport("Enclosed")}
            >
              Enclosed
            </button>
            <p>${Math.round(getPrice(selectedTransport) * 1.2)}</p>
            <button className="reserve-btn" onClick={handleReserve}>
              Reserve Now
            </button>
          </div>
        </div>
      </div>

      <style>{`
        /* Base Styles (Mobile-first design) */
        .form-container {
          padding: 20px;
          max-width: 308px;
          margin: 0 auto;
        }

        .quote-summary {
          display: flex;
          flex-direction: column; /* Stack vertically for mobile */
          gap: 20px;
        }
        
        .vehicle-info {
          background: #f8fafc;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }
        
        .vehicle-info h3 {
          font-size: 1.2rem;
          margin-bottom: 10px;
          color: #1e3a8a;
        }
        
        .vehicle-info p {
          margin-bottom: 8px;
          font-size: 0.95rem;
        }
        
        .vehicle-info .label {
          font-weight: 600;
          color: #4b5563;
          display: inline-block;
          width: 150px;
        }
        
        .vehicle-info .value {
          color: #1f2937;
        }

        .pricing-cards {
          display: flex;
          flex-direction: column; /* Stack vertically on mobile */
          gap: 20px;
          width: 100%;
        }

        .card {
          background: #fff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
        }

        .card button {
          background: #e5e7eb;
          color: #374151;
          border: none;
          padding: 10px 15px;
          margin: 5px;
          border-radius: 5px;
          cursor: pointer;
          font-weight: bold;
        }

        .card button.active {
          background: #1e3a8a;
          color: #fff;
        }
        
        .card button.reserve-btn {
          background: #dc2626;
          color: #fff;
          width: 100%;
          margin-top: 15px;
          padding: 12px;
        }
        
        .card button.reserve-btn:hover {
          background: #b91c1c;
        }

        .card p {
          font-size: 1.5rem;
          font-weight: bold;
          color: #1e3a8a;
          margin-top: 15px;
        }

        /* Desktop Styles */
        @media (min-width: 800px) {
          .form-container {
            max-width: 800px;
          }

          .pricing-cards {
            flex-direction: row; /* Display cards in a row on desktop */
            justify-content: space-between;
            gap: 20px;
          }

          .card {
            width: 48%; /* Make each card 48% wide for desktop */
          }
        }

        /* Ensure it looks good at the tablet breakpoint too */
        @media (min-width: 560px) and (max-width: 799px) {
          .form-container {
            max-width: 560px;
          }
          
          .pricing-cards {
            flex-direction: row;
            flex-wrap: wrap;
          }
          
          .card {
            width: 48%;
          }
        }
      `}</style>
    </div>
  );
};

export default QuoteOptions;