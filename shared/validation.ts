/**
 * Form Validation Module
 * 
 * Provides robust validation functions for form data before submission
 * to ensure complete and properly formatted data is sent to webhooks.
 */

// Define validation errors by field
export interface ValidationError {
  field: string;
  message: string;
}

// Form types for validation
export type FormType = 'quote' | 'final';

// Required fields by form type
const REQUIRED_QUOTE_FIELDS = [
  'name', 'email', 'phone', 'pickupLocation', 'dropoffLocation', 
  'vehicleType', 'year', 'make', 'model', 'shipmentDate'
];

const REQUIRED_FINAL_SUBMISSION_FIELDS = [
  'name', 'email', 'phone', 'pickupLocation', 'dropoffLocation',
  'vehicleType', 'year', 'make', 'model', 'pickupContactName',
  'pickupContactPhone', 'pickupAddress', 'dropoffContactName',
  'dropoffContactPhone', 'dropoffAddress', 'shipmentDate',
  'transportType', 'selectedPrice'
];

/**
 * Validate form data before submission
 * 
 * @param formData The form data to validate
 * @param formType The type of form (quote or final)
 * @returns Array of validation errors or empty array if valid
 */
export function validateFormData(
  formData: any,
  formType: FormType = 'quote'
): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // Validate required fields according to the critical instruction document
  
  // Contact information validation
  if (!formData.name) {
    errors.push({
      field: 'name',
      message: 'Contact name is required'
    });
  }
  
  // Email - Only check if it exists, no format validation
  if (!formData.email) {
    errors.push({
      field: 'email',
      message: 'Email address is required'
    });
  }
  
  // Phone - Only check if it exists, no format validation
  if (!formData.phone) {
    errors.push({
      field: 'phone',
      message: 'Phone number is required'
    });
  }
  
  // Location validation - pickup
  if (!formData.pickupLocation) {
    errors.push({
      field: 'pickupLocation',
      message: 'Pickup city and state are required'
    });
  }
  
  if (!formData.pickupZip) {
    errors.push({
      field: 'pickupZip',
      message: 'Pickup ZIP code is required'
    });
  }
  
  // Location validation - dropoff
  if (!formData.dropoffLocation) {
    errors.push({
      field: 'dropoffLocation',
      message: 'Delivery city and state are required'
    });
  }
  
  if (!formData.dropoffZip) {
    errors.push({
      field: 'dropoffZip',
      message: 'Delivery ZIP code is required'
    });
  }
  
  // Vehicle information validation - only check for presence, not format
  if (!formData.year) {
    errors.push({
      field: 'year',
      message: 'Vehicle year is required'
    });
  }
  
  if (!formData.make) {
    errors.push({
      field: 'make',
      message: 'Vehicle make is required'
    });
  }
  
  if (!formData.model) {
    errors.push({
      field: 'model',
      message: 'Vehicle model is required'
    });
  }
  
  // Shipment date validation - only check for presence, not format
  if (!formData.shipmentDate) {
    errors.push({
      field: 'shipmentDate',
      message: 'Shipment date is required'
    });
  }
  
  return errors;
}

/**
 * Validate that all fields in the form data are properly formatted
 * 
 * @param field The field name to validate
 * @param value The field value to validate
 * @returns ValidationError or null if valid
 */
function validateFieldFormat(field: string, value: any): ValidationError | null {
  // Email validation
  if (field === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(String(value))) {
      return {
        field,
        message: 'Please enter a valid email address'
      };
    }
  }
  
  // Phone validation (allow various formats, but ensure it's at least 10 digits)
  if (field === 'phone' || field.includes('Phone')) {
    const digitsOnly = String(value).replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      return {
        field,
        message: 'Please enter a valid phone number (at least 10 digits)'
      };
    }
  }
  
  // Location validation (City, State format)
  if (field === 'pickupLocation' || field === 'dropoffLocation') {
    const cityStateRegex = /^[^,]+,\s*[A-Z]{2}/;
    if (!cityStateRegex.test(String(value))) {
      return {
        field,
        message: `Please select a valid ${field === 'pickupLocation' ? 'pickup' : 'delivery'} location (City, State)`
      };
    }
  }
  
  // Year validation (should be a number between 1900 and current year + 1)
  if (field === 'year') {
    const year = parseInt(String(value), 10);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1900 || year > currentYear + 1) {
      return {
        field,
        message: 'Please enter a valid year'
      };
    }
  }
  
  // Shipment date validation (should be a valid date)
  if (field === 'shipmentDate') {
    const shipmentDate = new Date(value);
    if (isNaN(shipmentDate.getTime())) {
      return {
        field,
        message: 'Please enter a valid shipment date'
      };
    }
  }
  
  // All checks passed
  return null;
}

/**
 * Format field name for display in error messages
 * 
 * @param field The field name to format
 * @returns Formatted field name for display
 */
function formatFieldName(field: string): string {
  // Special cases
  const specialCases: Record<string, string> = {
    'pickupLocation': 'Pickup location',
    'dropoffLocation': 'Delivery location',
    'pickupContactName': 'Pickup contact name',
    'pickupContactPhone': 'Pickup contact phone',
    'pickupAddress': 'Pickup address',
    'dropoffContactName': 'Delivery contact name',
    'dropoffContactPhone': 'Delivery contact phone',
    'dropoffAddress': 'Delivery address',
    'vehicleType': 'Vehicle type',
    'shipmentDate': 'Shipment date',
    'transportType': 'Transport type',
    'selectedPrice': 'Selected price',
    'openTransportPrice': 'Open transport price',
    'enclosedTransportPrice': 'Enclosed transport price'
  };
  
  if (specialCases[field]) {
    return specialCases[field];
  }
  
  // Convert camelCase to Title Case
  return field
    .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
    .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
}

/**
 * Format validation errors into a user-friendly message
 * 
 * @param errors Array of validation errors
 * @returns User-friendly error message
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) {
    return '';
  }
  
  if (errors.length === 1) {
    return errors[0].message;
  }
  
  // Group by field type for more user-friendly messages
  const contactInfoErrors = errors.filter(e => 
    ['name', 'email', 'phone'].includes(e.field)
  );
  
  const locationErrors = errors.filter(e => 
    ['pickupLocation', 'dropoffLocation', 'pickupAddress', 'dropoffAddress'].includes(e.field)
  );
  
  const vehicleErrors = errors.filter(e => 
    ['vehicleType', 'year', 'make', 'model'].includes(e.field)
  );
  
  const otherErrors = errors.filter(e => 
    !contactInfoErrors.includes(e) && 
    !locationErrors.includes(e) && 
    !vehicleErrors.includes(e)
  );
  
  let message = 'Please correct the following issues:\n';
  
  if (contactInfoErrors.length > 0) {
    message += '\nContact Information:\n';
    contactInfoErrors.forEach(error => {
      message += `- ${error.message}\n`;
    });
  }
  
  if (locationErrors.length > 0) {
    message += '\nLocation Information:\n';
    locationErrors.forEach(error => {
      message += `- ${error.message}\n`;
    });
  }
  
  if (vehicleErrors.length > 0) {
    message += '\nVehicle Information:\n';
    vehicleErrors.forEach(error => {
      message += `- ${error.message}\n`;
    });
  }
  
  if (otherErrors.length > 0) {
    message += '\nOther Issues:\n';
    otherErrors.forEach(error => {
      message += `- ${error.message}\n`;
    });
  }
  
  return message;
}