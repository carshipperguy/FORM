/**
 * Test Data Generator for Webhook Field Diagnostics
 * 
 * This module provides test data sets to analyze field mapping and validate
 * payload construction for different form submission scenarios.
 */

// Valid form submission, including all required fields
export const VALID_QUOTE_SUBMISSION = {
  name: "Test Customer",
  email: "test@example.com",
  phone: "555-123-4567",
  pickupLocation: "Boston, MA 02108",
  dropoffLocation: "Miami, FL 33101",
  vehicleType: "car",
  year: "2020",
  make: "Toyota",
  model: "Camry",
  distance: 1500,
  transitTime: 4,
  openTransportPrice: 1250,
  enclosedTransportPrice: 1875
};

// A submission with missing required fields
export const INCOMPLETE_QUOTE_SUBMISSION = {
  name: "Incomplete Customer",
  email: "incomplete@example.com",
  // missing phone
  pickupLocation: "Chicago, IL 60601",
  // missing dropoffLocation
  vehicleType: "suv",
  year: "2019",
  make: "Ford",
  // missing model
  distance: 800,
  transitTime: 2
};

// A submission with invalid field formats
export const INVALID_FORMAT_SUBMISSION = {
  name: "Invalid Format",
  email: "not-an-email",
  phone: "123", // too short
  pickupLocation: "Houston", // missing state and ZIP
  dropoffLocation: "Los Angeles CA", // missing comma between city and state
  vehicleType: "car",
  year: "invalid", // not a number
  make: "Toyota",
  model: "Camry",
  distance: "one thousand", // not a number
  transitTime: "three days" // not a number
};

// Complete final submission with all booking details
export const VALID_FINAL_SUBMISSION = {
  name: "Final Customer",
  email: "final@example.com",
  phone: "555-987-6543",
  pickupLocation: "Seattle, WA 98101",
  dropoffLocation: "Denver, CO 80201",
  vehicleType: "car",
  year: "2018",
  make: "Honda",
  model: "Accord",
  distance: 1300,
  transitTime: 3,
  openTransportPrice: 1100,
  enclosedTransportPrice: 1650,
  pickupContactName: "Pickup Contact",
  pickupContactPhone: "555-111-2222",
  pickupAddress: "123 Main St, Seattle, WA 98101",
  dropoffContactName: "Dropoff Contact",
  dropoffContactPhone: "555-333-4444",
  dropoffAddress: "456 Oak Ave, Denver, CO 80201",
  transportType: "open",
  selectedPrice: 1100,
  shipmentDate: "2025-05-15",
  eventType: "final_submission"
};

// Submission with special characters and edge cases
export const SPECIAL_CHARACTERS_SUBMISSION = {
  name: "O'Connor & Sons-Williams",
  email: "special.test+label@example-domain.co.uk",
  phone: "+1 (555) 987-6543 ext. 123",
  pickupLocation: "St. Louis, MO 63101",
  dropoffLocation: "New York-Queens, NY 11101",
  vehicleType: "car",
  year: "2022",
  make: "BMW",
  model: "X5 4.8i AWD",
  distance: 1200,
  transitTime: 3,
  notes: "Please handle with care! This vehicle has sentimental value.",
  openTransportPrice: 1200,
  enclosedTransportPrice: 1800
};