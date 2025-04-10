import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateDistance } from "@/lib/mapquest";

export default function TestMapQuest() {
  const [origin, setOrigin] = useState("Los Angeles, CA 90001");
  const [destination, setDestination] = useState("San Francisco, CA 94101");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleTestApi = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      addLog(`Testing distance calculation from "${origin}" to "${destination}"`);
      const distanceResult = await calculateDistance(origin, destination);
      
      setResult(distanceResult);
      
      if (distanceResult.success) {
        addLog(`✅ SUCCESS: Distance is ${distanceResult.distance} miles`);
        addLog(`Travel time: ${distanceResult.time}`);
      } else {
        addLog(`❌ ERROR: ${distanceResult.error}`);
      }
    } catch (error) {
      addLog(`❌ ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setResult({ success: false, error: 'Test failed with exception' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="mx-auto max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center">MapQuest API Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Origin</label>
            <Input 
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              placeholder="Enter origin location"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Destination</label>
            <Input 
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Enter destination location"
            />
          </div>
          
          <Button 
            onClick={handleTestApi} 
            className="w-full"
            disabled={loading}
          >
            {loading ? "Testing..." : "Test MapQuest API"}
          </Button>
          
          {result && (
            <div className="mt-4 p-4 border rounded-md">
              <h3 className="font-medium mb-2">Result:</h3>
              <pre className="bg-gray-100 p-2 rounded text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
          
          <div className="mt-4">
            <h3 className="font-medium mb-2">Test Logs:</h3>
            <div className="bg-gray-100 p-2 rounded text-sm h-40 overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i} className="mb-1">{log}</div>
              ))}
              {logs.length === 0 && (
                <div className="text-gray-500">No logs yet. Run a test to see results.</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}