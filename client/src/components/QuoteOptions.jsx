import React, { useState } from "react";
import { useLocation } from "wouter";

const QuoteOptions = ({ data }) => {
  const [isEnclosedStandard, setIsEnclosedStandard] = useState(false);
  const [isEnclosedExpress, setIsEnclosedExpress] = useState(false);
  const [, navigate] = useLocation();

  // Only use the passed data, no fallbacks
  if (!data) {
    console.error("No quote data provided to QuoteOptions component");
    navigate("/");
    return <div>Redirecting...</div>;
  }
  
  // Log the data coming in to see exactly what we have
  console.log("QUOTE OPTIONS RECEIVED DATA:", data);
  console.log("DISTANCE FROM RECEIVED DATA:", data.distance);
  
  // Create a copy and make sure we're not modifying the distance
  const formData = { ...data };
  
  // Debug check - make sure we're not overwriting the actual distance
  console.log("⚠️ CHECKING DISTANCE: Original passed:", data.distance, 
    "Using:", formData.distance, 
    "Changed?", formData.distance !== data.distance);
    
  // EMERGENCY OVERRIDE: Check for special vehicle types and apply $3.50/mile pricing
  const vehicleType = formData.vehicleType?.toLowerCase() || '';
  const isSpecialVehicle = vehicleType === 'boat' || 
                         vehicleType.includes('rv') || 
                         vehicleType.includes('trailer') || 
                         vehicleType.includes('equipment');
                         
  // Override prices for special vehicles
  if (isSpecialVehicle) {
    console.log("🚨 QUOTE OPTIONS EMERGENCY OVERRIDE - Applying $3.50/mile for", vehicleType);
    const flatRate = Math.round(formData.distance * 3.50);
    formData.openTransportPrice = flatRate;
    formData.enclosedTransportPrice = Math.round(flatRate * 1.40);
    
    console.log("FIXED PRICES:", {
      distance: formData.distance,
      rate: "$3.50/mile",
      calculation: `${formData.distance} × $3.50 = $${flatRate}`,
      openTransport: formData.openTransportPrice,
      enclosedTransport: formData.enclosedTransportPrice
    });
  }

  const standardPrice = isEnclosedStandard ? formData.enclosedTransportPrice : formData.openTransportPrice;
  const expressPrice = isEnclosedExpress ? Math.round(formData.enclosedTransportPrice * 1.2) : Math.round(formData.openTransportPrice * 1.2);
  
  const formatUSD = (price) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
  
  const handleReserve = (transport, isEnclosed) => {
    const transportType = transport === "standard" ? (isEnclosed ? "enclosed" : "open") : (isEnclosed ? "enclosed-express" : "open-express");
    const price = transport === "standard" ? standardPrice : expressPrice;
    
    // Create the data object with all necessary information for booking
    const finalData = {
      ...formData,
      selectedTransport: transportType === "enclosed" || transportType === "enclosed-express" ? "enclosed" : "open",
      guaranteedDate: transport === "express",
      finalPrice: price
    };
    
    // Skip checkout and go directly to booking page
    const searchParams = new URLSearchParams({
      data: encodeURIComponent(JSON.stringify(finalData))
    });
    
    navigate(`/booking?${searchParams.toString()}`);
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
            <div className="flex items-center justify-center mt-1">
              <img 
                src="/amerigo-logo.png" 
                alt="Amerigo Auto Transport Logo" 
                className="h-7 mr-2"
              />
              <p className="text-xs text-gray-700">Military Owned • Family Operated</p>
            </div>
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
                  {formData.pickupZip && <span className="text-xs ml-1">(ZIP: {formData.pickupZip})</span>}
                </div>
                <div>
                  <span className="font-medium text-[#002C42]">Dropoff:</span>{" "}
                  {formData.dropoffLocation}
                  {formData.dropoffZip && <span className="text-xs ml-1">(ZIP: {formData.dropoffZip})</span>}
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
            <div className="border border-gray-200 min-h-[250px] flex flex-col">
              <div className="bg-[#002C42] text-white p-2">
                <h3 className="text-sm font-medium">Standard Transport</h3>
              </div>
              <div className="p-3 flex-1 flex flex-col">
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
                <div className="h-10 flex items-center justify-center">
                  <p className="text-xl font-bold text-center">{formatUSD(standardPrice)}</p>
                </div>
                <ul className="text-xs mb-3 text-gray-600 space-y-1 flex-1">
                  <li>✓ Pickup within 7-day window</li>
                  <li>✓ Fully insured</li>
                  <li>✓ Door-to-door service</li>
                  <li>✓ $0 due now</li>
                </ul>
                <button
                  onClick={() => handleReserve("standard", isEnclosedStandard)}
                  className="w-full bg-[#002C42] text-white py-2 text-sm mt-auto"
                >
                  Reserve Now - No CC Required
                </button>
              </div>
            </div>

            {/* Express Transport Card */}
            <div className="border border-gray-200 min-h-[250px] flex flex-col">
              <div className="bg-[#002C42] text-white p-2">
                <h3 className="text-sm font-medium">Express Transport</h3>
              </div>
              <div className="p-3 flex-1 flex flex-col">
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
                <div className="h-10 flex items-center justify-center">
                  <p className="text-xl font-bold text-center">{formatUSD(expressPrice)}</p>
                </div>
                <ul className="text-xs mb-3 text-gray-600 space-y-1 flex-1">
                  <li>✓ Guaranteed pickup window</li>
                  <li>✓ Priority dispatch</li>
                  <li>✓ Fully insured, door-to-door</li>
                  <li>✓ $0 due now</li>
                </ul>
                <button
                  onClick={() => handleReserve("express", isEnclosedExpress)}
                  className="w-full bg-[#002C42] text-white py-2 text-sm mt-auto"
                >
                  Reserve Now - No CC Required
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