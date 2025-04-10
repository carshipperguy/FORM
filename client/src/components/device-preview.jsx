import React from 'react';
import { QuoteForm } from './quote-form';
import { TrustBadges } from './trust-badges';

export default function DevicePreview() {
  // Mock function for the form
  const handleCalculate = (data) => {
    console.log('Form data:', data);
    // Just for preview - doesn't actually submit
  };

  return (
    <div className="py-8 px-4">
      <h1 className="text-2xl font-bold text-center mb-8">Form Preview on Different Devices</h1>
      
      {/* Desktop Version */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Desktop Version (800px width)</h2>
        <div className="bg-gray-100 p-4 rounded-lg overflow-hidden">
          <div style={{ width: "800px", margin: "0 auto", border: "2px dashed #1e3a8a", borderRadius: "8px", overflow: "hidden" }}>
            <div className="bg-gradient-to-b from-blue-50 to-white p-4">
              <div className="form-container" style={{ width: "800px" }}>
                <div className="text-center mb-6">
                  <img
                    src="https://i.postimg.cc/wxSYD63g/Amerigo-auto-transport-logo222.png"
                    className="mx-auto mb-4 h-16 object-contain bg-white rounded-lg p-2 shadow-sm"
                    alt="Amerigo Auto Transport Logo" 
                  />
                  <h1 className="text-3xl font-bold text-[#1e3a8a] mb-2">
                    Instant Car Shipping Quote
                  </h1>
                  <p className="text-base text-gray-600">Free, no-obligation estimate - takes 30 seconds</p>
                </div>
                <div className="bg-white/80 backdrop-blur-md shadow-lg rounded-xl p-8 mb-8 border border-gray-100">
                  <QuoteForm onCalculate={handleCalculate} isCalculating={false} />
                </div>
                <TrustBadges />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Version */}
      <div>
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">Mobile Version (308px width)</h2>
        <div className="bg-gray-100 p-4 rounded-lg flex justify-center">
          <div style={{ width: "308px", border: "2px dashed #1e3a8a", borderRadius: "8px", overflow: "hidden" }}>
            <div className="bg-gradient-to-b from-blue-50 to-white p-2">
              <div className="form-container" style={{ width: "308px" }}>
                <div className="text-center mb-4">
                  <img
                    src="https://i.postimg.cc/wxSYD63g/Amerigo-auto-transport-logo222.png"
                    className="mx-auto mb-2 h-10 object-contain bg-white rounded-lg p-2 shadow-sm"
                    alt="Amerigo Auto Transport Logo" 
                  />
                  <h1 className="text-xl font-bold text-[#1e3a8a] mb-1">
                    Instant Car Shipping Quote
                  </h1>
                  <p className="text-xs text-gray-600">Free, no-obligation estimate - takes 30 seconds</p>
                </div>
                <div className="bg-white/80 backdrop-blur-md shadow-lg rounded-xl p-4 mb-4 border border-gray-100">
                  <QuoteForm onCalculate={handleCalculate} isCalculating={false} />
                </div>
                <TrustBadges />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}