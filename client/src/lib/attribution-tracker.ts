/**
 * Attribution Tracker
 *
 * This module handles client-side attribution tracking for the Meta CAPI system.
 * It captures UTM parameters, fbclid, generates session IDs, and sends the data
 * to the CRM app for storage and later use in event tracking.
 *
 * Features:
 * - Automatic UTM parameter extraction from URL
 * - Facebook click ID (fbclid) capture
 * - Session ID generation and persistence
 * - Cross-domain tracking support
 * - Error handling and retry logic
 */

interface AttributionData {
  sessionId: string;
  fbclid?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  sourceUrl?: string;
  fbp?: string; // Facebook browser ID
  fbc?: string; // Facebook click ID (derived from fbclid)
}

interface AttributionConfig {
  crmApiUrl: string;
  retryAttempts: number;
  retryDelay: number;
  sessionStorageKey: string;
}

const defaultConfig: AttributionConfig = {
  crmApiUrl:
    `https://${import.meta.env.VITE_CRM_DOMAIN || 'amerigoautotransport.replit.app'}/api/v1/tracking/session`,
  retryAttempts: 3,
  retryDelay: 1000,
  sessionStorageKey: "amerigo_session_id",
};

/**
 * Generate a unique session ID
 * Format: timestamp_randomString
 */
function generateSessionId(): string {
  const timestamp = Date.now();
  const randomPart = Math.random().toString(36).substring(2, 12);
  return `${timestamp}_${randomPart}`;
}

/**
 * Get or create a session ID
 * Uses sessionStorage to persist the session ID during the browser session
 */
function getOrCreateSessionId(config: AttributionConfig): string {
  try {
    // Try to get existing session ID from sessionStorage
    const existingSessionId = sessionStorage.getItem(config.sessionStorageKey);

    if (existingSessionId) {
      return existingSessionId;
    }
  } catch (error) {
    console.warn("⚠️ Attribution: SessionStorage not available:", error);
  }

  // Generate new session ID
  const newSessionId = generateSessionId();

  try {
    // Store in sessionStorage for future use
    sessionStorage.setItem(config.sessionStorageKey, newSessionId);
  } catch (error) {
    console.warn("⚠️ Attribution: Could not store session ID:", error);
  }

  return newSessionId;
}

/**
 * Extract URL parameter value
 */
function getUrlParameter(name: string, url?: string): string | undefined {
  const searchUrl = url || window.location.href;
  const urlParams = new URLSearchParams(new URL(searchUrl).search);
  return urlParams.get(name) || undefined;
}

/**
 * Extract attribution data with safe parent page communication
 * Falls back to iframe URL if parent data not available
 */
function extractAttributionData(sessionId: string): AttributionData {
  let sourceUrl = window.location.href;
  
  let parentData: Record<string, any> = {};

  

  // Check for parent attribution data in sessionStorage (from postMessage)
  try {
    const storedParentData = sessionStorage.getItem("parent_attribution_data");
    if (storedParentData) {
      parentData = JSON.parse(storedParentData);
    }
  } catch (error) {
    // Silent fallback to iframe-only data
  }

  // If in iframe and no stored parent data, try to access parent URL for sourceUrl
  if (Object.keys(parentData).length === 0 && window.parent && window.parent !== window) {
    try {
      sourceUrl = window.parent.location.href;
    } catch (crossOriginError) {
      // Cross-origin restriction - use iframe URL
    }
  }

  // Extract attribution data (prefer parent data, fallback to iframe URL)
  const fbclid = parentData.fbclid || getUrlParameter("fbclid");
  const attribution: AttributionData = {
    sessionId,
    fbclid: fbclid,
    utmSource: parentData.utm_source || getUrlParameter("utm_source"),
    utmMedium: parentData.utm_medium || getUrlParameter("utm_medium"),
    utmCampaign: parentData.utm_campaign || getUrlParameter("utm_campaign"),
    utmContent: parentData.utm_content || getUrlParameter("utm_content"),
    utmTerm: parentData.utm_term || getUrlParameter("utm_term"),
    sourceUrl: sourceUrl,
    fbp: parentData.fbp, // Facebook browser ID from parent
    fbc: fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined, // Generate fbc from fbclid
  };

  return attribution;
}

/**
 * Send attribution data to CRM API with retry logic
 */
async function sendAttributionData(
  attribution: AttributionData,
  config: AttributionConfig,
): Promise<boolean> {

  for (let attempt = 1; attempt <= config.retryAttempts; attempt++) {
    try {
      const response = await fetch(config.crmApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(attribution),
        // Add timeout to prevent hanging requests
        signal: typeof AbortSignal?.timeout === "function" ? AbortSignal.timeout(10000) : undefined,
      });

      if (response.ok) {
        const result = await response.json();

        // Send PageView event to Meta CAPI after successful attribution tracking
        try {
          await sendPageViewEvent(attribution, config.crmApiUrl);
        } catch (pageViewError) {
          console.error(
            "❌ Attribution: Failed to send PageView event:",
            pageViewError,
          );
          // Don't fail attribution tracking if PageView fails
        }

        return true;
      } else {
        console.error(
          `❌ Attribution: API returned ${response.status}: ${response.statusText}`,
        );

        if (response.status >= 400 && response.status < 500) {
          // Client error - don't retry
          console.error("❌ Attribution: Client error, not retrying");
          return false;
        }
      }
    } catch (error) {
      console.error(`❌ Attribution: Attempt ${attempt} failed:`, error);

      if (attempt === config.retryAttempts) {
        console.error("❌ Attribution: All retry attempts failed");
        return false;
      }

      // Wait before retrying
      await new Promise((resolve) =>
        setTimeout(resolve, config.retryDelay * attempt),
      );
    }
  }

  return false;
}

/**
 * Initialize attribution tracking
 * This function should be called on every page load
 */
export async function initializeAttribution(
  customConfig?: Partial<AttributionConfig>,
): Promise<string> {

  const config = { ...defaultConfig, ...customConfig };

  try {
    // Get or create session ID
    const sessionId = getOrCreateSessionId(config);

    // ALWAYS try to request attribution from parent (production fix)
    // Even if iframe detection fails, attempt communication
    try {
      window.parent.postMessage({
        type: "AMERIGO_ATTR_REQUEST",
        sessionId: sessionId,
        sourceUrl: window.location.href
      }, "*");
      
      
      // Wait for parent response
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.log("⚠️ Parent communication failed (normal if not in iframe):", error);
    }

    // Backup: Also check if iframe detection works properly
    
    
    if (window.parent && window.parent !== window) {
      try {
        window.parent.postMessage({
          type: "AMERIGO_ATTR_REQUEST",
          sessionId: sessionId,
          sourceUrl: window.location.href
        }, "*");
        
        // Wait briefly for parent response (non-blocking)
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error("❌ Error requesting attribution from parent:", error);
      }
    } else {
      
    }

    // Extract attribution data (now checks sessionStorage first)
    const attribution = extractAttributionData(sessionId);

    // Send to CRM API
    const success = await sendAttributionData(attribution, config);

    if (success) {
    } else {
    }

    return sessionId;
  } catch (error) {
    console.error("🔥 ATTRIBUTION INIT ERROR:", error);
    console.error("🔥 ERROR STACK:", (error as any)?.stack);
    console.error("🔥 ERROR TYPE:", (error as any)?.constructor?.name);
    console.error("🔥 ERROR MESSAGE:", (error as any)?.message);

    // Re-throw so the browser console surfaces the error visibly
    throw error;
  }
}

/**
 * Get the current session ID without initializing tracking
 * Useful for adding session ID to events
 */
export function getCurrentSessionId(
  config?: Partial<AttributionConfig>,
): string | null {
  const finalConfig = { ...defaultConfig, ...config };

  try {
    return sessionStorage.getItem(finalConfig.sessionStorageKey);
  } catch (error) {
    console.warn(
      "⚠️ Attribution: Could not get session ID from storage:",
      error,
    );
    return null;
  }
}

/**
 * Generate unique event ID for Pixel+CAPI deduplication
 */
export function generateEventId(eventName: string): string {
  const sessionId = getCurrentSessionId() || "no-session";
  return `${sessionId}.${eventName}.${Date.now()}`;
}

/**
 * Track coordinated Pixel+CAPI event with deduplication
 */
export function trackEvent(
  eventName: string,
  eventData?: Record<string, any>,
): void {
  const eventId = generateEventId(eventName);
  
  // Send Pixel event to parent (if in iframe)
  if (window.parent && window.parent !== window) {
    try {
      window.parent.postMessage({
        type: "AMERIGO_PIXEL_EVENT",
        event: eventName,
        eventId: eventId,
        params: eventData || {}
      }, "*");
    } catch (error) {
      // Silent fallback - try direct Pixel call
      if ((window as any).fbq) {
        (window as any).fbq('track', eventName, eventData, { eventID: eventId });
      }
    }
  } else if ((window as any).fbq) {
    // Direct Pixel call if not in iframe
    (window as any).fbq('track', eventName, eventData, { eventID: eventId });
  }
}

/**
 * Configuration for different environments
 */
export const AttributionConfig = {
  development: {
    crmApiUrl: "http://localhost:3001/api/v1/tracking/session",
  },
  staging: {
    crmApiUrl:
      `https://${import.meta.env.VITE_CRM_DOMAIN || 'amerigoautotransport.replit.app'}/api/v1/tracking/session`,
  },
  production: {
    crmApiUrl:
      `https://${import.meta.env.VITE_CRM_DOMAIN || 'amerigoautotransport.replit.app'}/api/v1/tracking/session`,
  },
};

/**
 * Send PageView event to Meta CAPI
 */
async function sendPageViewEvent(
  attribution: AttributionData,
  crmApiUrl: string,
) {
  const metaCapiUrl = crmApiUrl.replace(
    "/tracking/session",
    "/meta-capi/event",
  );

  const eventData = {
    eventName: "PageView",
    eventData: {
      event_source_url: attribution.sourceUrl,
      action_source: "website",
      custom_data: {
        content_name: "Quote Form Page",
        content_category: "auto-transport",
        session_id: attribution.sessionId,
        ...(attribution.utmSource && { utm_source: attribution.utmSource }),
        ...(attribution.utmMedium && { utm_medium: attribution.utmMedium }),
        ...(attribution.utmCampaign && {
          utm_campaign: attribution.utmCampaign,
        }),
        ...(attribution.utmContent && { utm_content: attribution.utmContent }),
        ...(attribution.utmTerm && { utm_term: attribution.utmTerm }),
      },
    },
    userData: {
      client_user_agent: navigator.userAgent,
      ...(attribution.fbclid && { fbc: `fb.1.${Date.now()}.${attribution.fbclid}` }),
      ...(attribution.fbp && { fbp: attribution.fbp }),
    },
  };

  const response = await fetch(metaCapiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventData),
    signal: typeof AbortSignal?.timeout === "function" ? AbortSignal.timeout(10000) : undefined,
  });

  if (!response.ok) {
    throw new Error(
      `PageView event failed: ${response.status} ${response.statusText}`,
    );
  }

  return await response.json();
}

// Safe parent message listener for attribution data
if (typeof window !== "undefined") {
  window.addEventListener("message", (event) => {
    // Validate trusted origins
    const trustedOrigins = [
      "https://amerigoautotransport.net",
      "https://www.amerigoautotransport.net"
    ];
    
    // Allow requests from same origin or trusted origins
    if (event.origin !== window.location.origin && !trustedOrigins.includes(event.origin)) {
      return;
    }

    // Handle attribution response from parent
    if (event.data && event.data.type === "AMERIGO_ATTR_RESPONSE") {
      try {
        sessionStorage.setItem("parent_attribution_data", JSON.stringify(event.data.attribution));
        
        // Re-send attribution with updated data
        const sessionId = getOrCreateSessionId({ ...defaultConfig });
        const attribution = extractAttributionData(sessionId);
        sendAttributionData(attribution, { ...defaultConfig });
      } catch (error) {
        console.error("❌ Error processing parent attribution:", error);
      }
    }
  });
}

// Auto-initialize on script load (can be disabled by setting window.disableAutoAttribution = true)
if (typeof window !== "undefined" && !(window as any).disableAutoAttribution) {
  // Mark that we're initializing
  (window as any).attributionInitialized = true;

  // Initialize on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      initializeAttribution();
    });
  } else {
    // DOM is already ready
    initializeAttribution();
  }
}
