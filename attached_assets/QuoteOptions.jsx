
import { useState } from "react";

export default function QuoteOptions() {
  const [selectedStandard, setSelectedStandard] = useState("open");
  const [selectedGuaranteed, setSelectedGuaranteed] = useState("open");

  const prices = {
    standard: { open: "$450", enclosed: "$765" },
    guaranteed: { open: "$630", enclosed: "$1071" }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* Standard Pricing */}
        <div className="backdrop-blur-md bg-white/60 border border-blue-100 rounded-2xl shadow-lg p-6 text-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-[#1E3A4C] text-center">Standard Transportsdfs</h2>

          <div className="flex justify-center gap-4 mb-4">
            <button
              className={\`px-4 py-1 rounded-full text-sm font-medium border \${selectedStandard === "open" ? "bg-[#1E3A4C] text-white" : "bg-white text-[#1E3A4C] border-[#1E3A4C]"}\`}
              onClick={() => setSelectedStandard("open")}
            >
              Open
            </button>
            <button
              className={\`px-4 py-1 rounded-full text-sm font-medium border \${selectedStandard === "enclosed" ? "bg-[#1E3A4C] text-white" : "bg-white text-[#1E3A4C] border-[#1E3A4C]"}\`}
              onClick={() => setSelectedStandard("enclosed")}
            >
              Enclosed
            </button>
          </div>

          <p className="text-3xl font-bold text-[#1E3A4C] text-center mb-4">{prices.standard[selectedStandard]}</p>

          <ul className="text-sm mb-4 space-y-1 text-gray-700">
            <li>✅ Pickup within 7-day window</li>
            <li>✅ Fully insured</li>
            <li>✅ Door-to-door service</li>
            <li>✅ $0 due now</li>
          </ul>

          <button className="w-full bg-[#1E3A4C] hover:bg-[#163140] text-white font-semibold py-2 rounded-xl transition duration-200 shadow-md">
            Reserve Now — No credit card required
          </button>
        </div>

        {/* Express Transport */}
        <div className="backdrop-blur-md bg-white/60 border border-blue-100 rounded-2xl shadow-lg p-6 text-gray-800">
          <h2 className="text-xl font-semibold mb-4 text-[#1E3A4C] text-center">Express Transport</h2>

          <div className="flex justify-center gap-4 mb-4">
            <button
              className={\`px-4 py-1 rounded-full text-sm font-medium border \${selectedGuaranteed === "open" ? "bg-[#1E3A4C] text-white" : "bg-white text-[#1E3A4C] border-[#1E3A4C]"}\`}
              onClick={() => setSelectedGuaranteed("open")}
            >
              Open
            </button>
            <button
              className={\`px-4 py-1 rounded-full text-sm font-medium border \${selectedGuaranteed === "enclosed" ? "bg-[#1E3A4C] text-white" : "bg-white text-[#1E3A4C] border-[#1E3A4C]"}\`}
              onClick={() => setSelectedGuaranteed("enclosed")}
            >
              Enclosed
            </button>
          </div>

          <p className="text-3xl font-bold text-[#1E3A4C] text-center mb-4">{prices.guaranteed[selectedGuaranteed]}</p>

          <ul className="text-sm mb-4 space-y-1 text-gray-700">
            <li>✅ Guaranteed pickup window</li>
            <li>✅ Priority dispatch</li>
            <li>✅ Fully insured, door-to-door</li>
            <li>✅ $0 due now</li>
          </ul>

          <button className="w-full bg-[#1E3A4C] hover:bg-[#163140] text-white font-semibold py-2 rounded-xl transition duration-200 shadow-md">
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
