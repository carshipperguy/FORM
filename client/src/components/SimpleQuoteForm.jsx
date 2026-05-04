import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import {
  vehicleTypes,
  years,
  makes,
  modelsByMake,
  newMakesWithFreeTextModels,
} from "@/lib/vehicle-data";
import LocationMenuSelector from "./LocationMenuSelector";
import { getCurrentSessionId } from "@/lib/attribution-tracker";
import { trackEvent as logEvent } from "@/lib/track-event";
// CSS module import removed - reverting to inline styles

const SimpleQuoteForm = () => {
  const [, navigate] = useLocation();

  // Helper function to get cookie value
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  };

  const [formData, setFormData] = useState({
    pickupLocation: "",
    dropoffLocation: "",
    vehicleType: localStorage.getItem('selectedVehicleType') || "",
    year: "",
    make: "",
    model: "",
    shipmentDate: "",
    name: "",
    phone: "",
    email: "",
  });

  const [showContactFields, setShowContactFields] = useState(false);
  const [availableModels, setAvailableModels] = useState([]);
  const [isStandardVehicle, setIsStandardVehicle] = useState(false);

  // 🔥 CRITICAL FIX: Persistent attribution state management
  const [attributionData, setAttributionData] = useState({
    fbclid: null,
    utm_source: null,
    utm_medium: null,
    utm_campaign: null,
    utm_term: null,
    utm_content: null,
    referrer: "",
  });

  // Determine if vehicle type is a standard car/truck/SUV
  useEffect(() => {
    // Only the "car/truck/suv" type should use dropdown menus
    const standardType = formData.vehicleType === "car/truck/suv";
    setIsStandardVehicle(standardType);

  }, [formData.vehicleType]);

  // Show contact fields when shipment date is selected
  useEffect(() => {
    if (formData.shipmentDate) {
      setShowContactFields(true);
      // PASSIVE TRACKING — guard ensures this fires at most once per session
      if (!contactFieldsShownFired.current) {
        contactFieldsShownFired.current = true;
        logEvent("contact_fields_shown", {
          vehicleType: formData.vehicleType,
          shipmentDate: formData.shipmentDate,
        });
      }
    } else {
      setShowContactFields(false);
    }
  }, [formData.shipmentDate]);

  // Partial lead capture — 2s debounce fires when user pauses typing in phone field
  useEffect(() => {
    if (phoneDebounceRef.current) {
      clearTimeout(phoneDebounceRef.current);
    }
    phoneDebounceRef.current = setTimeout(() => {
      sendPartialLead();
    }, 2000);
    return () => {
      if (phoneDebounceRef.current) clearTimeout(phoneDebounceRef.current);
    };
  }, [formData.phone]);

  // Get available models for standard vehicles
  useEffect(() => {
    if (isStandardVehicle && formData.make) {
      setAvailableModels(modelsByMake[formData.make] || []);
    } else {
      setAvailableModels([]);
    }
  }, [formData.make, isStandardVehicle]);

  // Initialize and persist attribution data on page load
  useEffect(() => {
    // Attempt to access parent URL (will fail cross-origin; safe to ignore)
    try {
      if (window.parent && window.parent !== window) {
        // access attempt only; no-op
        // eslint-disable-next-line no-unused-vars
        const _ = window.parent.location.href;
      } else {
        
      }
    } catch (error) {
      
    }

    // Helper function to extract URL parameter
    const getUrlParameter = (name, url = window.location.href) => {
      const urlParams = new URLSearchParams(new URL(url).search);
      return urlParams.get(name);
    };

    // Initialize attribution data from current URL
    const initialAttributionData = {
      fbclid: getUrlParameter("fbclid"),
      utm_source: getUrlParameter("utm_source"),
      utm_medium: getUrlParameter("utm_medium"),
      utm_campaign: getUrlParameter("utm_campaign"),
      utm_term: getUrlParameter("utm_term"),
      utm_content: getUrlParameter("utm_content"),
      referrer: document.referrer || "",
    };

    

    // Set the initial attribution data
    setAttributionData(initialAttributionData);

    // PASSIVE TRACKING — fire-and-forget, zero impact on form
    logEvent("form_loaded", {
      referrer: initialAttributionData.referrer,
      utm_source: initialAttributionData.utm_source,
      utm_medium: initialAttributionData.utm_medium,
      utm_campaign: initialAttributionData.utm_campaign,
    });

    const retrievedAttributionData = getAttributionData();
    

    // 🔥 LISTEN FOR PARENT UTM DATA via postMessage
    const handleParentMessage = (event) => {
      // Security: verify origin is your website
      if (!event.origin.includes('amerigoautotransport.net')) {
        console.log('❌ Rejected message from unknown origin:', event.origin);
        return;
      }
      
      // Accept both legacy 'ATTRIBUTION_DATA' and current 'AMERIGO_ATTR_RESPONSE'
      if (event.data.type === 'ATTRIBUTION_DATA' || event.data.type === 'AMERIGO_ATTR_RESPONSE') {
        const parentParams = event.data.params || event.data.attribution;
        
        const parentUtmData = {
          fbclid: parentParams.fbclid,
          utm_source: parentParams.utm_source,
          utm_medium: parentParams.utm_medium,
          utm_campaign: parentParams.utm_campaign,
          utm_term: parentParams.utm_term,
          utm_content: parentParams.utm_content,
          referrer: parentParams.referrer || document.referrer
        };
        
        setAttributionData(parentUtmData);
        
        // Store in sessionStorage for other components
        sessionStorage.setItem('parent_attribution_data', JSON.stringify(parentParams));
      }
    };
    
    window.addEventListener('message', handleParentMessage);
    
    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('message', handleParentMessage);
    };
  }, []); // Empty dependency array - only run on mount

  // Check if vehicle year is pre-1990 for free-text model input
  const isVehiclePre1990 = formData.year && parseInt(formData.year) < 1990;

  const handleChange = (e) => {
    const { name, value } = e.target;

    // When vehicle type changes, reset the year, make, and model fields
    if (name === "vehicleType") {
      // Persist vehicle type to localStorage to prevent loss on page refresh
      if (value) {
        localStorage.setItem('selectedVehicleType', value);
      }
      
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        year: "",
        make: "",
        model: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Track ZIP codes separately for each location
  const [pickupZip, setPickupZip] = useState(null);
  const [dropoffZip, setDropoffZip] = useState(null);

  const handleLocationChange = (field, value, zipCode) => {
    console.log(
      `Location changed - Field: ${field}, Value: ${value}, ZIP: ${zipCode}`,
    );

    // Update the form data with the location string
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Store the ZIP code separately
    if (field === "pickupLocation" && zipCode) {
      setPickupZip(zipCode);
    } else if (field === "dropoffLocation" && zipCode) {
      setDropoffZip(zipCode);
    }
  };

  const [validationErrors, setValidationErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const contactFieldsShownFired = useRef(false);
  const partialLeadSentRef = useRef(false);
  const phoneDebounceRef = useRef(null);

  const sendPartialLead = () => {
    try {
      if (partialLeadSentRef.current) return;
      const digits = (formData.phone || "").replace(/\D/g, "");
      if (digits.length < 7) return;
      partialLeadSentRef.current = true;
      const sessionId = typeof getCurrentSessionId === "function" ? getCurrentSessionId() : null;
      fetch("/api/partial-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name || null,
          phone: digits,
          email: formData.email || null,
          vehicleType: formData.vehicleType || null,
          session_id: sessionId,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // swallow all errors — never affects form
    }
  };

  const handlePhoneBlur = () => {
    if (phoneDebounceRef.current) {
      clearTimeout(phoneDebounceRef.current);
      phoneDebounceRef.current = null;
    }
    sendPartialLead();
  };

  // Client-side validation before submission
  const validateForm = () => {
    // Simplified validation of only required fields
    const errors = [];

    // Validate pickup location (text required; ZIP not required)
    if (!formData.pickupLocation) {
      errors.push({
        field: "pickupLocation",
        message: "Please enter a pickup location",
      });
    }

    // Validate dropoff location (text required; ZIP not required)
    if (!formData.dropoffLocation) {
      errors.push({
        field: "dropoffLocation",
        message: "Please enter a delivery location",
      });
    }

    // Vehicle information validation
    if (!formData.vehicleType) {
      errors.push({
        field: "vehicleType",
        message: "Please select a vehicle type",
      });
    }

    if (!formData.year) {
      errors.push({
        field: "year",
        message: "Please enter the vehicle year",
      });
    }

    if (!formData.make) {
      errors.push({
        field: "make",
        message: "Please enter the vehicle make",
      });
    }

    if (!formData.model) {
      errors.push({
        field: "model",
        message: "Please enter the vehicle model",
      });
    }

    // Shipment date validation
    if (!formData.shipmentDate) {
      errors.push({
        field: "shipmentDate",
        message: "Please select a shipment date",
      });
    }

    // Contact information validation
    if (!formData.name) {
      errors.push({
        field: "name",
        message: "Please enter your name",
      });
    }

    if (!formData.phone) {
      errors.push({
        field: "phone",
        message: "Please enter your phone number",
      });
    }

    if (!formData.email) {
      errors.push({
        field: "email",
        message: "Please enter your email address",
      });
    }

    // Update state with any validation errors
    setValidationErrors(errors);

    // Return true if there are no errors
    return errors.length === 0;
  };

  // Removed duplicate Lead tracking on mount; coordinated tracking handled later

  // Get attribution data from URL and current page
  const getAttributionData = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const currentUrl = window.location.href;

    console.log("📊 Current URL for attribution:", currentUrl);

    const attributionData = {
      fbclid: urlParams.get("fbclid"),
      utm_source: urlParams.get("utm_source"),
      utm_medium: urlParams.get("utm_medium"),
      utm_campaign: urlParams.get("utm_campaign"),
      utm_term: urlParams.get("utm_term"),
      utm_content: urlParams.get("utm_content"),
    };

    console.log("📊 Facebook/Meta attribution parameters:", attributionData);

    return attributionData;
  };

  // Get test event code from URL parameters
  const getTestEventCode = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const testEventCode = urlParams.get("test_event_code");

    if (testEventCode) {
      console.log("🧪 Test event code detected:", testEventCode);
    }

    return testEventCode;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Set submitting state to prevent multiple submissions
    setIsSubmitting(true);

    try {
      // Validate the form before proceeding
      const isValid = validateForm();

      if (!isValid) {
        console.error("Form validation failed:", validationErrors);
        setIsSubmitting(false);
        return;
      }

      // PASSIVE TRACKING — fire-and-forget, not awaited, cannot block submission
      logEvent("submit_clicked", {
        vehicleType: formData.vehicleType,
        pickupLocation: formData.pickupLocation,
        dropoffLocation: formData.dropoffLocation,
      });

      // Get the current domain to handle iframe scenarios
      const currentDomain = window.location.origin;

      // Extract attribution data from persisted state
      const {
        fbclid,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content,
      } = attributionData;

      // Build the complete lead payload for the server
      const leadPayload = {
        ...formData,
        pickupZip: pickupZip,
        dropoffZip: dropoffZip,
        eventType: "quote_submission",
        eventDate: new Date().toISOString(),
        fbclid: fbclid || null,
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        utm_term: utm_term || null,
        utm_content: utm_content || null,
        referrer: attributionData.referrer || "",
        session_id: getCurrentSessionId(),
        sessionId: getCurrentSessionId(),
        meta_capi_data: {
          event_name: "Lead",
          event_time: Math.floor(Date.now() / 1000),
          user_data: {
            em: formData.email ? formData.email.toLowerCase().trim() : null,
            ph: formData.phone ? formData.phone.replace(/\D/g, "") : null,
            client_ip_address: null,
            client_user_agent: navigator.userAgent,
            fbc: fbclid ? `fb.1.${Date.now()}.${fbclid}` : null,
            fbp: getCookie("_fbp") || null,
          },
          custom_data: {
            content_name: "Auto Transport Quote",
            content_category: "Auto Transport",
            value: 0,
            currency: "USD",
            pickup_location: formData.pickupLocation,
            dropoff_location: formData.dropoffLocation,
            vehicle_type: formData.vehicleType,
            vehicle_year: formData.year,
            vehicle_make: formData.make,
            vehicle_model: formData.model,
          },
        },
      };

      // Single server call — handles MapQuest (8s timeout), DB save, and Zapier
      console.log("⚡ Submitting lead to /api/submit-lead...");
      const submitResponse = await fetch(`${currentDomain}/api/submit-lead`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        credentials: "include",
        body: JSON.stringify(leadPayload),
        signal: typeof AbortSignal?.timeout === "function" ? AbortSignal.timeout(45000) : undefined,
        keepalive: true,
      });

      const submitResult = await submitResponse.json();
      console.log("⚡ /api/submit-lead response:", submitResult);

      // Build quoteData from server response
      let quoteData;
      if (submitResult.mapquestSuccess) {
        quoteData = {
          ...formData,
          pickupZip: pickupZip,
          dropoffZip: dropoffZip,
          openTransportPrice: submitResult.openTransportPrice,
          enclosedTransportPrice: submitResult.enclosedTransportPrice,
          transitTime: submitResult.transitTime,
          distance: submitResult.distance,
          priceUnavailable: false,
        };

        // Fire Meta tracking for successful quotes
        try {
          const { trackEvent, generateEventId } = await import("@/lib/attribution-tracker");
          const eventId = generateEventId("Lead");
          trackEvent("Lead", {
            content_name: "Auto Transport Quote Submission",
            content_category: "Auto Transport",
            value: submitResult.openTransportPrice,
            currency: "USD",
          });
          await sendGetQuoteEvent(quoteData, formData, eventId);
        } catch (getQuoteError) {
          console.error("❌ GetQuote: Failed to send Lead event:", getQuoteError);
        }

        // PASSIVE TRACKING — outside Meta try/catch; not awaited; cannot block navigation
        logEvent("submit_success", {
          mapquestSuccess: true,
          openTransportPrice: submitResult.openTransportPrice,
          vehicleType: formData.vehicleType,
        });
      } else {
        // MapQuest failed — lead is still captured; show "we'll call you" screen
        quoteData = {
          ...formData,
          pickupZip: pickupZip,
          dropoffZip: dropoffZip,
          openTransportPrice: 0,
          enclosedTransportPrice: 0,
          transitTime: 0,
          distance: 0,
          priceUnavailable: true,
        };

        // PASSIVE TRACKING — fire-and-forget, not awaited, lead already captured in DB + Zapier
        logEvent("mapquest_failed", {
          vehicleType: formData.vehicleType,
          pickupLocation: formData.pickupLocation,
          dropoffLocation: formData.dropoffLocation,
        });
      }

      // Add attribution to quoteData for the next page
      const quoteDataWithAttribution = {
        ...quoteData,
        fbclid: fbclid || null,
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        utm_term: utm_term || null,
        utm_content: utm_content || null,
        referrer: attributionData.referrer || "",
      };

      // 🔧 STORAGE CAPABILITY DETECTION: Test if sessionStorage is available
      // This prevents infinite loops on privacy browsers (iOS Safari Private, Firefox Strict, etc.)
      const isStorageAvailable = () => {
        try {
          const testKey = '__storage_test__';
          sessionStorage.setItem(testKey, 'test');
          sessionStorage.removeItem(testKey);
          return true;
        } catch (e) {
          console.warn('⚠️ SessionStorage blocked or unavailable:', e.name);
          return false;
        }
      };

      // Store data in sessionStorage to avoid PII in URL
      // 🔧 FALLBACK MECHANISM: Use URL params if storage is blocked
      let useUrlFallback = false;
      
      if (isStorageAvailable()) {
        // Storage available - use sessionStorage (preferred method)
        try {
          // 🔍 CRITICAL DIAGNOSTIC: Verify distance before storing in sessionStorage
          console.log("🔍 DISTANCE BEING STORED IN SESSIONSTORAGE:", quoteDataWithAttribution.distance);
          console.log("🔍 PRICES BEING STORED IN SESSIONSTORAGE:", {
            openTransportPrice: quoteDataWithAttribution.openTransportPrice,
            enclosedTransportPrice: quoteDataWithAttribution.enclosedTransportPrice
          });
          
          // 🔬 FORENSIC TRACE POINT 3
          console.log("═══════════════════════════════════════");
          console.log("🔬 FORENSIC TRACE - SESSION STORAGE");
          console.log("[DISTANCE] miles:", quoteDataWithAttribution.distance);
          console.log("[SESSION] openTransport:", quoteDataWithAttribution.openTransportPrice);
          console.log("[SESSION] enclosed:", quoteDataWithAttribution.enclosedTransportPrice);
          console.log("═══════════════════════════════════════");
          
          sessionStorage.setItem('quote_data', JSON.stringify(quoteDataWithAttribution));
        } catch (e) {
          console.warn('⚠️ SessionStorage write failed, falling back to URL params:', e);
          useUrlFallback = true;
        }
      } else {
        // Storage blocked - must use URL fallback
        console.log('📋 Using URL fallback (sessionStorage unavailable)');
        useUrlFallback = true;
      }

      // Reset submission state before navigating
      setIsSubmitting(false);

      // Navigate to the final quote page (with URL fallback if storage blocked)
      if (useUrlFallback) {
        const encoded = encodeURIComponent(JSON.stringify(quoteDataWithAttribution));
        navigate(`/final-quote?data=${encoded}`);
      } else {
        navigate(`/final-quote`);
      }
    } catch (error) {
      // PASSIVE TRACKING — first line in catch; logEvent is synchronous-safe; cannot rethrow
      logEvent("client_timeout_triggered", {
        error_name: error?.name || "UnknownError",
        error_message: error?.message || String(error),
        is_abort: error?.name === "AbortError",
        is_type_error: error?.name === "TypeError",
        is_compat_error: error?.name === "TypeError" && typeof AbortSignal?.timeout !== "function",
        vehicleType: formData.vehicleType,
      });
      console.error("Error in form submission:", error);
      setIsSubmitting(false);
      alert("There was an error processing your request. Please try again.");
    }
  };

  return (
    <div className="simple-form-container">
      <form onSubmit={handleSubmit} className="fade-in">

        <div className="form-section">
          <div className="form-header">
            <h2>Origin & Destination</h2>
          </div>
          <div className="form-fields">
            <div className="form-field">
              <LocationMenuSelector
                value={formData.pickupLocation}
                onChange={(value, zipCode) =>
                  handleLocationChange("pickupLocation", value, zipCode)
                }
                placeholder="Ship From"
                required
              />
            </div>
            <div className="form-field">
              <LocationMenuSelector
                value={formData.dropoffLocation}
                onChange={(value, zipCode) =>
                  handleLocationChange("dropoffLocation", value, zipCode)
                }
                placeholder="Ship To"
                required
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-header">
            <h2>Vehicle Details</h2>
          </div>
          <div className="form-fields">
            <div className="form-field">
              <select
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                required
              >
                <option value="">What Would You Like To Ship?</option>
                {vehicleTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            {isStandardVehicle ? (
              // Dropdown menus for standard vehicles (car/truck/SUV)
              <>
                <div className="form-field">
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  <select
                    name="make"
                    value={formData.make}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Make</option>
                    {makes.map((make) => (
                      <option key={make} value={make}>
                        {make}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-field">
                  {(formData.make &&
                    newMakesWithFreeTextModels.includes(formData.make)) ||
                  isVehiclePre1990 ? (
                    // Free text input for new makes or pre-1990 vehicles
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      placeholder="Model"
                      required
                    />
                  ) : (
                    // Dropdown for original makes of 1990+ vehicles
                    <select
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      required
                      disabled={!formData.make}
                    >
                      <option value="">Model</option>
                      {availableModels.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </>
            ) : (
              // Free text inputs for non-standard vehicles (anything else)
              <>
                <div className="form-field">
                  <input
                    type="text"
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    placeholder="Year"
                    required
                  />
                </div>
                <div className="form-field">
                  <input
                    type="text"
                    name="make"
                    value={formData.make}
                    onChange={handleChange}
                    placeholder="Make"
                    required
                  />
                </div>
                <div className="form-field">
                  <input
                    type="text"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="Model"
                    required
                  />
                </div>
              </>
            )}
          </div>
        </div>

        <div className="form-section">
          <div className="form-header">
            <h2>Shipment Details</h2>
          </div>
          <div className="form-fields">
            <div
              className="form-field date-field"
              onClick={() => {
                const dateInput = document.getElementById("shipmentDateInput");
                if (dateInput) dateInput.focus();
              }}
            >
              <input
                id="shipmentDateInput"
                type="date"
                name="shipmentDate"
                value={formData.shipmentDate}
                onChange={handleChange}
                required
                min={new Date().toISOString().split("T")[0]}
                placeholder="MM-DD-YY"
                style={{ width: "100%", cursor: "pointer" }}
              />
            </div>
            {formData.shipmentDate && (
              <>
                <div className="form-field">
                  <input
                    type="text"
                    name="name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    placeholder="Your Name"
                    required
                  />
                </div>
                <div className="form-field">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    onBlur={handlePhoneBlur}
                    placeholder="Phone Number"
                    required
                  />
                </div>
                <div className="form-field">
                  <input
                    type="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleChange}
                    placeholder="Email Address"
                    required
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {validationErrors.length > 0 && (
          <div className="validation-errors">
            <div className="error-header">Please fix the following errors:</div>
            <ul>
              {validationErrors.map((error, index) => (
                <li key={index}>{error.message}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="submit"
          className="submit-btn"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? "Calculating Quote..." : "Get Quote"}
        </button>
      </form>

      <style>{`
        .validation-errors {
          margin: 15px 0;
          padding: 12px;
          background-color: #fee2e2;
          border-left: 4px solid #ef4444;
          border-radius: 0 3px 3px 0;
          color: #b91c1c;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          animation: fadeInError 0.3s ease;
        }

        @keyframes fadeInError {
          from { 
            opacity: 0;
            transform: translateY(-5px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        .error-header {
          font-weight: bold;
          margin-bottom: 5px;
          display: flex;
          align-items: center;
        }

        .error-header::before {
          content: "⚠️";
          margin-right: 6px;
          font-size: 14px;
        }

        .validation-errors ul {
          margin: 0;
          padding-left: 20px;
        }

        .validation-errors li {
          margin: 3px 0;
          font-size: 13px;
          line-height: 1.4;
        }

        .submit-btn:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
          position: relative;
        }

        .submit-btn[aria-busy="true"] {
          padding-left: 35px;
        }

        .submit-btn[aria-busy="true"]::before {
          content: "";
          position: absolute;
          left: 15px;
          top: 50%;
          width: 16px;
          height: 16px;
          margin-top: -8px;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.5);
          border-top-color: white;
          animation: button-loading-spinner 0.6s linear infinite;
        }

        @keyframes button-loading-spinner {
          from {
            transform: rotate(0turn);
          }
          to {
            transform: rotate(1turn);
          }
        }

        .fade-in {
          opacity: 0;
          transform: translateY(10px);
          animation: fadeInForm 0.5s ease-out forwards;
        }

        @keyframes fadeInForm {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .simple-form-container {
          width: 100%;
          max-width: 100%;
          margin: 0 auto;
          font-family: Arial, sans-serif;
          background-color: #F9FAFB;
          padding: 0;
        }

        .form-section {
          margin-bottom: 2px;
          border: 1px solid #E5E7EB;
          border-bottom: none;
        }

        .form-section:last-of-type {
          margin-bottom: 0;
          border-bottom: 1px solid #E5E7EB;
        }

        .form-header {
          background-color: #002C42;
          color: white;
          padding: 10px 10px;
          font-weight: 500;
        }

        .form-header h2 {
          margin: 0;
          font-size: 15px;
          font-weight: 500;
        }

        .form-fields {
          padding: 8px;
          background-color: white;
        }

        .form-field {
          margin-bottom: 8px;
          transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
        }

        .form-field:last-child {
          margin-bottom: 0;
        }

        .form-field {
          transition: opacity 0.3s ease, transform 0.3s ease, height 0.3s ease, margin 0.3s ease;
        }

        .form-field.hidden {
          opacity: 0;
          transform: translateY(-10px);
          height: 0;
          margin: 0;
          overflow: hidden;
        }

        .form-field input,
        .form-field select {
          width: 100%;
          padding: 10px;
          border: 1px solid #E5E7EB;
          border-radius: 0;
          font-size: 14px;
          color: #718096;
          box-shadow: none;
          height: 40px;
          box-sizing: border-box;
          -webkit-appearance: none;
          transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
        }

        .form-field input:focus,
        .form-field select:focus {
          outline: none;
          border-color: #0055FF;
          box-shadow: 0 0 0 1px rgba(0, 85, 255, 0.2);
        }

        .form-field input:hover:not(:focus),
        .form-field select:hover:not(:focus) {
          border-color: #D1D5DB;
        }

        .form-field select {
          background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E");
          background-position: right 10px center;
          background-repeat: no-repeat;
          background-size: 20px 20px;
          padding-right: 30px;
          cursor: pointer;
        }

        .location-field [role="combobox"] {
          width: 100%;
          height: 40px;
          border: 1px solid #E5E7EB;
          border-radius: 0;
          font-size: 14px;
          display: flex;
          align-items: center;
          background-color: white;
          color: #718096;
          padding: 10px;
          box-sizing: border-box;
        }

        .submit-btn {
          width: 100%;
          padding: 0;
          background-color: #002C42;
          color: white;
          border: none;
          border-radius: 3px;
          font-weight: 500;
          cursor: pointer;
          font-size: 16px;
          margin-top: 10px;
          height: 44px;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }

        .submit-btn:hover {
          background-color: #003b59;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .submit-btn:active {
          transform: translateY(0);
          box-shadow: none;
        }

        /* Always use mobile styling regardless of device (for iframe) */
        .simple-form-container {
          width: 308px !important;
          max-width: 308px !important;
        }

        /* Override date input appearance to look like the screenshot */
        input[type="date"]::-webkit-calendar-picker-indicator {
          position: absolute;
          right: 10px;
        }

        /* Match the exact placeholders from the screenshot */
        .form-field input::placeholder {
          color: #a0aec0;
        }

        /* Make the date field clickable */
        .form-field.date-field {
          position: relative;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

/**
 * Send GetQuote (Lead) event to Meta CAPI
 */
async function sendGetQuoteEvent(quoteData, formData, eventId) {
  // Get current session ID for attribution
  const sessionId = getCurrentSessionId();

  if (!sessionId) {
    console.warn("⚠️ GetQuote: No session ID available for CAPI event");
    return;
  }

  console.log("📊 GetQuote: Sending Lead event to Meta CAPI...");

  const metaCapiUrl =
    `${import.meta.env.VITE_FORM_APP_DOMAIN || 'https://form-carshipperguy.replit.app'}/api/v1/meta-capi/event`;

  // Read _fbp cookie if available
  const fbpCookieMatch = typeof document !== 'undefined'
    ? document.cookie.match(/(?:^|; )_fbp=([^;]+)/)
    : null;
  const fbpCookie = fbpCookieMatch ? fbpCookieMatch[1] : undefined;

  const eventData = {
    eventName: "Lead",
    eventId: eventId, // Add event ID for Pixel+CAPI deduplication
    eventData: {
      event_source_url: window.location.href,
      event_id: eventId, // Include in event data for deduplication
      action_source: "website",
      custom_data: {
        content_name: "Auto Transport Quote",
        content_category: "Auto Transport",
        value: quoteData.openTransportPrice || 0,
        currency: "USD",
        pickup_location: formData.pickupLocation,
        dropoff_location: formData.dropoffLocation,
        vehicle_type: formData.vehicleType,
        vehicle_year: formData.year,
        vehicle_make: formData.make,
        vehicle_model: formData.model,
        distance: quoteData.distance,
        session_id: sessionId,
      },
    },
    userData: {
      email: formData.email,
      phone: formData.phone ? formData.phone.replace(/\D/g, "") : undefined,
      first_name: formData.name ? formData.name.split(" ")[0] : undefined,
      last_name: formData.name
        ? formData.name.split(" ").slice(1).join(" ")
        : undefined,
      client_user_agent: navigator.userAgent,
      // Improve match quality
      external_id: sessionId || undefined,
      fbp: fbpCookie,
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
        `GetQuote event failed: ${response.status} ${response.statusText}`,
      );
    }

    console.log("✅ GetQuote: Lead event sent successfully");
    // Some gateways return HTML; only parse JSON if provided
    const ct = response.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      return await response.json();
    }
    return null;
  } catch (error) {
    console.error("❌ GetQuote: Lead event failed:", error);
    throw error;
  }
}

export default SimpleQuoteForm;
