import React, { useState } from "react";
import { useLocation } from "wouter";

const QuoteOptions = ({ data }) => {
  const [isEnclosedStandard, setIsEnclosedStandard] = useState(false);
  const [isEnclosedExpress, setIsEnclosedExpress] = useState(false);
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

  const standardPrice = isEnclosedStandard ? formData.enclosedTransportPrice : formData.openTransportPrice;
  const expressPrice = isEnclosedExpress ? Math.round(formData.enclosedTransportPrice * 1.2) : Math.round(formData.openTransportPrice * 1.2);
  
  const formatUSD = (price) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);
  
  const handleReserve = (transport, isEnclosed) => {
    const transportType = transport === "standard" ? (isEnclosed ? "enclosed" : "open") : (isEnclosed ? "enclosed-express" : "open-express");
    const price = transport === "standard" ? standardPrice : expressPrice;
    
    const searchParams = new URLSearchParams();
    searchParams.append("transportType", transportType);
    searchParams.append("price", price);
    searchParams.append("data", encodeURIComponent(JSON.stringify(formData)));
    
    navigate(`/checkout?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a8a] via-[#ffffff] to-[#dc2626] text-black px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1e3a8a] drop-shadow-md">Shipping Quote Summary</h1>
          <p className="text-sm text-gray-700 mt-2">Military Owned • Family Operated • Proudly American</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 mb-10">
          <div className="bg-white text-black rounded-2xl p-3 shadow-xl border border-gray-200">
            <h2 className="text-xl font-semibold text-[#1e3a8a] mb-4">Route Info</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <span className="block font-medium text-[#1e3a8a]">Ship Date:</span>
                {formData.shipmentDate instanceof Date 
                  ? formData.shipmentDate.toLocaleDateString() 
                  : formData.shipmentDate}
              </div>
              <div>
                <span className="block font-medium text-[#1e3a8a]">Pickup Location:</span>
                {formData.pickupLocation}
              </div>
              <div>
                <span className="block font-medium text-[#1e3a8a]">Dropoff Location:</span>
                {formData.dropoffLocation}
              </div>
              <div>
                <span className="block font-medium text-[#1e3a8a]">Vehicle:</span>
                {formData.year} {formData.make} {formData.model}
              </div>
              <div>
                <span className="block font-medium text-[#1e3a8a]">Route Distance:</span>
                {formData.distance} miles (est.)
              </div>
              <div>
                <span className="block font-medium text-[#1e3a8a]">Transit Time:</span>
                {formData.transitTime} days (est.)
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          {/* Standard Transport Card */}
          <div className="rounded-2xl p-6 bg-white text-center shadow-2xl flex flex-col justify-between text-black border border-gray-200">
            <div>
              <h3 className="text-2xl font-bold mb-2 text-[#1e3a8a]">Standard Transport</h3>
              <div className="mb-4">
                <button
                  className={`px-3 py-1 text-sm font-medium rounded-full mr-2 ${!isEnclosedStandard ? 'bg-blue-700 text-white' : 'bg-gray-300 text-black'}`}
                  onClick={() => setIsEnclosedStandard(false)}
                >Open</button>
                <button
                  className={`px-3 py-1 text-sm font-medium rounded-full ${isEnclosedStandard ? 'bg-red-600 text-white' : 'bg-gray-300 text-black'}`}
                  onClick={() => setIsEnclosedStandard(true)}
                >Enclosed</button>
              </div>
              <p className="text-3xl font-bold text-[#dc2626] mb-4">{formatUSD(standardPrice)}</p>
              <ul className="text-left text-sm mb-6 text-gray-600">
                <li>✅ Pickup within 7-day window</li>
                <li>✅ Fully insured</li>
                <li>✅ Door-to-door service</li>
                <li>✅ $0 due now</li>
              </ul>
            </div>
            <button
              onClick={() => handleReserve("standard", isEnclosedStandard)}
              className="inline-block bg-[#1e3a8a] hover:bg-[#0f2a63] text-white font-bold py-2 px-6 rounded-full text-sm transition"
            >
              Reserve Now — No credit card required
            </button>
          </div>

          {/* Express Transport Card */}
          <div className="rounded-2xl p-6 bg-white text-center shadow-2xl flex flex-col justify-between text-black border border-gray-200">
            <div>
              <h3 className="text-2xl font-bold mb-2 text-[#1e3a8a]">Express Transport</h3>
              <div className="mb-4">
                <button
                  className={`px-3 py-1 text-sm font-medium rounded-full mr-2 ${!isEnclosedExpress ? 'bg-blue-700 text-white' : 'bg-gray-300 text-black'}`}
                  onClick={() => setIsEnclosedExpress(false)}
                >Open</button>
                <button
                  className={`px-3 py-1 text-sm font-medium rounded-full ${isEnclosedExpress ? 'bg-red-600 text-white' : 'bg-gray-300 text-black'}`}
                  onClick={() => setIsEnclosedExpress(true)}
                >Enclosed</button>
              </div>
              <p className="text-3xl font-bold text-[#dc2626] mb-4">{formatUSD(expressPrice)}</p>
              <ul className="text-left text-sm mb-6 text-gray-600">
                <li>✅ Guaranteed pickup window</li>
                <li>✅ Priority dispatch</li>
                <li>✅ Fully insured, door-to-door</li>
                <li>✅ $0 due now</li>
              </ul>
            </div>
            <button
              onClick={() => handleReserve("express", isEnclosedExpress)}
              className="inline-block bg-[#1e3a8a] hover:bg-[#0f2a63] text-white font-bold py-2 px-6 rounded-full text-sm transition"
            >
              Reserve Now — No credit card required
            </button>
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-gray-800">
          Note: Multi-vehicle, inoperable, modified, or vehicles booked with other companies require custom quotes — please text or call for details.
        </p>
      </div>
    </div>
  );
};

export default QuoteOptions;