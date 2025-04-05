import React, { useState } from "react";
import { useLocation } from "wouter";

export default function QuoteOptions({ data }) {
  const [, navigate] = useLocation();
  const [selectedStandard, setSelectedStandard] = useState("open");
  const [selectedGuaranteed, setSelectedGuaranteed] = useState("open");
  const [activeCard, setActiveCard] = useState("standard");

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
    };
  }, [data]);

  const prices = React.useMemo(() => {
    if (!validatedData) {
      return {
        standard: { open: 450, enclosed: 765 },
        guaranteed: { open: 630, enclosed: 1071 },
      };
    }

    return {
      standard: {
        open: validatedData.openTransportPrice,
        enclosed: validatedData.enclosedTransportPrice,
      },
      guaranteed: {
        open: Math.round(validatedData.openTransportPrice * 1.4),
        enclosed: Math.round(validatedData.enclosedTransportPrice * 1.4),
      },
    };
  }, [validatedData]);

  const formatPrice = (price) => {
    return typeof price === "number"
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
      data: encodeURIComponent(
        JSON.stringify({
          ...data,
          selectedTransport: transportType,
          guaranteedDate: isGuaranteed,
          finalPrice: price,
        }),
      ),
    });

    navigate(`/booking?${params.toString()}`);
  };

  if (!validatedData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center p-4">
        <div className="bg-white/80 p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-semibold text-[#1E3A4C] mb-4">
            Quote Data Error
          </h2>
          <p className="text-gray-600">
            There was a problem loading your quote. Please try again.
          </p>
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
      <div className="w-full max-w-5xl mx-auto mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[#1E3A4C] text-center mb-2">
          Your Auto Transport Quote
        </h1>
        <p className="text-gray-600 text-center mb-6">
          {validatedData.year} {validatedData.make} {validatedData.model} •{" "}
          {validatedData.pickupLocation} to {validatedData.dropoffLocation}
        </p>

        {/* Toggle Switch */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-[#1E3A4C]">Standard</span>
            <button
              onClick={() =>
                setActiveCard((prev) =>
                  prev === "standard" ? "express" : "standard",
                )
              }
              className="relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-200 bg-[#1E3A4C]"
            >
              <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform duration-200 ${
                  activeCard === "express" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm text-[#1E3A4C]">Express</span>
          </div>
        </div>
      </div>

      {/* Quote Card */}
      <div className="max-w-2xl w-full mb-8">
        {activeCard === "standard" ? (
          <QuoteCard
            title="Standard Transport"
            selected={selectedStandard}
            setSelected={setSelectedStandard}
            price={prices.standard[selectedStandard]}
            transitTime={validatedData.transitTime}
            onReserve={() => handleReserve(selectedStandard, false)}
          />
        ) : (
          <QuoteCard
            title="Express Transport"
            selected={selectedGuaranteed}
            setSelected={setSelectedGuaranteed}
            price={prices.guaranteed[selectedGuaranteed]}
            transitTime={Math.max(validatedData.transitTime - 2, 2)}
            onReserve={() => handleReserve(selectedGuaranteed, true)}
            isExpress
          />
        )}
      </div>

      {/* Disclaimer */}
      <div className="w-full max-w-2xl mx-auto">
        <p className="text-center text-sm text-gray-600">
          <strong>Note:</strong> Multi-vehicle, inoperable, modified, or
          vehicles booked with other companies require custom quotes – please
          text or call for details.
        </p>
      </div>
    </div>
  );
}

function QuoteCard({
  title,
  selected,
  setSelected,
  price,
  transitTime,
  onReserve,
  isExpress = false,
}) {
  return (
    <div className="backdrop-blur-md bg-white/60 border border-blue-100 rounded-2xl shadow-lg p-6 text-gray-800">
      <h2 className="text-xl font-semibold mb-4 text-[#1E3A4C] text-center">
        {title}
      </h2>

      <div className="flex justify-center gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium border min-h-[48px] ${
            selected === "open"
              ? "bg-[#1E3A4C] text-white"
              : "bg-white text-[#1E3A4C] border-[#1E3A4C]"
          }`}
          onClick={() => setSelected("open")}
        >
          Open
        </button>
        <button
          className={`px-4 py-2 rounded-full text-sm font-medium border min-h-[48px] ${
            selected === "enclosed"
              ? "bg-[#1E3A4C] text-white"
              : "bg-white text-[#1E3A4C] border-[#1E3A4C]"
          }`}
          onClick={() => setSelected("enclosed")}
        >
          Enclosed
        </button>
      </div>

      <p className="text-3xl font-bold text-[#1E3A4C] text-center mb-4">
        ${Math.round(price).toLocaleString()}
      </p>

      <div className="bg-blue-50/70 p-3 rounded-lg mb-4">
        <p className="text-sm text-blue-800 text-center">
          Estimated Transit Time: {transitTime} days
        </p>
      </div>

      <ul className="text-sm mb-4 space-y-2 text-gray-700">
        {isExpress ? (
          <>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✅</span> Guaranteed pickup
              window
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✅</span> Priority dispatch
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✅</span> Fully insured,
              door-to-door
            </li>
          </>
        ) : (
          <>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✅</span> Pickup within
              7-day window
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✅</span> Fully insured
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✅</span> Door-to-door
              service
            </li>
          </>
        )}
        <li className="flex items-start">
          <span className="text-green-500 mr-2">✅</span> $0 due now
        </li>
      </ul>

      <button
        className="w-full bg-[#1E3A4C] hover:bg-[#163140] text-white font-semibold py-3 rounded-xl transition duration-200 shadow-md min-h-[48px] p-5"
        onClick={onReserve}
      >
        Reserve Now — No credit card required
      </button>
    </div>
  );
}
