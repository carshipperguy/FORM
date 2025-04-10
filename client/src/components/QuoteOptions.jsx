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

  // Import at the top of the file
  // Using dynamic import to avoid TypeScript issues in JSX file
  const MobileContainer = React.lazy(() => import("./MobileContainer"));

  return (
    <React.Suspense fallback={<div style={{ width: "308px", margin: "0 auto" }}>Loading...</div>}>
      <MobileContainer>
        <div className="p-4 bg-white">
          <div className="text-center mb-4">
            <h1 className="text-xl font-bold text-[#002C42]">Shipping Quote Summary</h1>
            <p className="text-xs text-gray-700 mt-1">Military Owned • Family Operated</p>
          </div>

          <div className="mb-4">
            <div className="bg-white text-black border border-gray-200 mb-3">
              <div className="bg-[#002C42] text-white p-2">
                <h2 className="text-sm font-medium">Route Info</h2>
              </div>
              <div className="p-3 space-y-2 text-sm text-gray-700">
                <div>
                  <span className="font-medium text-[#002C42]">Ship Date:</span>{" "}
                  {formData.shipmentDate instanceof Date 
                    ? formData.shipmentDate.toLocaleDateString() 
                    : formData.shipmentDate}
                </div>
                <div>
                  <span className="font-medium text-[#002C42]">Pickup:</span>{" "}
                  {formData.pickupLocation}
                </div>
                <div>
                  <span className="font-medium text-[#002C42]">Dropoff:</span>{" "}
                  {formData.dropoffLocation}
                </div>
                <div>
                  <span className="font-medium text-[#002C42]">Vehicle:</span>{" "}
                  {formData.year} {formData.make} {formData.model}
                </div>
                <div>
                  <span className="font-medium text-[#002C42]">Distance:</span>{" "}
                  {formData.distance} miles
                </div>
                <div>
                  <span className="font-medium text-[#002C42]">Transit Time:</span>{" "}
                  {formData.transitTime} days
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-4">
            {/* Standard Transport Card */}
            <div className="border border-gray-200">
              <div className="bg-[#002C42] text-white p-2">
                <h3 className="text-sm font-medium">Standard Transport</h3>
              </div>
              <div className="p-3">
                <div className="mb-3 text-center">
                  <button
                    className={`px-3 py-1 text-xs font-medium mr-2 ${!isEnclosedStandard ? 'bg-[#002C42] text-white' : 'bg-gray-200 text-black'}`}
                    onClick={() => setIsEnclosedStandard(false)}
                  >Open</button>
                  <button
                    className={`px-3 py-1 text-xs font-medium ${isEnclosedStandard ? 'bg-[#002C42] text-white' : 'bg-gray-200 text-black'}`}
                    onClick={() => setIsEnclosedStandard(true)}
                  >Enclosed</button>
                </div>
                <p className="text-xl font-bold text-center mb-2">{formatUSD(standardPrice)}</p>
                <ul className="text-xs mb-3 text-gray-600 space-y-1">
                  <li>✓ Pickup within 7-day window</li>
                  <li>✓ Fully insured</li>
                  <li>✓ Door-to-door service</li>
                  <li>✓ $0 due now</li>
                </ul>
                <button
                  onClick={() => handleReserve("standard", isEnclosedStandard)}
                  className="w-full bg-[#002C42] text-white py-2 text-sm"
                >
                  Reserve Now
                </button>
              </div>
            </div>

            {/* Express Transport Card */}
            <div className="border border-gray-200">
              <div className="bg-[#002C42] text-white p-2">
                <h3 className="text-sm font-medium">Express Transport</h3>
              </div>
              <div className="p-3">
                <div className="mb-3 text-center">
                  <button
                    className={`px-3 py-1 text-xs font-medium mr-2 ${!isEnclosedExpress ? 'bg-[#002C42] text-white' : 'bg-gray-200 text-black'}`}
                    onClick={() => setIsEnclosedExpress(false)}
                  >Open</button>
                  <button
                    className={`px-3 py-1 text-xs font-medium ${isEnclosedExpress ? 'bg-[#002C42] text-white' : 'bg-gray-200 text-black'}`}
                    onClick={() => setIsEnclosedExpress(true)}
                  >Enclosed</button>
                </div>
                <p className="text-xl font-bold text-center mb-2">{formatUSD(expressPrice)}</p>
                <ul className="text-xs mb-3 text-gray-600 space-y-1">
                  <li>✓ Guaranteed pickup window</li>
                  <li>✓ Priority dispatch</li>
                  <li>✓ Fully insured, door-to-door</li>
                  <li>✓ $0 due now</li>
                </ul>
                <button
                  onClick={() => handleReserve("express", isEnclosedExpress)}
                  className="w-full bg-[#002C42] text-white py-2 text-sm"
                >
                  Reserve Now
                </button>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-600">
            Note: Inoperable/modified vehicles require custom quotes.
          </p>
        </div>
      </MobileContainer>
    </React.Suspense>
  );
};

export default QuoteOptions;