/* Safe iframe attribution script - prevents text rendering */
(function() {
  'use strict';
  
  // Ensure this script only runs once
  if (window.attributionScriptLoaded) return;
  window.attributionScriptLoaded = true;

  function sendAttributionToIframe() {
    try {
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
      
      // Find iframe
      var iframe = document.querySelector('iframe[src*="form-carshipperguy"]') || 
                   document.querySelector('iframe[src*="replit"]') ||
                   document.querySelector('iframe');
      
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.postMessage({
          type: 'ATTRIBUTION_DATA',
          params: attributionData
        }, 'https://form-carshipperguy.replit.app');
      }
    } catch (error) {
      // Silent error handling
    }
  }

  // Send data when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', sendAttributionToIframe);
  } else {
    sendAttributionToIframe();
  }

  // Listen for iframe requests
  window.addEventListener('message', function(event) {
    if (event.origin !== 'https://form-carshipperguy.replit.app') return;
    
    if (event.data && event.data.type === 'REQUEST_ATTRIBUTION_DATA') {
      var urlParams = new URLSearchParams(window.location.search);
      
      try {
        event.source.postMessage({
          type: 'ATTRIBUTION_DATA',
          params: {
            fbclid: urlParams.get('fbclid'),
            utm_source: urlParams.get('utm_source'),
            utm_medium: urlParams.get('utm_medium'),
            utm_campaign: urlParams.get('utm_campaign'), 
            utm_content: urlParams.get('utm_content'),
            utm_term: urlParams.get('utm_term'),
            referrer: document.referrer
          }
        }, 'https://form-carshipperguy.replit.app');
      } catch (error) {
        // Silent error handling
      }
    }
  });
})();