import React, { useState } from "react";
import { useLocation } from "wouter";

export default function QuoteOptions({ data }) {
  const [, navigate] = useLocation();
  const [isEnclosedStandard, setIsEnclosedStandard] = useState(false);
  const [isEnclosedExpress, setIsEnclosedExpress] = useState(false);

  const validatedData = React.useMemo(() => {
    if (!data) return null;

    return {
      year: data.year || "N/A",
      make: data.make || "N/A",
      model: data.model || "N/A",
      pickupLocation: data.pickupLocation || "N/A",
      dropoffLocation: data.dropoffLocation || "N/A",
      openTransportPrice:
        typeof data.openTransportPrice === "number"
          ? data.openTransportPrice
          : 450,
      enclosedTransportPrice:
        typeof data.enclosedTransportPrice === "number"
          ? data.enclosedTransportPrice
          : 765,
      transitTime: typeof data.transitTime === "number" ? data.transitTime : 5,
      distance: typeof data.distance === "number" ? data.distance : 0,
      shipmentDate: data.shipmentDate || new Date()
    };
  }, [data]);

  // Format values as USD
  const formatUSD = (price) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);

  // Handle the Reserve button click
  const handleReserve = (type) => {
    if (!validatedData) return;

    // Calculate pricing
    const standardPrice = isEnclosedStandard 
      ? validatedData.enclosedTransportPrice 
      : validatedData.openTransportPrice;
    
    const expressBasePrice = Math.round(validatedData.openTransportPrice * 1.3);
    const expressPrice = isEnclosedExpress 
      ? Math.round(validatedData.enclosedTransportPrice * 1.3) 
      : expressBasePrice;

    const transportType = type === "standard" 
      ? (isEnclosedStandard ? "enclosed" : "open") 
      : (isEnclosedExpress ? "enclosed" : "open");
    
    const finalPrice = type === "standard" 
      ? standardPrice 
      : expressPrice;
    
    const isExpress = type === "express";

    const params = new URLSearchParams({
      data: encodeURIComponent(JSON.stringify({
        ...data,
        selectedTransport: transportType,
        isExpress,
        finalPrice
      }))
    });
    
    navigate(`/booking?${params.toString()}`);
  };

  // Format date for display
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };



  if (!validatedData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1e3a8a] via-[#ffffff] to-[#dc2626] flex flex-col items-center justify-center p-4">
        <div className="bg-white/80 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-[#1e3a8a] mb-4">
            Quote Data Error
          </h2>
          <p className="text-gray-600">
            There was a problem loading your quote. Please try again.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 w-full bg-[#1e3a8a] text-white py-2 rounded-lg"
          >
            Return to Quote Form
          </button>
        </div>
      </div>
    );
  }

  // Standard prices
  const standardPrice = isEnclosedStandard 
    ? validatedData.enclosedTransportPrice 
    : validatedData.openTransportPrice;
  
  // Express prices (30% more than standard)
  const expressBasePrice = Math.round(validatedData.openTransportPrice * 1.3);
  const expressPrice = isEnclosedExpress 
    ? Math.round(validatedData.enclosedTransportPrice * 1.3) 
    : expressBasePrice;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a8a] via-[#ffffff] to-[#dc2626] text-black px-4 py-6 sm:px-6 lg:px-8 overflow-x-hidden">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6 max-w-md mx-auto">
          <img
            src="https://i.postimg.cc/wxSYD63g/Amerigo-auto-transport-logo222.png"
            className="mx-auto mb-3 h-14 sm:h-16 object-contain bg-white rounded-lg p-2 shadow-md ring-2 ring-red-600"
            alt="Amerigo Auto Transport USA Themed Logo" />
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-[#1e3a8a] drop-shadow-md">Shipping Quote Summary</h1>
          <p className="text-xs sm:text-sm text-gray-700 mt-2">Military Owned • Family Operated • Proudly American</p>
        </div>

        <div className="mx-auto max-w-lg md:max-w-full mb-10">
          <div className="bg-white text-black rounded-2xl p-5 shadow-xl border border-gray-200 w-full max-w-sm mx-auto">
            <h2 className="text-xl font-semibold text-[#1e3a8a] mb-4">Route Info</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <span className="block font-medium text-[#1e3a8a]">Ship Date:</span>
                {formatDate(validatedData.shipmentDate)}
              </div>
              <div>
                <span className="block font-medium text-[#1e3a8a]">Pickup Location:</span>
                {validatedData.pickupLocation}
              </div>
              <div>
                <span className="block font-medium text-[#1e3a8a]">Dropoff Location:</span>
                {validatedData.dropoffLocation}
              </div>
              <div>
                <span className="block font-medium text-[#1e3a8a]">Vehicle:</span>
                {validatedData.year} {validatedData.make} {validatedData.model}
              </div>
              <div>
                <span className="block font-medium text-[#1e3a8a]">Route Distance:</span>
                {validatedData.distance.toLocaleString()} miles (est.)
              </div>
              <div>
                <span className="block font-medium text-[#1e3a8a]">Transit Time:</span>
                {validatedData.transitTime} days (est.)
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 mb-8 mx-auto max-w-lg lg:max-w-4xl">
          {[{
            label: 'Standard Transport',
            isEnclosed: isEnclosedStandard,
            toggle: setIsEnclosedStandard,
            price: standardPrice,
            type: "standard"
          }, {
            label: 'Express Transport',
            isEnclosed: isEnclosedExpress,
            toggle: setIsEnclosedExpress,
            price: expressPrice,
            type: "express"
          }].map(({ label, isEnclosed, toggle, price, type }) => (
            <div
              key={label}
              className="rounded-2xl p-6 bg-white text-center shadow-2xl flex flex-col justify-between text-black border border-gray-200 w-full"
            >
              <div>
                <h3 className="text-2xl font-bold mb-2 text-[#1e3a8a]">{label}</h3>
                <div className="mb-4">
                  <button
                    className={`px-3 py-1 text-sm font-medium rounded-full mr-2 ${!isEnclosed ? 'bg-blue-700 text-white' : 'bg-gray-300 text-black'}`}
                    onClick={() => toggle(false)}
                  >Open</button>
                  <button
                    className={`px-3 py-1 text-sm font-medium rounded-full ${isEnclosed ? 'bg-red-600 text-white' : 'bg-gray-300 text-black'}`}
                    onClick={() => toggle(true)}
                  >Enclosed</button>
                </div>
                <p className="text-3xl font-bold text-[#dc2626] mb-4">{formatUSD(price)}</p>
                <ul className="text-left text-sm mb-6 text-gray-600">
                  {type === 'standard' ? (
                    <>
                      <li className="flex items-start py-1">
                        <span className="text-green-500 mr-2">✅</span> Pickup within 7-day window
                      </li>
                      <li className="flex items-start py-1">
                        <span className="text-green-500 mr-2">✅</span> Fully insured
                      </li>
                      <li className="flex items-start py-1">
                        <span className="text-green-500 mr-2">✅</span> Door-to-door service
                      </li>
                      <li className="flex items-start py-1">
                        <span className="text-green-500 mr-2">✅</span> $0 due now
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-start py-1">
                        <span className="text-green-500 mr-2">✅</span> Guaranteed pickup window
                      </li>
                      <li className="flex items-start py-1">
                        <span className="text-green-500 mr-2">✅</span> Priority dispatch
                      </li>
                      <li className="flex items-start py-1">
                        <span className="text-green-500 mr-2">✅</span> Fully insured, door-to-door
                      </li>
                      <li className="flex items-start py-1">
                        <span className="text-green-500 mr-2">✅</span> $0 due now
                      </li>
                    </>
                  )}
                </ul>
              </div>
              <button
                onClick={() => handleReserve(type)}
                className="inline-block w-full bg-[#1e3a8a] hover:bg-[#0f2a63] text-white font-bold py-3 px-6 rounded-full text-sm transition min-h-[48px]"
              >
                Reserve Now — No credit card required
              </button>
            </div>
          ))}
        </div>



        <p className="mt-10 text-center text-xs text-gray-800 max-w-2xl mx-auto">
          Note: Multi-vehicle, inoperable, modified, or vehicles booked with other companies require custom quotes — please text or call for details.
        </p>
      </div>
    </div>
  );
}
