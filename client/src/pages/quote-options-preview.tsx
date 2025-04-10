import QuoteOptions from "@/components/QuoteOptions";
import { Link } from "wouter";

export default function QuoteOptionsPreview() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center mb-6">Quote Options Preview</h1>
      
      <div className="mb-8">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">Mobile View (308px)</h2>
          <Link href="/" className="text-blue-600 hover:underline">Back to Home</Link>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg flex justify-center">
          <div style={{ width: "308px", border: "2px dashed #1e3a8a", borderRadius: "8px", overflow: "hidden" }}>
            <QuoteOptions />
          </div>
        </div>
      </div>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Tablet View (560px)</h2>
        <div className="bg-gray-100 p-4 rounded-lg overflow-hidden">
          <div style={{ width: "560px", margin: "0 auto", border: "2px dashed #1e3a8a", borderRadius: "8px", overflow: "hidden" }}>
            <QuoteOptions />
          </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Desktop View (800px)</h2>
        <div className="bg-gray-100 p-4 rounded-lg overflow-hidden">
          <div style={{ width: "800px", margin: "0 auto", border: "2px dashed #1e3a8a", borderRadius: "8px", overflow: "hidden" }}>
            <QuoteOptions />
          </div>
        </div>
      </div>
    </div>
  );
}