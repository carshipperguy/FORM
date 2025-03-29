import React, { useState } from "react";
import { useLocation } from "wouter";

export default function QuoteOptions({ data }) {
  const [, navigate] = useLocation();
  const [selectedStandard, setSelectedStandard] = useState("open");
  const [selectedGuaranteed, setSelectedGuaranteed] = useState("open");

  // Validate and ensure data has all required fields
  const validatedData = React.useMemo(() => {
    if (!data) return null;
    
    return {
      year: data.year || "N/A",
      make: data.make || "N/A",
      model: data.model || "N/A",
      pickupLocation: data.pickupLocation || "N/A",
      dropoffLocation: data.dropoffLocation || "N/A",
      openTransportPrice: typeof data.openTransportPrice === 'number' ? data.openTransportPrice : 450,
      enclosedTransportPrice: typeof data.enclosedTransportPrice === 'number' ? data.enclosedTransportPrice : 765,
      transitTime: typeof data.transitTime === 'number' ? data.transitTime : 5,
      distance: typeof data.distance === 'number' ? data.distance : 0
    };
  }, [data]);

  // Calculate prices based on validated data
  const prices = React.useMemo(() => {
    if (!validatedData) {
      return {
        standard: { open: 450, enclosed: 765 },
        guaranteed: { open: 630, enclosed: 1071 }
      };
    }
    
    return {
      standard: { 
        open: validatedData.openTransportPrice, 
        enclosed: validatedData.enclosedTransportPrice 
      },
      guaranteed: { 
        open: Math.round(validatedData.openTransportPrice * 1.4), 
        enclosed: Math.round(validatedData.enclosedTransportPrice * 1.4) 
      }
    };
  }, [validatedData]);

  // Format prices as currency
  const formatPrice = (price) => {
    return typeof price === 'number' 
      ? `$${Math.round(price).toLocaleString()}` 
      : "$0";
  };
  
  const handleReserve = (type, isGuaranteed) => {
    if (!validatedData) return;
    
    const transportType = type === "open" ? "open" : "enclosed";
    const price = isGuaranteed 
      ? prices.guaranteed[type]
      : prices.standard[type];
    
    const params = new URLSearchParams({
      data: encodeURIComponent(JSON.stringify({
        ...data,
        selectedTransport: transportType,
        guaranteedDate: isGuaranteed,
        finalPrice: price
      }))
    });
    
    navigate(`/booking?${params.toString()}`);
  };

  if (!validatedData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white/80 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-[#1E3A4C] mb-4">Quote Data Error</h2>
          <p className="text-gray-600">There was a problem loading your quote. Please try again.</p>
          <button 
            onClick={() => navigate("/")}
            className="mt-4 w-full bg-[#1E3A4C] text-white py-2 rounded-lg"
          >
            Return to Quote Form
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl mx-auto mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1E3A4C] text-center mb-2">
          Your Auto Transport Quote
        </h1>
        <p className="text-gray-600 text-center mb-6">
          {validatedData.year} {validatedData.make} {validatedData.model} • {validatedData.pickupLocation} to {validatedData.dropoffLocation}
        </p>
      </div>
      
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Standard Transport */}
        <div className="backdrop-blur-md bg-white/60 border border-blue-100 rounded-2xl shadow-lg p-6 text-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-[#1E3A4C] text-center">Standard Transport</h2>
          
          <div className="flex justify-center gap-4 mb-4">
            <button
              className={"px-4 py-2 rounded-full text-sm font-medium border min-h-[48px] " + 
                (selectedStandard === "open" ? "bg-[#1E3A4C] text-white" : "bg-white text-[#1E3A4C] border-[#1E3A4C]")}
              onClick={() => setSelectedStandard("open")}
              type="button"
            >
              Open
            </button>
            <button
              className={"px-4 py-2 rounded-full text-sm font-medium border min-h-[48px] " + 
                (selectedStandard === "enclosed" ? "bg-[#1E3A4C] text-white" : "bg-white text-[#1E3A4C] border-[#1E3A4C]")}
              onClick={() => setSelectedStandard("enclosed")}
              type="button"
            >
              Enclosed
            </button>
          </div>
          
          <p className="text-3xl font-bold text-[#1E3A4C] text-center mb-4">
            {formatPrice(prices.standard[selectedStandard])}
          </p>
          
          <div className="bg-blue-50/70 p-3 rounded-lg mb-4">
            <p className="text-sm text-blue-800 text-center">
              Estimated Transit Time: {validatedData.transitTime} days
            </p>
          </div>
          
          <ul className="text-sm mb-4 space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2 flex-shrink-0">✅</span>
              <span>Pickup within 7-day window</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 flex-shrink-0">✅</span>
              <span>Fully insured transport</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 flex-shrink-0">✅</span>
              <span>Door-to-door service</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 flex-shrink-0">✅</span>
              <span>$0 due now - pay carrier at delivery</span>
            </li>
          </ul>
          
          <button 
            className="w-full bg-[#1E3A4C] hover:bg-[#163140] text-white font-semibold py-3 rounded-xl transition duration-200 shadow-md min-h-[48px]"
            onClick={() => handleReserve(selectedStandard, false)}
            type="button"
          >
            Reserve Now — No credit card required
          </button>
        </div>

        {/* Express Transport */}
        <div className="backdrop-blur-md bg-white/60 border border-blue-100 rounded-2xl shadow-lg p-6 text-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-[#1E3A4C] text-center">Express Transport</h2>
          
          <div className="flex justify-center gap-4 mb-4">
            <button
              className={"px-4 py-2 rounded-full text-sm font-medium border min-h-[48px] " + 
                (selectedGuaranteed === "open" ? "bg-[#1E3A4C] text-white" : "bg-white text-[#1E3A4C] border-[#1E3A4C]")}
              onClick={() => setSelectedGuaranteed("open")}
              type="button"
            >
              Open
            </button>
            <button
              className={"px-4 py-2 rounded-full text-sm font-medium border min-h-[48px] " + 
                (selectedGuaranteed === "enclosed" ? "bg-[#1E3A4C] text-white" : "bg-white text-[#1E3A4C] border-[#1E3A4C]")}
              onClick={() => setSelectedGuaranteed("enclosed")}
              type="button"
            >
              Enclosed
            </button>
          </div>
          
          <p className="text-3xl font-bold text-[#1E3A4C] text-center mb-4">
            {formatPrice(prices.guaranteed[selectedGuaranteed])}
          </p>
          
          <div className="bg-blue-50/70 p-3 rounded-lg mb-4">
            <p className="text-sm text-blue-800 text-center">
              Estimated Transit Time: {Math.max(validatedData.transitTime - 2, 2)} days
            </p>
          </div>
          
          <ul className="text-sm mb-4 space-y-2 text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2 flex-shrink-0">✅</span>
              <span>Guaranteed pickup window</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 flex-shrink-0">✅</span>
              <span>Priority dispatch for faster service</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 flex-shrink-0">✅</span>
              <span>Fully insured, door-to-door service</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2 flex-shrink-0">✅</span>
              <span>$0 due now - pay carrier at delivery</span>
            </li>
          </ul>
          
          <button 
            className="w-full bg-[#1E3A4C] hover:bg-[#163140] text-white font-semibold py-3 rounded-xl transition duration-200 shadow-md min-h-[48px]"
            onClick={() => handleReserve(selectedGuaranteed, true)}
            type="button"
          >
            Reserve Now — No credit card required
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="w-full max-w-2xl mx-auto">
        <p className="text-center text-sm text-gray-600">
          <strong>Note:</strong> Multi-vehicle, inoperable, modified, or vehicles booked with other companies require custom quotes – please text or call for details.
        </p>
      </div>
    </div>
  );
}