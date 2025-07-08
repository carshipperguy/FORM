import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  vehicleTypes,
  years,
  makes,
  modelsByMake,
  newMakesWithFreeTextModels,
} from "@/lib/vehicle-data";
import { calculatePrice } from "@/lib/pricing";
import LocationMenuSelector from "./LocationMenuSelector";
// CSS module import removed - reverting to inline styles

const SimpleQuoteForm = () => {
  const [, navigate] = useLocation();

  const [formData, setFormData] = useState({
    pickupLocation: "",
    dropoffLocation: "",
    vehicleType: "",
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

  // Determine if vehicle type is a standard car/truck/SUV
  useEffect(() => {
    // Only the "car/truck/suv" type should use dropdown menus
    const standardType = formData.vehicleType === "car/truck/suv";
    setIsStandardVehicle(standardType);

    console.log("Vehicle type changed:", formData.vehicleType);
    console.log("Is standard vehicle:", standardType);
  }, [formData.vehicleType]);

  // Show contact fields when shipment date is selected
  useEffect(() => {
    if (formData.shipmentDate) {
      setShowContactFields(true);
    } else {
      setShowContactFields(false);
    }
  }, [formData.shipmentDate]);

  // Get available models for standard vehicles
  useEffect(() => {
    if (isStandardVehicle && formData.make) {
      setAvailableModels(modelsByMake[formData.make] || []);
    } else {
      setAvailableModels([]);
    }
  }, [formData.make, isStandardVehicle]);

  // Check if vehicle year is pre-1990 for free-text model input
  const isVehiclePre1990 = formData.year && parseInt(formData.year) < 1990;

  const handleChange = (e) => {
    const { name, value } = e.target;

    // When vehicle type changes, reset the year, make, and model fields
    if (name === "vehicleType") {
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

  // Client-side validation before submission
  const validateForm = () => {
    // Simplified validation of only required fields
    const errors = [];

    // Validate pickup location (must come from dropdown to have ZIP)
    if (!formData.pickupLocation || !pickupZip) {
      errors.push({
        field: "pickupLocation",
        message: "Please select a pickup location from the dropdown menu",
      });
    }

    // Validate dropoff location (must come from dropdown to have ZIP)
    if (!formData.dropoffLocation || !dropoffZip) {
      errors.push({
        field: "dropoffLocation",
        message: "Please select a delivery location from the dropdown menu",
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

      // Calculate real distance using the server API
      // Get the current domain to handle iframe scenarios
      const currentDomain = window.location.origin;

      // Use the full URL to avoid issues when embedded in an iframe
      const serverDistanceUrl = `${currentDomain}/api/distance?origin=${encodeURIComponent(formData.pickupLocation)}&destination=${encodeURIComponent(formData.dropoffLocation)}`;
      console.log(
        "Calculating real distance using server API:",
        serverDistanceUrl,
      );

      const distanceResponse = await fetch(serverDistanceUrl, {
        // Include credentials to ensure cookies are sent even for cross-origin requests
        credentials: "include",
      });
      const distanceData = await distanceResponse.json();

      if (distanceData.error) {
        console.error("Error calculating distance:", distanceData.error);
        alert(
          "There was an error calculating the distance. Please check your locations and try again.",
        );
        setIsSubmitting(false);
        return;
      }

      console.log("Distance calculation result:", distanceData);

      // Use the imported pricing calculation function

      // Use the pricing calculation function with locations for Snowbird rule detection
      const pricingResult = calculatePrice(
        distanceData.distance,
        formData.vehicleType,
        new Date(), // Current date
        formData.pickupLocation,
        formData.dropoffLocation,
      );

      // Extract the calculated values
      const transitTime = pricingResult.transitTime;
      const openTransportPrice = pricingResult.openTransport;
      const enclosedTransportPrice = pricingResult.enclosedTransport;

      console.log("Calculated pricing:", {
        distance: distanceData.distance,
        transitTime,
        openTransportPrice,
        enclosedTransportPrice,
      });

      // Create the complete quote data with real calculated values and ZIP codes
      const quoteData = {
        ...formData,
        pickupZip: pickupZip,
        dropoffZip: dropoffZip,
        openTransportPrice: openTransportPrice,
        enclosedTransportPrice: enclosedTransportPrice,
        transitTime: transitTime,
        distance: distanceData.distance,
      };

      console.log("Added ZIP codes to quote data:", {
        pickupZip,
        dropoffZip,
      });

      console.log("Final quote data with real distance:", quoteData);

      // Extract Facebook/Meta tracking parameters from the current URL only
      const currentUrl = window.location.href;
      console.log("📊 Current URL for attribution:", currentUrl);

      // Function to extract query parameters from URL
      function getQueryParam(name, url) {
        const match = url.match(new RegExp("[?&]" + name + "=([^&]+)"));
        return match ? decodeURIComponent(match[1]) : null;
      }

      // Extract Facebook and UTM tracking parameters from current URL
      const fbclid = getQueryParam("fbclid", currentUrl);
      const utm_source = getQueryParam("utm_source", currentUrl);
      const utm_medium = getQueryParam("utm_medium", currentUrl);
      const utm_campaign = getQueryParam("utm_campaign", currentUrl);
      const utm_term = getQueryParam("utm_term", currentUrl);
      const utm_content = getQueryParam("utm_content", currentUrl);

      console.log("📊 Facebook/Meta attribution parameters:", {
        fbclid,
        utm_source,
        utm_medium,
        utm_campaign,
        utm_term,
        utm_content,
      });

      // Send data to webhook when "Get Quote" is clicked
      console.log("⚡ SENDING QUOTE DATA TO WEBHOOK");
      try {
        // Add basic data to the webhook payload
        const webhookData = {
          ...quoteData,
          eventType: "quote_submission",
          eventDate: new Date().toISOString(),
          // Basic URL attribution - no Meta CAPI integration
          fbclid: fbclid || null,
          utm_source: utm_source || null,
          utm_medium: utm_medium || null,
          utm_campaign: utm_campaign || null,
          utm_term: utm_term || null,
          utm_content: utm_content || null,
          referrer: document.referrer || "",
        };

        // Use await to ensure we catch any errors properly
        // Get the current domain to handle iframe scenarios
        const currentDomain = window.location.origin;
        console.log("Current domain for API request:", currentDomain);

        // Use the full URL to avoid issues when embedded in an iframe
        const apiUrl = `${currentDomain}/api/webhook`;
        console.log("Using webhook API URL:", apiUrl);

        const webhookResponse = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          // Include credentials to ensure cookies are sent even for cross-origin requests
          credentials: "include",
          body: JSON.stringify(webhookData),
        });

        console.log({
          webhookResponse,
        });

        // Handle webhook response
        if (!webhookResponse.ok) {
          console.error(
            "⚡ WEBHOOK ERROR:",
            webhookResponse.status,
            webhookResponse.statusText,
          );

          // Try to parse the error response for validation errors
          try {
            const errorResponse = await webhookResponse.json();

            // If server validation found errors we didn't catch client-side
            if (errorResponse.validationErrors) {
              console.error(
                "Server validation failed:",
                errorResponse.validationErrors,
              );
              setValidationErrors(errorResponse.validationErrors);
              setIsSubmitting(false);
              return; // Prevent navigation to next screen
            }
          } catch (parseError) {
            console.error(
              "Could not parse webhook error response:",
              parseError,
            );
          }
        } else {
          console.log("⚡ WEBHOOK SENT SUCCESSFULLY");
        }
      } catch (webhookError) {
        console.error("⚡ ERROR SENDING DATA TO WEBHOOK:", webhookError);
        // Continue with navigation even if webhook fails
      }

      // Add basic URL parameters to the URL-encoded data for the next page
      const quoteDataWithAttribution = {
        ...quoteData,
        // Basic attribution data from URL only
        fbclid: fbclid || null,
        utm_source: utm_source || null,
        utm_medium: utm_medium || null,
        utm_campaign: utm_campaign || null,
        utm_term: utm_term || null,
        utm_content: utm_content || null,
        referrer: document.referrer || "",
      };

      const params = new URLSearchParams({
        data: encodeURIComponent(JSON.stringify(quoteDataWithAttribution)),
      });

      // Reset submission state before navigating
      setIsSubmitting(false);

      // Navigate to the final quote page
      navigate(`/final-quote?${params.toString()}`);
    } catch (error) {
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

export default SimpleQuoteForm;
