import { useEffect, useState } from "react";
import MobileContainer from "@/components/MobileContainer";
import { Button } from "@/components/ui/button";

/**
 * This test page simulates a parent page that hosts our form in an iframe
 * It demonstrates how attribution parameters are sent via postMessage
 */
export default function CrossOriginTest() {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [messageStatus, setMessageStatus] = useState("Waiting for iframe to load...");
  const [lastMessage, setLastMessage] = useState<any>(null);
  
  // Listen for messages from the iframe (for debugging purposes)
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      console.log("📡 Parent received message from iframe:", event.data);
      setLastMessage(event.data);
      
      // If the iframe sends a "form-ready" message, send attribution data
      if (event.data?.type === "form-ready") {
        sendAttributionData();
      }
    }
    
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);
  
  // Function to send attribution parameters via postMessage
  function sendAttributionData() {
    try {
      const iframe = document.getElementById("form-iframe") as HTMLIFrameElement;
      
      if (!iframe.contentWindow) {
        setMessageStatus("⚠️ Cannot access iframe content window");
        return;
      }
      
      const testAttributionData = {
        type: "attribution-data",
        data: {
          fbclid: "fb_test_click_id_123",
          utm_source: "test_source",
          utm_medium: "test_medium",
          utm_campaign: "test_campaign",
          utm_term: "test_term",
          utm_content: "test_content"
        }
      };
      
      // Send data to iframe via postMessage
      iframe.contentWindow.postMessage(testAttributionData, "*");
      setMessageStatus("✅ Attribution data sent to iframe");
      console.log("📤 Sent attribution data to iframe:", testAttributionData);
    } catch (error) {
      console.error("Failed to send attribution data:", error);
      setMessageStatus(`❌ Error sending data: ${error}`);
    }
  }
  
  function handleIframeLoad() {
    setIframeLoaded(true);
    setMessageStatus("✅ Iframe loaded, ready to send attribution data");
  }
  
  return (
    <MobileContainer>
      <div className="p-4 bg-white space-y-4">
        <div className="bg-blue-100 p-3 rounded">
          <h1 className="text-lg font-bold mb-2">Cross-Origin Communication Test</h1>
          <p className="text-sm text-gray-700">
            This page simulates a parent webpage that embeds our form in an iframe,
            demonstrating secure cross-origin communication using postMessage.
          </p>
        </div>
        
        <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
          <h2 className="text-md font-medium mb-1">Communication Status:</h2>
          <p className="text-sm mb-2">{messageStatus}</p>
          
          {iframeLoaded && (
            <Button 
              onClick={sendAttributionData} 
              className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm"
            >
              Send Test Attribution Data
            </Button>
          )}
          
          {lastMessage && (
            <div className="mt-3 pt-2 border-t border-yellow-200">
              <h3 className="text-sm font-medium">Last message from iframe:</h3>
              <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-x-auto">
                {JSON.stringify(lastMessage, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <div className="border border-gray-300 rounded">
          <div className="bg-gray-100 p-2 border-b border-gray-300">
            <h2 className="text-sm font-medium">Form Iframe</h2>
          </div>
          <iframe 
            id="form-iframe"
            src="/"
            onLoad={handleIframeLoad}
            className="w-full min-h-[600px] border-0"
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      </div>
    </MobileContainer>
  );
}