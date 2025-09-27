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

  console.log("📊 Attribution: Generated new session ID:", newSessionId);
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
 * Extract attribution data from sessionStorage first, then URL fallback
 * Supports iframe scenarios where the form is embedded in another page
 */
function extractAttributionData(sessionId: string): AttributionData {
  console.log("📊 Attribution: Extracting attribution data...");

  let sourceUrl = window.location.href;
  let parentParams: Record<string, string> = {};

  // First priority: Check if we have parent attribution data in sessionStorage
  try {
    const storedParentData = sessionStorage.getItem("parent_attribution_data");
    if (storedParentData) {
      try {
        parentParams = JSON.parse(storedParentData);
        console.log(
          "📊 Attribution: Using stored parent attribution data:",
          parentParams,
        );
      } catch (parseError) {
        console.log(
          "📊 Attribution: Error parsing stored parent data:",
          parseError,
        );
      }
    }
  } catch (error) {
    console.log("📊 Attribution: Error accessing sessionStorage:", error);
  }

  // If we don't have parent data and we're in an iframe, try legacy approaches
  if (Object.keys(parentParams).length === 0) {
    try {
      if (window.parent && window.parent !== window) {
        console.log(
          "📊 Attribution: No stored data found, checking iframe context...",
        );

        // Try to read parent URL (may fail due to cross-origin restrictions)
        try {
          sourceUrl = window.parent.location.href;
          console.log(
            "📊 Attribution: Using parent URL for attribution:",
            sourceUrl,
          );
        } catch (crossOriginError) {
          console.log(
            "📊 Attribution: Cannot access parent URL (cross-origin), will use fallback",
          );
        }
      }
    } catch (error) {
      console.log("📊 Attribution: Error checking iframe status:", error);
    }
  }

  // Extract UTM parameters and fbclid (prefer parent data, fallback to current URL)
  const attribution: AttributionData = {
    sessionId,
    fbclid: parentParams.fbclid || getUrlParameter("fbclid", sourceUrl),
    utmSource:
      parentParams.utm_source || getUrlParameter("utm_source", sourceUrl),
    utmMedium:
      parentParams.utm_medium || getUrlParameter("utm_medium", sourceUrl),
    utmCampaign:
      parentParams.utm_campaign || getUrlParameter("utm_campaign", sourceUrl),
    utmContent:
      parentParams.utm_content || getUrlParameter("utm_content", sourceUrl),
    utmTerm: parentParams.utm_term || getUrlParameter("utm_term", sourceUrl),
    sourceUrl: sourceUrl,
  };

  console.log("📊 Attribution: Extracted data:", {
    sessionId: attribution.sessionId,
    hasUtmSource: !!attribution.utmSource,
    hasFbclid: !!attribution.fbclid,
    utmCampaign: attribution.utmCampaign,
    sourceUrl: sourceUrl,
    usedParentData: Object.keys(parentParams).length > 0,
  });

  // Attribution data extracted and stored for internal tracking only

  return attribution;
}

/**
 * Send attribution data to CRM API with retry logic
 */
async function sendAttributionData(
  attribution: AttributionData,
  config: AttributionConfig,
): Promise<boolean> {
  console.log("📊 Attribution: Sending data to CRM API...");

  for (let attempt = 1; attempt <= config.retryAttempts; attempt++) {
    try {
      console.log(`📊 Attribution: Attempt ${attempt}/${config.retryAttempts}`);

      const response = await fetch(config.crmApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(attribution),
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      if (response.ok) {
        const result = await response.json();
        console.log("✅ Attribution: Data sent successfully:", result);

        // Send PageView event to Meta CAPI after successful attribution tracking
        try {
          console.log("📊 Attribution: Sending PageView event to Meta CAPI...");
          await sendPageViewEvent(attribution, config.crmApiUrl);
          console.log("✅ Attribution: PageView event sent successfully");
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

    // No longer request data from parent - work with iframe URL only

    // Extract attribution data (now checks sessionStorage first)
    const attribution = extractAttributionData(sessionId);

    // Send to CRM API
    const success = await sendAttributionData(attribution, config);

    if (success) {
    } else {
    }

    return sessionId;
  } catch (error) {
    console.error("❌ Attribution: Failed to initialize tracking:", error);
    // Return a session ID anyway so the app can continue functioning
    return generateSessionId();
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
 * Track a custom event (to be used with Meta CAPI events)
 * This is a placeholder for future event tracking
 */
export function trackEvent(
  eventName: string,
  eventData?: Record<string, any>,
): void {
  console.log(`📊 Attribution: Event tracked: ${eventName}`, eventData);

  // This will be expanded when we implement the actual Meta CAPI events
  // For now, it just logs the event for debugging
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
      ...(attribution.fbclid && {
        fbc: `fb.1.${Date.now()}.${attribution.fbclid}`,
      }),
    },
  };

  const response = await fetch(metaCapiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventData),
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(
      `PageView event failed: ${response.status} ${response.statusText}`,
    );
  }

  return await response.json();
}

// Parent message listener removed - no longer dependent on parent page

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
