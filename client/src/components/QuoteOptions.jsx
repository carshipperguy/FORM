import { useState } from "react";
import { useLocation } from "wouter";

export default function QuoteOptions({ data }) {
  const [, navigate] = useLocation();
  const [selectedStandard, setSelectedStandard] = useState("open");
  const [selectedGuaranteed, setSelectedGuaranteed] = useState("open");

  // Use real pricing data from the quote calculation
  const prices = {
    standard: { 
      open: data?.openTransportPrice || 0, 
      enclosed: data?.enclosedTransportPrice || 0 
    },
    guaranteed: { 
      open: data ? Math.round(data.openTransportPrice * 1.3) : 0, 
      enclosed: data ? Math.round(data.enclosedTransportPrice * 1.3) : 0 
    }
  };

  const handleReserve = (type, isGuaranteed) => {
    if (!data) return;
    
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

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-[#003366]">
        Choose Your Shipping Option
      </h1>
      
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Open Transport - Standard */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 text-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-center">Open Transport</h2>
          <p className="text-3xl font-bold text-center mb-4">${prices.standard.open}</p>
          <ul className="text-sm mb-4 space-y-1 text-gray-700">
            <li>Picked up within 7 business days</li>
            <li>Open carrier</li>
            <li>$0 Due Now</li>
          </ul>
          <button 
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md transition duration-200 shadow-md"
            onClick={() => handleReserve("open", false)}
          >
            Reserve Now - No Credit Card Required
          </button>
        </div>

        {/* Enclosed Transport - Standard */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 text-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-center">Enclosed Transport</h2>
          <p className="text-3xl font-bold text-center mb-4">${prices.standard.enclosed}</p>
          <ul className="text-sm mb-4 space-y-1 text-gray-700">
            <li>Picked up within 7 business days</li>
            <li>Enclosed carrier</li>
            <li>$0 Due Now</li>
          </ul>
          <button 
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md transition duration-200 shadow-md"
            onClick={() => handleReserve("enclosed", false)}
          >
            Reserve Now - No Credit Card Required
          </button>
        </div>

        {/* Open Transport - Guaranteed */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 text-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-center">Open + Guaranteed Date</h2>
          <p className="text-3xl font-bold text-center mb-4">${prices.guaranteed.open}</p>
          <ul className="text-sm mb-4 space-y-1 text-gray-700">
            <li>Guaranteed pickup date</li>
            <li>Open carrier</li>
            <li>$0 Due Now</li>
          </ul>
          <button 
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md transition duration-200 shadow-md"
            onClick={() => handleReserve("open", true)}
          >
            Reserve Now - No Credit Card Required
          </button>
        </div>

        {/* Enclosed Transport - Guaranteed */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-6 text-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-center">Enclosed + Guaranteed Date</h2>
          <p className="text-3xl font-bold text-center mb-4">${prices.guaranteed.enclosed}</p>
          <ul className="text-sm mb-4 space-y-1 text-gray-700">
            <li>Guaranteed pickup date</li>
            <li>Enclosed carrier</li>
            <li>$0 Due Now</li>
          </ul>
          <button 
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-md transition duration-200 shadow-md"
            onClick={() => handleReserve("enclosed", true)}
          >
            Reserve Now - No Credit Card Required
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-sm text-gray-700 max-w-2xl mt-6">
        Got more than one vehicle? Shipping something modified or inoperable?<br />
        Please call <span className="font-semibold">(954) 642-2118</span> for a custom quote — these require special handling.
      </p>
    </div>
  );
}