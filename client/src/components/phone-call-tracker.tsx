/**
 * Phone Call Tracker Component
 *
 * This component provides clickable phone number links with Meta CAPI tracking.
 * When a user clicks a phone number, it triggers the PhoneCall event (Contact)
 * and properly tracks the interaction source (icon or popup).
 */

import { Phone } from "lucide-react";
import { getCurrentSessionId } from "@/lib/attribution-tracker";

interface PhoneCallTrackerProps {
  phoneNumber: string;
  displayNumber?: string;
  source: "icon" | "popup" | "text";
  className?: string;
  showIcon?: boolean;
}

/**
 * Track phone call event using Meta Pixel and CAPI
 */
function trackPhoneCall(source: string, phoneNumber: string): void {
  console.log(`📞 PhoneCall: User clicked ${source} for ${phoneNumber}`);

  try {
    // Get current session ID for attribution
    const sessionId = getCurrentSessionId();

    // Track with Meta Pixel (browser-side)
    if (window.fbq) {
      window.fbq("track", "Contact", {
        content_name: "Phone Call",
        content_category: "Contact",
        source: source,
        phone_number: phoneNumber,
        session_id: sessionId,
      });

      console.log("✅ PhoneCall: Meta Pixel event sent");
    } else {
      console.warn("⚠️ PhoneCall: Meta Pixel not available");
    }

    // Send server-side CAPI event
    sendPhoneCallEvent(source, phoneNumber, sessionId).catch((error) => {
      console.error("❌ PhoneCall: Failed to send server-side event:", error);
    });

    // Track with Google Analytics if available
    if (window.gtag) {
      window.gtag("event", "phone_call", {
        event_category: "Contact",
        event_label: source,
        phone_number: phoneNumber,
      });
    }

    // Log for debugging
    console.log(`📊 PhoneCall: Tracked ${source} click for ${phoneNumber}`);
  } catch (error) {
    console.error("❌ PhoneCall: Error tracking call:", error);
  }
}

/**
 * Handle phone click with tracking
 */
function handlePhoneClick(source: string, phoneNumber: string): void {
  // Track the event
  trackPhoneCall(source, phoneNumber);

  // Small delay to ensure tracking fires before potential page navigation
  setTimeout(() => {
    // The browser will handle the tel: link automatically
    console.log(`📞 PhoneCall: Opening dialer for ${phoneNumber}`);
  }, 100);
}

/**
 * PhoneCallTracker Component
 */
export function PhoneCallTracker({
  phoneNumber,
  displayNumber,
  source,
  className = "",
  showIcon = true,
}: PhoneCallTrackerProps): JSX.Element {
  const cleanPhoneNumber = phoneNumber.replace(/\D/g, ""); // Remove non-digits
  const formattedPhone = displayNumber || phoneNumber;

  return (
    <a
      href={`tel:${cleanPhoneNumber}`}
      className={`inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors ${className}`}
      onClick={() => handlePhoneClick(source, phoneNumber)}
      aria-label={`Call ${formattedPhone}`}
    >
      {showIcon && <Phone className="h-4 w-4" />}
      <span>{formattedPhone}</span>
    </a>
  );
}

/**
 * Simple phone icon component
 */
export function PhoneIcon({
  phoneNumber,
  className = "",
  size = "h-6 w-6",
}: {
  phoneNumber: string;
  className?: string;
  size?: string;
}): JSX.Element {
  return (
    <a
      href={`tel:${phoneNumber.replace(/\D/g, "")}`}
      className={`inline-flex items-center justify-center p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-full transition-colors ${className}`}
      onClick={() => handlePhoneClick("icon", phoneNumber)}
      aria-label={`Call ${phoneNumber}`}
    >
      <Phone className={size} />
    </a>
  );
}

/**
 * Contact popup component
 */
export function ContactPopup({
  phoneNumber,
  isOpen,
  onClose,
}: {
  phoneNumber: string;
  isOpen: boolean;
  onClose: () => void;
}): JSX.Element | null {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Call us directly:</p>
            <PhoneCallTracker
              phoneNumber={phoneNumber}
              source="popup"
              className="text-lg font-medium"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Default phone number (can be configured via environment variables)
export const DEFAULT_PHONE_NUMBER = "(954) 671-8923";

/**
 * Send PhoneCall event to Meta CAPI
 */
async function sendPhoneCallEvent(
  source: string,
  phoneNumber: string,
  sessionId: string | null,
): Promise<void> {
  if (!sessionId) {
    console.warn("⚠️ PhoneCall: No session ID available for CAPI event");
    return;
  }

  console.log("📞 PhoneCall: Sending server-side CAPI event...");

  const metaCapiUrl =
    `${import.meta.env.VITE_FORM_APP_DOMAIN || 'https://form-carshipperguy.replit.app'}/api/v1/meta-capi/event`;

  const eventData = {
    eventName: "Contact",
    eventData: {
      event_source_url: window.location.href,
      action_source: "website",
      custom_data: {
        content_name: "Phone Call",
        content_category: "Contact",
        source: source,
        phone_number: phoneNumber,
        session_id: sessionId,
      },
    },
    userData: {
      client_user_agent: navigator.userAgent,
    },
  };

  try {
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
        `PhoneCall event failed: ${response.status} ${response.statusText}`,
      );
    }

    console.log("✅ PhoneCall: Server-side CAPI event sent successfully");
    return await response.json();
  } catch (error) {
    console.error("❌ PhoneCall: Server-side CAPI event failed:", error);
    throw error;
  }
}

// Export hook for easy use in components
export function usePhoneTracking() {
  return {
    trackPhoneCall,
    handlePhoneClick,
    defaultPhone: DEFAULT_PHONE_NUMBER,
  };
}
