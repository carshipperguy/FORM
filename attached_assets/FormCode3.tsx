
import { useState } from 'react';

const QuoteDetails = () => {
  const [isEnclosedStandard, setIsEnclosedStandard] = useState(false);
  const [isEnclosedExpress, setIsEnclosedExpress] = useState(false);

  const basePrice = 765;
  const expressBasePrice = 630;

  const standardPrice = isEnclosedStandard ? basePrice * 1.4 : basePrice;
  const expressPrice = isEnclosedExpress ? expressBasePrice * 1.4 : expressBasePrice;

  const formatUSD = (price) => new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(price);

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
          <div className="bg-white text-black rounded-2xl p-3 shadow-xl border border-gray-200">
            <h2 className="text-xl font-semibold text-[#1e3a8a] mb-4">Route Info</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <span className="block font-medium text-[#1e3a8a]">Ship Date:</span>
                April 15, 2025
              </div>
              <div>
                <span className="block font-medium text-[#1e3a8a]">Pickup Location:</span>
                Miami, FL 33101
              </div>
              <div>
                <span className="block font-medium text-[#1e3a8a]">Dropoff Location:</span>
                Los Angeles, CA 90001
              </div>
              <div>
                <span className="block font-medium text-[#1e3a8a]">Vehicle:</span>
                2022 Toyota Camry
              </div>
              <div>
                <span className="block font-medium text-[#1e3a8a]">Route Distance:</span>
                2,732 miles (est.)
              </div>
              <div>
                <span className="block font-medium text-[#1e3a8a]">Transit Time:</span>
                7 days (est.)
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          {[{
            label: 'Standard Transport',
            isEnclosed: isEnclosedStandard,
            toggle: setIsEnclosedStandard,
            price: standardPrice
          }, {
            label: 'Express Transport',
            isEnclosed: isEnclosedExpress,
            toggle: setIsEnclosedExpress,
            price: expressPrice
          }].map(({ label, isEnclosed, toggle, price }) => (
            <div
              key={label}
              className="rounded-2xl p-6 bg-white text-center shadow-2xl flex flex-col justify-between text-black border border-gray-200"
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
                  {label === 'Standard Transport' ? (
                    <>
                      <li>✅ Pickup within 7-day window</li>
                      <li>✅ Fully insured</li>
                      <li>✅ Door-to-door service</li>
                      <li>✅ $0 due now</li>
                    </>
                  ) : (
                    <>
                      <li>✅ Guaranteed pickup window</li>
                      <li>✅ Priority dispatch</li>
                      <li>✅ Fully insured, door-to-door</li>
                      <li>✅ $0 due now</li>
                    </>
                  )}
                </ul>
              </div>
              <a
                href="#"
                className="inline-block bg-[#1e3a8a] hover:bg-[#0f2a63] text-white font-bold py-2 px-6 rounded-full text-sm transition"
              >
                Reserve Now — No credit card required
              </a>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-gray-800">
          Note: Multi-vehicle, inoperable, modified, or vehicles booked with other companies require custom quotes — please text or call for details.
        </p>
      </div>
    </div>
  );
};

export default QuoteDetails;
