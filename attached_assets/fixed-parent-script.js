/* global URLSearchParams */
// Enhanced iframe attribution script with proper timing and origin targeting
function sendAttributionToIframe() {
  var urlParams = new URLSearchParams(window.location.search);
  
  var attributionData = {
    fbclid: urlParams.get('fbclid'),
    utm_source: urlParams.get('utm_source'),
    utm_medium: urlParams.get('utm_medium'), 
    utm_campaign: urlParams.get('utm_campaign'),
    utm_content: urlParams.get('utm_content'),
    utm_term: urlParams.get('utm_term'),
    referrer: document.referrer
  };
  console.log("Edward - Fixed Parent Script!!!");
  console.log('📊 Parent: Attempting to send attribution data:', attributionData);
  console.log("Edward - Fixed Parent Script!!!");

  // Find iframe - try multiple selectors
  var iframe = document.querySelector('iframe[src*="form-carshipperguy"]') || 
               document.querySelector('iframe[src*="replit"]') ||
               document.querySelector('iframe') ||
               document.getElementById('quote-form-iframe');
  
  if (iframe && iframe.contentWindow) {
    try {
      // Use specific target origin for security
      var targetOrigin = 'https://form-carshipperguy.replit.app';
      
      iframe.contentWindow.postMessage({
        type: 'ATTRIBUTION_DATA',
        params: attributionData
      }, targetOrigin);
      
      console.log('📊 Parent: Successfully sent attribution data to iframe:', attributionData);
      console.log('📊 Parent: Target origin:', targetOrigin);
    } catch (error) {
      console.error('📊 Parent: Error sending to iframe:', error);
    }
  } else {
    console.log('📊 Parent: iframe not found, will retry...');
  }
}

// Send data immediately and then retry
sendAttributionToIframe();

// Send data when page loads
window.addEventListener('load', sendAttributionToIframe);

// Also send when DOM is ready (in case load already fired)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', sendAttributionToIframe);
}

// Listen for iframe load events and send data then too
window.addEventListener('message', function(event) {
  // Only accept messages from the iframe domain
  if (event.origin !== 'https://form-carshipperguy.replit.app') {
    return;
  }
  
  if (event.data && event.data.type === 'IFRAME_READY') {
    console.log('📊 Parent: iframe reports ready, sending attribution data...');
    sendAttributionToIframe();
    return;
  }
  
  // Listen for attribution requests from iframe
  if (event.data && event.data.type === 'REQUEST_ATTRIBUTION_DATA') {
    var urlParams = new URLSearchParams(window.location.search);
    
    var attributionData = {
      fbclid: urlParams.get('fbclid'),
      utm_source: urlParams.get('utm_source'),
      utm_medium: urlParams.get('utm_medium'),
      utm_campaign: urlParams.get('utm_campaign'), 
      utm_content: urlParams.get('utm_content'),
      utm_term: urlParams.get('utm_term'),
      referrer: document.referrer
    };
    
    try {
      event.source.postMessage({
        type: 'ATTRIBUTION_DATA',
        params: attributionData
      }, 'https://form-carshipperguy.replit.app');
      
      console.log('📊 Parent: Responded to attribution request:', attributionData);
    } catch (error) {
      console.error('📊 Parent: Error responding to attribution request:', error);
    }
  }
});

// Aggressive retry sending data for the first 15 seconds
var retryCount = 0;
var retryInterval = setInterval(function() {
  retryCount++;
  
  if (retryCount > 15) {
    clearInterval(retryInterval);
    console.log("Edward - Fixed Parent Script!!!");
    console.log('📊 Parent: Stopped retrying after 15 attempts');
    console.log("Edward - Fixed Parent Script!!!");

    return;
  }
  
  var iframe = document.querySelector('iframe[src*="form-carshipperguy"]') || 
               document.querySelector('iframe[src*="replit"]') ||
               document.querySelector('iframe');
               
  if (iframe && iframe.contentWindow) {
    sendAttributionToIframe();
  }
}, 1000);