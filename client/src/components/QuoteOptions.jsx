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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white text-black px-2 py-4 sm:px-4 overflow-x-hidden">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-4 max-w-md mx-auto">
          <img
            src="https://i.postimg.cc/wxSYD63g/Amerigo-auto-transport-logo222.png"
            className="mx-auto mb-2 h-12 object-contain bg-white rounded-lg p-2 shadow-sm"
            alt="Amerigo Auto Transport USA Themed Logo" />
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1e3a8a]">Your Shipping Quote</h1>
          <p className="text-xs text-gray-600">Free, no-obligation estimate</p>
        </div>

        <div className="mx-auto max-w-lg md:max-w-full mb-4">
          <div className="bg-white/80 backdrop-blur-md text-black rounded-xl p-4 shadow-lg border border-gray-100 w-full max-w-sm mx-auto">
            <h2 className="text-lg font-semibold text-[#1e3a8a] mb-3">Route Information</h2>
            <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
              <div>
                <span className="block font-medium text-[#1e3a8a] text-xs">Ship Date:</span>
                <p className="truncate">{formatDate(validatedData.shipmentDate)}</p>
              </div>
              <div>
                <span className="block font-medium text-[#1e3a8a] text-xs">Transit Time:</span>
                <p>{validatedData.transitTime} days (est.)</p>
              </div>
              <div className="col-span-2">
                <span className="block font-medium text-[#1e3a8a] text-xs">Pickup Location:</span>
                <p className="truncate">{validatedData.pickupLocation}</p>
              </div>
              <div className="col-span-2">
                <span className="block font-medium text-[#1e3a8a] text-xs">Dropoff Location:</span>
                <p className="truncate">{validatedData.dropoffLocation}</p>
              </div>
              <div className="col-span-2">
                <span className="block font-medium text-[#1e3a8a] text-xs">Vehicle:</span>
                <p>{validatedData.year} {validatedData.make} {validatedData.model}</p>
              </div>
              <div>
                <span className="block font-medium text-[#1e3a8a] text-xs">Distance:</span>
                <p>{validatedData.distance.toLocaleString()} miles</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 mx-auto max-w-full md:max-w-4xl lg:max-w-5xl">
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
              className="rounded-xl p-4 bg-white/80 backdrop-blur-md text-center shadow-lg flex flex-col justify-between text-black border border-gray-100 w-full"
            >
              <div>
                <h3 className="text-lg md:text-xl lg:text-2xl font-bold mb-2 text-[#1e3a8a]">{label}</h3>
                <div className="mb-3">
                  <button
                    className={`px-3 py-1 text-xs md:text-sm lg:text-base font-medium rounded-full mr-2 ${!isEnclosed ? 'bg-[#1e3a8a] text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => toggle(false)}
                  >Open</button>
                  <button
                    className={`px-3 py-1 text-xs md:text-sm lg:text-base font-medium rounded-full ${isEnclosed ? 'bg-[#dc2626] text-white' : 'bg-gray-200 text-gray-700'}`}
                    onClick={() => toggle(true)}
                  >Enclosed</button>
                </div>
                <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#dc2626] mb-3">{formatUSD(price)}</p>
                <ul className="text-left text-xs md:text-sm lg:text-base space-y-0.5 mb-4 text-gray-700">
                  {type === 'standard' ? (
                    <>
                      <li className="flex items-center py-0.5">
                        <span className="text-green-500 mr-1 text-xs">✓</span> Pickup within 7-day window
                      </li>
                      <li className="flex items-center py-0.5">
                        <span className="text-green-500 mr-1 text-xs">✓</span> Fully insured 
                      </li>
                      <li className="flex items-center py-0.5">
                        <span className="text-green-500 mr-1 text-xs">✓</span> Door-to-door service
                      </li>
                      <li className="flex items-center py-0.5">
                        <span className="text-green-500 mr-1 text-xs">✓</span> $0 due now
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="flex items-center py-0.5">
                        <span className="text-green-500 mr-1 text-xs">✓</span> Guaranteed pickup window
                      </li>
                      <li className="flex items-center py-0.5">
                        <span className="text-green-500 mr-1 text-xs">✓</span> Priority dispatch
                      </li>
                      <li className="flex items-center py-0.5">
                        <span className="text-green-500 mr-1 text-xs">✓</span> Fully insured, door-to-door
                      </li>
                      <li className="flex items-center py-0.5">
                        <span className="text-green-500 mr-1 text-xs">✓</span> $0 due now
                      </li>
                    </>
                  )}
                </ul>
              </div>
              <button
                onClick={() => handleReserve(type)}
                className="w-full bg-[#1e3a8a] hover:bg-[#0f2a63] text-white font-bold py-2 md:py-3 lg:py-4 px-4 rounded-lg text-xs md:text-sm lg:text-base transition min-h-[40px] md:min-h-[48px] lg:min-h-[56px]"
              >
                Reserve Now — No payment required
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
