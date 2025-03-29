import { useState } from "react";
import { useLocation } from "wouter";

export default function QuoteOptions({ data }) {
  const [, navigate] = useLocation();
  const [selectedStandard, setSelectedStandard] = useState("open");
  const [selectedGuaranteed, setSelectedGuaranteed] = useState("open");

  // Use real pricing data from the quote calculation
  const prices = {
    standard: { 
      open: data?.openTransportPrice || 450, 
      enclosed: data?.enclosedTransportPrice || 765 
    },
    guaranteed: { 
      open: data ? Math.round(data.openTransportPrice * 1.4) : 630, 
      enclosed: data ? Math.round(data.enclosedTransportPrice * 1.4) : 1071 
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Standard Transport */}
        <div className="backdrop-blur-md bg-white/60 border border-blue-100 rounded-2xl shadow-lg p-6 text-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-[#1E3A4C] text-center">Standard Transport</h2>
          
          <div className="flex justify-center gap-4 mb-4">
            <button
              className={`px-4 py-1 rounded-full text-sm font-medium border ${selectedStandard === "open" ? "bg-[#1E3A4C] text-white" : "bg-white text-[#1E3A4C] border-[#1E3A4C]"}`}
              onClick={() => setSelectedStandard("open")}
            >
              Open
            </button>
            <button
              className={`px-4 py-1 rounded-full text-sm font-medium border ${selectedStandard === "enclosed" ? "bg-[#1E3A4C] text-white" : "bg-white text-[#1E3A4C] border-[#1E3A4C]"}`}
              onClick={() => setSelectedStandard("enclosed")}
            >
              Enclosed
            </button>
          </div>
          
          <p className="text-3xl font-bold text-[#1E3A4C] text-center mb-4">${prices.standard[selectedStandard]}</p>
          
          <ul className="text-sm mb-4 space-y-1 text-gray-700">
            <li>✅ Pickup within 7-day window</li>
            <li>✅ Fully insured</li>
            <li>✅ Door-to-door service</li>
            <li>✅ $0 due now</li>
          </ul>
          
          <button 
            className="w-full bg-[#1E3A4C] hover:bg-[#163140] text-white font-semibold py-2 rounded-xl transition duration-200 shadow-md"
            onClick={() => handleReserve(selectedStandard, false)}
          >
            Reserve Now — No credit card required
          </button>
        </div>

        {/* Express Transport */}
        <div className="backdrop-blur-md bg-white/60 border border-blue-100 rounded-2xl shadow-lg p-6 text-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-[#1E3A4C] text-center">Express Transport</h2>
          
          <div className="flex justify-center gap-4 mb-4">
            <button
              className={`px-4 py-1 rounded-full text-sm font-medium border ${selectedGuaranteed === "open" ? "bg-[#1E3A4C] text-white" : "bg-white text-[#1E3A4C] border-[#1E3A4C]"}`}
              onClick={() => setSelectedGuaranteed("open")}
            >
              Open
            </button>
            <button
              className={`px-4 py-1 rounded-full text-sm font-medium border ${selectedGuaranteed === "enclosed" ? "bg-[#1E3A4C] text-white" : "bg-white text-[#1E3A4C] border-[#1E3A4C]"}`}
              onClick={() => setSelectedGuaranteed("enclosed")}
            >
              Enclosed
            </button>
          </div>
          
          <p className="text-3xl font-bold text-[#1E3A4C] text-center mb-4">${prices.guaranteed[selectedGuaranteed]}</p>
          
          <ul className="text-sm mb-4 space-y-1 text-gray-700">
            <li>✅ Guaranteed pickup window</li>
            <li>✅ Priority dispatch</li>
            <li>✅ Fully insured, door-to-door</li>
            <li>✅ $0 due now</li>
          </ul>
          
          <button 
            className="w-full bg-[#1E3A4C] hover:bg-[#163140] text-white font-semibold py-2 rounded-xl transition duration-200 shadow-md"
            onClick={() => handleReserve(selectedGuaranteed, true)}
          >
            Reserve Now — No credit card required
          </button>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-sm text-gray-600 max-w-xl">
        <strong>Note:</strong> Multi-vehicle, inoperable, modified, or vehicles booked with other companies require custom quotes – please text or call for details.
      </p>
    </div>
  );
}