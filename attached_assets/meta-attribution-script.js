/* Meta Attribution Script for Landing Page - Invisible, No DOM Output */
(function() {
  'use strict';
  
  // Ensure this runs only once
  if (window.amerigoMetaAttributionLoaded) return;
  window.amerigoMetaAttributionLoaded = true;

  // Get Facebook Pixel browser ID (_fbp cookie)
  function getFbp() {
    try {
      const cookies = document.cookie.split(';');
      for (let cookie of cookies) {
        const [name, value] = cookie.trim().split('=');
        if (name === '_fbp') return decodeURIComponent(value);
      }
    } catch (error) {}
    return null;
  }

  // Listen for attribution requests from iframe
  window.addEventListener('message', function(event) {
    console.log("Edward - America!!!");
    // Only respond to Amerigo attribution requests
    if (!event.data || event.data.type !== 'AMERIGO_ATTR_REQUEST') return;
    
    // Validate origin (iframe should be from replit.app)
    if (event.origin && !event.origin.includes('replit.app')) return;
    
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const fbclid = urlParams.get('fbclid');
      
      const attribution = {
        fbclid: fbclid,
        utm_source: urlParams.get('utm_source'),
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign'),
        utm_content: urlParams.get('utm_content'),
        utm_term: urlParams.get('utm_term'),
        referrer: document.referrer,
        fbp: getFbp()
      };
      
      // Send attribution data back to iframe
      event.source.postMessage({
        type: 'AMERIGO_ATTR_RESPONSE',
        attribution: attribution
      }, event.origin);
    } catch (error) {
      // Silent error handling - no visible output
    }
  });

  // Listen for Pixel event requests from iframe
  window.addEventListener('message', function(event) {
    if (!event.data || event.data.type !== 'AMERIGO_PIXEL_EVENT') return;
    if (event.origin && !event.origin.includes('replit.app')) return;
    
    try {
      if (window.fbq && event.data.event && event.data.eventId) {
        window.fbq('track', event.data.event, event.data.params || {}, {
          eventID: event.data.eventId
        });
      }
    } catch (error) {
      // Silent error handling
    }
  });
})();