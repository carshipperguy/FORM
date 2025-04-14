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
    
  // EMERGENCY OVERRIDE: Check for special vehicle types and apply $2.50/mile pricing
  const vehicleType = formData.vehicleType?.toLowerCase() || '';
  const isSpecialVehicle = vehicleType === 'boat' || 
                         vehicleType.includes('rv') || 
                         vehicleType.includes('trailer') || 
                         vehicleType.includes('equipment');
                         
  // Override prices for special vehicles
  if (isSpecialVehicle) {
    console.log("🚨 QUOTE OPTIONS EMERGENCY OVERRIDE - Applying $2.50/mile for", vehicleType);
    const flatRate = Math.round(formData.distance * 2.50);
    formData.openTransportPrice = flatRate;
    formData.enclosedTransportPrice = Math.round(flatRate * 1.40);
    
    console.log("FIXED PRICES:", {
      distance: formData.distance,
      rate: "$2.50/mile",
      calculation: `${formData.distance} × $2.50 = $${flatRate}`,
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
      finalPrice: price,
      quoteSelectedAt: new Date().toISOString()
    };
    
    // We're not sending a webhook here - only at initial form submission and final booking
    console.log("Proceeding to booking with transport option:", finalData.selectedTransport);
    
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
        {/* Patriotic theme with red, white, and blue colors */}
        <div className="p-4 bg-white">
          {/* Header with blue background */}
          <div className="text-center mb-4 p-3 bg-[#002868] rounded-md shadow-md">
            <h1 className="text-xl font-bold text-white">Shipping Quote Summary</h1>
            <div className="flex items-center justify-center mt-2">
              <img
                src="https://amerigoautotransport.net/wp-content/uploads/2024/09/Amerigo-auto-transport-logo.png"
                alt="Amerigo Auto Transport Logo"
                style={{
                  width: '120px',
                  display: 'block',
                  margin: '0 auto 5px',
                  maxWidth: '100%',
                  height: 'auto',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/120x45?text=Amerigo+Logo';
                }}
              />
              <p className="text-xs text-white font-semibold ml-2">
                Military Owned • Family Operated • Proudly American
              </p>
            </div>
          </div>

          {/* Route Information with cleaner layout */}
          <div className="mb-4">
            <div className="bg-white border border-[#002868] rounded-md shadow-sm mb-3 overflow-hidden">
              <div className="bg-[#002868] text-white p-2">
                <h2 className="text-sm font-medium">Route Information</h2>
              </div>
              <div className="p-3 space-y-3 text-sm">
                {/* Vehicle info */}
                <div className="bg-gray-50 p-2 rounded-md">
                  <span className="font-bold text-[#002868] block mb-1">Vehicle:</span>
                  <span className="text-gray-800">
                    {formData.year} {formData.make} {formData.model}
                  </span>
                </div>
                
                {/* Route info with cleaner single-line format */}
                <div className="flex flex-col space-y-2 border-b border-gray-100 pb-2">
                  <div>
                    <span className="font-bold text-[#002868] block mb-1">Pickup Location:</span>
                    <span className="text-gray-800">{formData.pickupLocation}</span>
                  </div>
                  <div>
                    <span className="font-bold text-[#002868] block mb-1">Delivery Location:</span>
                    <span className="text-gray-800">{formData.dropoffLocation}</span>
                  </div>
                </div>
                
                {/* Shipment details */}
                <div className="flex justify-between pt-1">
                  <div className="text-center flex-1 border-r border-gray-100">
                    <span className="font-bold text-[#002868] block mb-1">Distance</span>
                    <span className="text-gray-800">{formData.distance} miles</span>
                  </div>
                  <div className="text-center flex-1 border-r border-gray-100">
                    <span className="font-bold text-[#002868] block mb-1">Transit Time</span>
                    <span className="text-gray-800">{formData.transitTime} days</span>
                  </div>
                  <div className="text-center flex-1">
                    <span className="font-bold text-[#002868] block mb-1">Ship Date</span>
                    <span className="text-gray-800">
                      {formData.shipmentDate instanceof Date 
                        ? formData.shipmentDate.toLocaleDateString() 
                        : formData.shipmentDate}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 mb-4">
            {/* Wrapper div to maintain stable height for price display */}
            <div className="relative border border-[#002868] rounded-md shadow-sm overflow-hidden min-h-[250px]">
              <div className="bg-[#002868] text-white p-2">
                <h3 className="text-sm font-medium">Standard Transport</h3>
              </div>
              <div className="p-3 flex flex-col bg-white h-full">
                <div className="mb-3 text-center">
                  <button
                    className={`px-3 py-1 text-xs font-medium mr-2 ${!isEnclosedStandard ? 'bg-[#002868] text-white' : 'bg-gray-200 text-black'}`}
                    onClick={() => setIsEnclosedStandard(false)}
                    style={{ width: '80px', height: '24px' }}
                  >Open</button>
                  <button
                    className={`px-3 py-1 text-xs font-medium ${isEnclosedStandard ? 'bg-[#002868] text-white' : 'bg-gray-200 text-black'}`}
                    onClick={() => setIsEnclosedStandard(true)}
                    style={{ width: '80px', height: '24px' }}
                  >Enclosed</button>
                </div>
                {/* Price display with fixed height */}
                <div className="mb-4 text-center" style={{ minHeight: '32px' }}>
                  <p className="text-2xl font-bold text-center text-[#BF0A30]">{formatUSD(standardPrice)}</p>
                </div>
                <ul className="text-xs mb-3 text-gray-600 space-y-1" style={{ minHeight: '80px' }}>
                  <li>✓ Pickup within 7-day window</li>
                  <li>✓ Fully insured</li>
                  <li>✓ Door-to-door service</li>
                  <li>✓ $0 due now</li>
                </ul>
                <div className="mt-auto pt-2">
                  <button
                    onClick={() => handleReserve("standard", isEnclosedStandard)}
                    className="w-full bg-[#002868] hover:bg-[#001a4d] text-white py-2 text-sm rounded-sm transition-colors"
                  >
                    Reserve Now - No CC Required
                  </button>
                </div>
              </div>
            </div>

            {/* Wrapper div to maintain stable height for price display */}
            <div className="relative border border-[#002868] rounded-md shadow-sm overflow-hidden min-h-[250px]">
              <div className="bg-[#BF0A30] text-white p-2">
                <h3 className="text-sm font-medium">Express Transport</h3>
              </div>
              <div className="p-3 flex flex-col bg-white h-full">
                <div className="mb-3 text-center">
                  <button
                    className={`px-3 py-1 text-xs font-medium mr-2 ${!isEnclosedExpress ? 'bg-[#BF0A30] text-white' : 'bg-gray-200 text-black'}`}
                    onClick={() => setIsEnclosedExpress(false)}
                    style={{ width: '80px', height: '24px' }}
                  >Open</button>
                  <button
                    className={`px-3 py-1 text-xs font-medium ${isEnclosedExpress ? 'bg-[#BF0A30] text-white' : 'bg-gray-200 text-black'}`}
                    onClick={() => setIsEnclosedExpress(true)}
                    style={{ width: '80px', height: '24px' }}
                  >Enclosed</button>
                </div>
                {/* Price display with fixed height */}
                <div className="mb-4 text-center" style={{ minHeight: '32px' }}>
                  <p className="text-2xl font-bold text-center text-[#BF0A30]">{formatUSD(expressPrice)}</p>
                </div>
                <ul className="text-xs mb-3 text-gray-600 space-y-1" style={{ minHeight: '80px' }}>
                  <li>✓ Guaranteed pickup window</li>
                  <li>✓ Priority dispatch</li>
                  <li>✓ Fully insured, door-to-door</li>
                  <li>✓ $0 due now</li>
                </ul>
                <div className="mt-auto pt-2">
                  <button
                    onClick={() => handleReserve("express", isEnclosedExpress)}
                    className="w-full bg-[#BF0A30] hover:bg-[#a00826] text-white py-2 text-sm rounded-sm transition-colors"
                  >
                    Reserve Now - No CC Required
                  </button>
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-600 border-t border-gray-100 pt-2">
            Note: Vehicles that are inoperable or modified require a custom quote.
            For multi-vehicle shipments, please call or text us to receive a bundled rate.
          </p>
        </div>
      </MobileContainer>
    </React.Suspense>
  );
};

export default QuoteOptions;