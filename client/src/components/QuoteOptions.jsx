import React, { useState } from "react";
import { useLocation } from "wouter";

export default function QuoteOptions({ data }) {
  const [, navigate] = useLocation();
  const [isEnclosedStandard, setIsEnclosedStandard] = useState(false);
  const [isEnclosedExpress, setIsEnclosedExpress] = useState(false);
  const [showNotifyForm, setShowNotifyForm] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

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

  // Send quote notification via SMS or email
  const handleSendQuote = async (e) => {
    e.preventDefault();
    
    if (!email && !phone) {
      alert("Please enter an email or phone number to receive your quote");
      return;
    }
    
    setIsSending(true);
    
    try {
      // Calculate the selected price
      const standardPrice = isEnclosedStandard 
        ? validatedData.enclosedTransportPrice 
        : validatedData.openTransportPrice;
      
      const expressBasePrice = Math.round(validatedData.openTransportPrice * 1.3);
      const expressPrice = isEnclosedExpress 
        ? Math.round(validatedData.enclosedTransportPrice * 1.3) 
        : expressBasePrice;
      
      // Use the selected option (standard or express) for the notification
      const selectedPrice = showNotifyForm === "standard" ? standardPrice : expressPrice;
      const selectedTransport = (showNotifyForm === "standard" ? isEnclosedStandard : isEnclosedExpress) 
        ? "enclosed" 
        : "open";
      
      // Create quote details object
      const quoteDetails = {
        ...data,
        selectedTransport,
        finalPrice: selectedPrice,
        isExpress: showNotifyForm === "express"
      };
      
      // Send API request
      const response = await fetch('/api/send-quote-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          phone,
          quoteDetails
        })
      });
      
      if (response.ok) {
        setSentSuccess(true);
        setTimeout(() => {
          setShowNotifyForm(false);
          setSentSuccess(false);
        }, 5000);
      } else {
        throw new Error("Failed to send notification");
      }
    } catch (error) {
      console.error("Error sending quote notification:", error);
      alert("There was a problem sending your quote. Please try again.");
    } finally {
      setIsSending(false);
    }
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
    <div className="min-h-screen bg-gradient-to-br from-[#1e3a8a] via-[#ffffff] to-[#dc2626] text-black px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-6">
          <img
            src="https://i.postimg.cc/wxSYD63g/Amerigo-auto-transport-logo222.png"
            className="mx-auto mb-4 h-16 object-contain bg-white rounded-lg p-2 shadow-md ring-2 ring-red-600"
            alt="Amerigo Auto Transport USA Themed Logo" />
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#1e3a8a] drop-shadow-md">Shipping Quote Summary</h1>
          <p className="text-sm text-gray-700 mt-2">Military Owned • Family Operated • Proudly American</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10 mb-10">
          <div className="bg-white text-black rounded-2xl p-5 shadow-xl border border-gray-200 mx-auto w-full max-w-md">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 mb-8">
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
              className="rounded-2xl p-6 bg-white text-center shadow-2xl flex flex-col justify-between text-black border border-gray-200 mx-auto w-full max-w-md"
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
              <div className="space-y-2">
                <button
                  onClick={() => handleReserve(type)}
                  className="inline-block w-full bg-[#1e3a8a] hover:bg-[#0f2a63] text-white font-bold py-3 px-6 rounded-full text-sm transition min-h-[48px]"
                >
                  Reserve Now — No credit card required
                </button>
                <button
                  onClick={() => setShowNotifyForm(type)}
                  className="inline-block w-full bg-transparent border border-[#1e3a8a] text-[#1e3a8a] hover:bg-blue-50 font-medium py-2 px-4 rounded-full text-xs transition"
                >
                  Send this quote to my phone or email
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quote notification form */}
        {showNotifyForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
              <button 
                onClick={() => setShowNotifyForm(false)}
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
              
              <h3 className="text-xl font-bold text-[#1e3a8a] mb-4">
                Send Your {showNotifyForm === "standard" ? "Standard" : "Express"} Quote
              </h3>
              
              {sentSuccess ? (
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                  <p className="text-gray-700 mb-2">Your quote has been sent!</p>
                  <p className="text-sm text-gray-500">Check your inbox or phone for details</p>
                </div>
              ) : (
                <form onSubmit={handleSendQuote} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      placeholder="(123) 456-7890"
                    />
                  </div>
                  
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSending || (!email && !phone)}
                      className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                        isSending || (!email && !phone)
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-[#1e3a8a] hover:bg-[#0f2a63]"
                      }`}
                    >
                      {isSending ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </span>
                      ) : (
                        "Send My Quote"
                      )}
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-500 text-center">
                    We'll send your quote details instantly via email and/or SMS.
                    No spam, we promise!
                  </p>
                </form>
              )}
            </div>
          </div>
        )}

        <p className="mt-10 text-center text-xs text-gray-800 max-w-2xl mx-auto">
          Note: Multi-vehicle, inoperable, modified, or vehicles booked with other companies require custom quotes — please text or call for details.
        </p>
      </div>
    </div>
  );
}
