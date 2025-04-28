import { Clipboard, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import MobileContainer from "@/components/MobileContainer";

export default function EmbeddingInstructions() {
  const [copied, setCopied] = useState(false);
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Simple HTML code for the parent page to embed the iframe
  const iframeEmbedCode = `<iframe 
  src="https://your-form-app.replit.app" 
  id="form-iframe"
  width="100%" 
  height="850" 
  frameborder="0"
  sandbox="allow-scripts allow-same-origin allow-forms"
  allow="geolocation"
></iframe>`;

  const wordpressInstructions = `
1. Go to the WordPress page where you want to embed the form
2. Switch to the "Text" (HTML) editor mode
3. Paste the iframe code at the desired location
4. Make sure your WordPress theme allows iframes
5. Save the page and test that the form loads correctly
`;

  return (
    <MobileContainer>
      <div className="p-4 bg-white space-y-4">
        <h1 className="text-xl font-bold text-center text-[#002C42]">
          Form Embedding Instructions
        </h1>
        
        <Alert className="bg-blue-50 border-blue-200">
          <AlertTitle className="text-blue-800">Important Information</AlertTitle>
          <AlertDescription className="text-blue-700">
            These instructions explain how to embed the auto transport form on your website.
            Simply copy the iframe code and paste it into your page's HTML.
          </AlertDescription>
        </Alert>
        
        <Tabs defaultValue="iframe">
          <TabsList className="w-full">
            <TabsTrigger value="iframe" className="flex-1">Iframe Code</TabsTrigger>
            <TabsTrigger value="wordpress" className="flex-1">WordPress</TabsTrigger>
          </TabsList>
          
          <TabsContent value="iframe" className="p-0">
            <div className="relative">
              <div className="bg-gray-100 rounded p-4 mt-2">
                <h2 className="text-sm font-medium mb-2">HTML & JavaScript Code:</h2>
                <pre className="text-xs overflow-x-auto bg-slate-900 text-slate-50 p-4 rounded">
                  {iframeEmbedCode}
                </pre>
                
                <Button 
                  onClick={() => copyToClipboard(iframeEmbedCode)} 
                  className="absolute top-2 right-2"
                  size="sm"
                  variant="ghost"
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <Clipboard className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              <div className="mt-4 text-sm space-y-2">
                <h3 className="font-medium">How This Works:</h3>
                <ol className="list-decimal ml-5 space-y-1">
                  <li>Add this iframe code to your landing page</li>
                  <li>The form will display within the iframe</li>
                  <li>The form automatically captures basic URL parameters</li>
                  <li>All submissions include the source page's URL for reference</li>
                </ol>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="wordpress" className="mt-2">
            <div className="bg-gray-100 rounded p-4 space-y-3">
              <h2 className="text-sm font-medium">WordPress Installation Steps:</h2>
              <pre className="text-xs whitespace-pre-line bg-slate-900 text-slate-50 p-4 rounded">
                {wordpressInstructions}
              </pre>
              
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <h3 className="font-medium text-yellow-800 mb-1">Important Notes:</h3>
                <ul className="list-disc ml-5 text-yellow-700 space-y-1">
                  <li>Ensure your WordPress security settings allow iframes</li>
                  <li>Some WordPress security plugins may block custom JavaScript</li>
                  <li>Always test the form after embedding to verify it works correctly</li>
                  <li>Replace the iframe src URL with your actual deployed form URL</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 border-t pt-4">
          <h2 className="text-lg font-semibold mb-2">Testing Your Implementation</h2>
          <p className="text-sm text-gray-700 mb-3">
            After embedding the form, you should test that it works correctly:
          </p>
          
          <ol className="list-decimal ml-5 text-sm space-y-2">
            <li>
              <span className="font-medium">Visit your page with the embedded form</span>
              <div className="text-xs text-gray-600 mt-1">
                Make sure the form loads properly and displays correctly
              </div>
            </li>
            <li>
              <span className="font-medium">Fill out the form completely</span>
              <div className="text-xs text-gray-600 mt-1">
                Enter all required information to test submission
              </div>
            </li>
            <li>
              <span className="font-medium">Complete the form submission</span>
              <div className="text-xs text-gray-600 mt-1">
                Verify you're redirected to the quote results page
              </div>
            </li>
            <li>
              <span className="font-medium">Check webhook delivery</span>
              <div className="text-xs text-gray-600 mt-1">
                Contact our team to confirm your test submission was received
              </div>
            </li>
          </ol>
        </div>
      </div>
    </MobileContainer>
  );
}