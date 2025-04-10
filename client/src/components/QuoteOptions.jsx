import React, { useState } from "react";

const QuoteOptions = () => {
  const [selectedTransport, setSelectedTransport] = useState("Open");
  const [formData, setFormData] = useState({
    name: "John Doe",
    phone: "555-123-4567",
    email: "john@example.com",
    shipDate: "April 15, 2025",
    vehicle: "2022 Toyota Camry",
    basePrice: 765,
  });

  const getPrice = (type) => {
    return type === "Enclosed" ? (formData.basePrice * 1.4).toFixed(0) : formData.basePrice;
  };

  return (
    <div className="form-container">
      <div className="quote-summary">
        <h2>Quote Details</h2>
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
            <p>${getPrice(selectedTransport)}</p>
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