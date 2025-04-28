/**
 * Webhook Field Mapping and Validation Diagnostics
 * 
 * This module analyzes form submissions and webhook payloads to identify
 * field population inconsistencies, missing values, and mapping issues.
 */

// Define expected field sets for different form types
const REQUIRED_QUOTE_FIELDS = [
  'name', 'email', 'phone', 'pickupLocation', 'dropoffLocation', 
  'vehicleType', 'year', 'make', 'model'
];

const REQUIRED_FINAL_SUBMISSION_FIELDS = [
  'name', 'email', 'phone', 'pickupLocation', 'dropoffLocation',
  'vehicleType', 'year', 'make', 'model', 'pickupContactName',
  'pickupContactPhone', 'pickupAddress', 'dropoffContactName',
  'dropoffContactPhone', 'dropoffAddress'
];

// Field groups for diagnostic logging
const FIELD_GROUPS = {
  contactInfo: ['name', 'email', 'phone', 'firstName', 'lastName'],
  vehicleInfo: ['vehicleType', 'year', 'make', 'model'],
  routeInfo: ['pickupLocation', 'dropoffLocation', 'distance', 'transitTime'],
  pickupInfo: ['pickupContactName', 'pickupContactPhone', 'pickupAddress'],
  dropoffInfo: ['dropoffContactName', 'dropoffContactPhone', 'dropoffAddress'],
  pricingInfo: ['openTransportPrice', 'enclosedTransportPrice', 'selectedPrice'],
  datesInfo: ['shipmentDate', 'submissionDate']
};

/**
 * Analyze form data for field population issues
 * 
 * @param formData The raw form data submitted by the user
 * @param formType The type of form (quote or final)
 */
export function analyzeFormData(formData: any, formType: 'quote' | 'final' = 'quote'): {
  missingRequiredFields: string[];
  emptyFields: string[];
  populatedFields: string[];
  validationIssues: Array<{field: string, issue: string}>;
} {
  // Determine required fields based on form type
  const requiredFields = formType === 'quote' 
    ? REQUIRED_QUOTE_FIELDS 
    : REQUIRED_FINAL_SUBMISSION_FIELDS;
  
  // Analysis results
  const missingRequiredFields: string[] = [];
  const emptyFields: string[] = [];
  const populatedFields: string[] = [];
  const validationIssues: Array<{field: string, issue: string}> = [];
  
  // Check for required fields
  for (const field of requiredFields) {
    // Consider null, undefined, empty string as empty
    const isEmpty = formData[field] === undefined || 
                    formData[field] === null || 
                    formData[field] === '';
    
    if (isEmpty) {
      missingRequiredFields.push(field);
      emptyFields.push(field);
    } else {
      populatedFields.push(field);
      
      // Validate field formats
      const validationResult = validateFieldFormat(field, formData[field]);
      if (!validationResult.valid) {
        validationIssues.push({ field, issue: validationResult.issue });
      }
    }
  }
  
  // Check all other fields that might be present but not required
  for (const field in formData) {
    if (!requiredFields.includes(field)) {
      // Check if the field is empty
      const isEmpty = formData[field] === undefined || 
                      formData[field] === null || 
                      formData[field] === '';
      
      if (isEmpty) {
        emptyFields.push(field);
      } else {
        populatedFields.push(field);
        
        // Validate field formats
        const validationResult = validateFieldFormat(field, formData[field]);
        if (!validationResult.valid) {
          validationIssues.push({ field, issue: validationResult.issue });
        }
      }
    }
  }
  
  return {
    missingRequiredFields,
    emptyFields,
    populatedFields,
    validationIssues
  };
}

/**
 * Validate the format of a specific field
 */
function validateFieldFormat(field: string, value: any): { valid: boolean; issue: string } {
  // Email validation
  if (field === 'email' && typeof value === 'string') {
    // Simple regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return { valid: false, issue: 'Invalid email format' };
    }
  }
  
  // Phone validation (US format)
  if ((field === 'phone' || field.includes('Phone')) && typeof value === 'string') {
    // Remove all non-digits
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length < 10) {
      return { valid: false, issue: 'Phone number too short (needs at least 10 digits)' };
    }
  }
  
  // Location validation
  if ((field === 'pickupLocation' || field === 'dropoffLocation') && typeof value === 'string') {
    // Check for City, State format
    const cityStateRegex = /^[^,]+,\s*[A-Z]{2}/;
    if (!cityStateRegex.test(value)) {
      return { valid: false, issue: 'Location should be in "City, ST" format' };
    }
  }
  
  // Year validation
  if (field === 'year' && value) {
    const year = parseInt(String(value), 10);
    const currentYear = new Date().getFullYear();
    if (isNaN(year) || year < 1900 || year > currentYear + 1) {
      return { valid: false, issue: 'Invalid year' };
    }
  }
  
  // Address validation
  if (field.includes('Address') && typeof value === 'string') {
    if (value.length < 5) {
      return { valid: false, issue: 'Address seems too short' };
    }
  }
  
  return { valid: true, issue: '' };
}

/**
 * Compare the original form data with the webhook payload to identify mapping issues
 * 
 * @param formData The original form data from the client
 * @param webhookPayload The processed payload being sent to the webhook
 */
export function compareFormDataToPayload(formData: any, webhookPayload: any): {
  missingInPayload: string[];
  transformedFields: Array<{field: string, originalValue: any, transformedValue: any}>;
  potentialMappingIssues: Array<{field: string, issue: string}>;
} {
  const missingInPayload: string[] = [];
  const transformedFields: Array<{field: string, originalValue: any, transformedValue: any}> = [];
  const potentialMappingIssues: Array<{field: string, issue: string}> = [];
  
  // Check all form fields to see if they're present in payload
  for (const field in formData) {
    // Skip fields that are intentionally transformed or renamed
    if (shouldSkipFieldComparison(field)) continue;
    
    if (webhookPayload[field] === undefined) {
      // Check for mapped fields with special names
      const mappedField = findMappedField(field, webhookPayload);
      
      if (mappedField) {
        // Field was transformed but exists in a different format
        transformedFields.push({
          field,
          originalValue: formData[field],
          transformedValue: webhookPayload[mappedField]
        });
        
        // Check if the transformed value seems incorrect
        if (!areValuesEquivalent(formData[field], webhookPayload[mappedField])) {
          potentialMappingIssues.push({
            field,
            issue: `Value changed during transformation: "${formData[field]}" to "${webhookPayload[mappedField]}"`
          });
        }
      } else {
        // Field is truly missing in the payload
        missingInPayload.push(field);
      }
    } else if (!areValuesEquivalent(formData[field], webhookPayload[field])) {
      // Field exists but value was transformed
      transformedFields.push({
        field,
        originalValue: formData[field],
        transformedValue: webhookPayload[field]
      });
      
      if (typeof formData[field] !== typeof webhookPayload[field]) {
        potentialMappingIssues.push({
          field,
          issue: `Type changed from ${typeof formData[field]} to ${typeof webhookPayload[field]}`
        });
      }
    }
  }
  
  // Check extra fields in webhook payload that weren't in original form
  for (const field in webhookPayload) {
    if (formData[field] === undefined && !isGeneratedField(field)) {
      // This is a field that was added during payload preparation
      transformedFields.push({
        field,
        originalValue: undefined,
        transformedValue: webhookPayload[field]
      });
    }
  }
  
  return {
    missingInPayload,
    transformedFields,
    potentialMappingIssues
  };
}

/**
 * Check if two values are equivalent, accounting for type conversions
 */
function areValuesEquivalent(value1: any, value2: any): boolean {
  // If both values are falsy, they're equivalent
  if (!value1 && !value2) return true;
  
  // If types match and values match
  if (typeof value1 === typeof value2 && value1 === value2) return true;
  
  // If one is string and one is number, compare string versions
  if (
    (typeof value1 === 'string' && typeof value2 === 'number') ||
    (typeof value1 === 'number' && typeof value2 === 'string')
  ) {
    return String(value1) === String(value2);
  }
  
  // For dates, compare as strings
  if (
    (value1 instanceof Date && typeof value2 === 'string') ||
    (typeof value1 === 'string' && value2 instanceof Date)
  ) {
    // Normalize date format
    const date1 = value1 instanceof Date ? value1 : new Date(value1);
    const date2 = value2 instanceof Date ? value2 : new Date(value2);
    
    if (!isNaN(date1.getTime()) && !isNaN(date2.getTime())) {
      return date1.toISOString().split('T')[0] === date2.toISOString().split('T')[0];
    }
  }
  
  return false;
}

/**
 * Check if this field is intentionally skipped during comparison
 */
function shouldSkipFieldComparison(field: string): boolean {
  // Fields that are intentionally transformed or renamed
  const skippedFields = [
    'eventType', // Special field for webhook type
    'submissionId', // Generated field
    'submissionDate', // Generated field
  ];
  
  return skippedFields.includes(field);
}

/**
 * Find the possible mapped field in the webhook payload
 */
function findMappedField(originalField: string, webhookPayload: any): string | null {
  // Known field mappings
  const fieldMappings: {[key: string]: string[]} = {
    'name': ['Contact Info Name', 'name'],
    'email': ['Contact Info Email', 'email'],
    'phone': ['Contact Info Phone (required)', 'phone'],
    'pickupLocation': ['Route Details Pickup City', 'pickup_city', 'pickupLocation'],
    'dropoffLocation': ['Route Details Dropoff City', 'dropoff_city', 'dropoffLocation'],
    'year': ['Vehicle Details Year', 'vehicle_year', 'year'],
    'make': ['Vehicle Details Make', 'vehicle_make', 'make'],
    'model': ['Vehicle Details Model', 'vehicle_model', 'model'],
    'distance': ['Route Details Distance (in miles)', 'distance']
  };
  
  // Check if this field has a known mapping
  if (fieldMappings[originalField]) {
    for (const mappedField of fieldMappings[originalField]) {
      if (webhookPayload[mappedField] !== undefined) {
        return mappedField;
      }
    }
  }
  
  // Check for fields that contain the original field name
  for (const payloadField in webhookPayload) {
    if (payloadField.toLowerCase().includes(originalField.toLowerCase())) {
      return payloadField;
    }
  }
  
  return null;
}

/**
 * Check if this field is generated during webhook preparation
 */
function isGeneratedField(field: string): boolean {
  const generatedFields = [
    'submissionId', 'submissionDate', 'eventType',
    'Contact Info Name', 'Contact Info Email', 'Contact Info Phone (required)',
    'Route Details Pickup City', 'Route Details Pickup State', 'Route Details Pickup Zip',
    'Route Details Dropoff City', 'Route Details Dropoff State', 'Route Details Dropoff Zip',
    'Route Details Distance (in miles)', 'Route Details Estimated Transit Time',
    'Vehicle Details Year', 'Vehicle Details Make', 'Vehicle Details Model',
    'Price Details Total Price (Open Transport Only)',
    'pickup_city', 'pickup_state', 'pickup_zip',
    'dropoff_city', 'dropoff_state', 'dropoff_zip',
    'vehicle_year', 'vehicle_make', 'vehicle_model',
    'open_transport_price', 'enclosed_transport_price', 'transit_time'
  ];
  
  return generatedFields.includes(field);
}

/**
 * Create a detailed diagnostic log for form and webhook data
 * 
 * @param formData The original form data from the client
 * @param webhookPayload The processed payload being sent to the webhook
 * @param formType The type of form (quote or final)
 */
export function createFieldDiagnosticLog(
  formData: any, 
  webhookPayload: any, 
  formType: 'quote' | 'final' = 'quote'
): string {
  // Analyze form data for field population issues
  const formAnalysis = analyzeFormData(formData, formType);
  
  // Compare form data to webhook payload
  const payloadComparison = compareFormDataToPayload(formData, webhookPayload);
  
  // Log header
  let log = `\n========== WEBHOOK FIELD DIAGNOSTIC LOG ==========\n`;
  log += `📝 FORM TYPE: ${formType.toUpperCase()}\n`;
  log += `⏱️ TIMESTAMP: ${new Date().toISOString()}\n\n`;
  
  // Log form analysis
  log += `📋 FORM DATA ANALYSIS:\n`;
  log += `   - Total fields: ${Object.keys(formData).length}\n`;
  log += `   - Populated fields: ${formAnalysis.populatedFields.length}\n`;
  log += `   - Empty fields: ${formAnalysis.emptyFields.length}\n`;
  log += `   - Missing required fields: ${formAnalysis.missingRequiredFields.length}\n`;
  log += `   - Validation issues: ${formAnalysis.validationIssues.length}\n\n`;
  
  // Log missing required fields if any
  if (formAnalysis.missingRequiredFields.length > 0) {
    log += `❌ MISSING REQUIRED FIELDS:\n`;
    formAnalysis.missingRequiredFields.forEach(field => {
      log += `   - ${field}\n`;
    });
    log += `\n`;
  }
  
  // Log validation issues if any
  if (formAnalysis.validationIssues.length > 0) {
    log += `⚠️ FIELD VALIDATION ISSUES:\n`;
    formAnalysis.validationIssues.forEach(issue => {
      log += `   - ${issue.field}: ${issue.issue}\n`;
    });
    log += `\n`;
  }
  
  // Log field groups
  for (const [groupName, fields] of Object.entries(FIELD_GROUPS)) {
    log += `🔍 ${groupName.toUpperCase()} FIELDS:\n`;
    
    fields.forEach(field => {
      const formValue = formData[field];
      const payloadValue = findValueInPayload(field, webhookPayload);
      
      // Determine field status
      let status = '✅'; // Default: field exists and is consistent
      
      if (formValue === undefined || formValue === null || formValue === '') {
        status = '⚠️'; // Warning: field is empty in form
      } else if (payloadValue === undefined) {
        status = '❌'; // Error: field is missing in payload
      } else if (!areValuesEquivalent(formValue, payloadValue.value)) {
        status = '🔄'; // Changed: field was transformed
      }
      
      // Log the field status
      log += `   ${status} ${field}: `;
      
      // Log form value
      if (formValue === undefined) {
        log += `FORM: undefined`;
      } else if (formValue === null) {
        log += `FORM: null`;
      } else if (formValue === '') {
        log += `FORM: ""`;
      } else {
        log += `FORM: "${formValue}"`;
      }
      
      // Log payload value if different
      if (payloadValue !== undefined) {
        if (payloadValue.field !== field) {
          log += ` → PAYLOAD["${payloadValue.field}"]: "${payloadValue.value}"`;
        } else if (!areValuesEquivalent(formValue, payloadValue.value)) {
          log += ` → PAYLOAD: "${payloadValue.value}"`;
        }
      } else {
        log += ` → PAYLOAD: missing`;
      }
      
      log += `\n`;
    });
    
    log += `\n`;
  }
  
  // Log fields missing in payload
  if (payloadComparison.missingInPayload.length > 0) {
    log += `❌ FIELDS MISSING IN PAYLOAD:\n`;
    payloadComparison.missingInPayload.forEach(field => {
      log += `   - ${field}: "${formData[field]}"\n`;
    });
    log += `\n`;
  }
  
  // Log potential mapping issues
  if (payloadComparison.potentialMappingIssues.length > 0) {
    log += `⚠️ POTENTIAL MAPPING ISSUES:\n`;
    payloadComparison.potentialMappingIssues.forEach(issue => {
      log += `   - ${issue.field}: ${issue.issue}\n`;
    });
    log += `\n`;
  }
  
  // Log additional fields in payload
  const additionalFields = payloadComparison.transformedFields
    .filter(f => formData[f.field] === undefined);
  
  if (additionalFields.length > 0) {
    log += `➕ ADDITIONAL FIELDS IN PAYLOAD:\n`;
    additionalFields.forEach(field => {
      log += `   - ${field.field}: "${field.transformedValue}"\n`;
    });
    log += `\n`;
  }
  
  // Summary
  log += `📊 DIAGNOSTIC SUMMARY:\n`;
  
  if (formAnalysis.missingRequiredFields.length === 0 && 
      formAnalysis.validationIssues.length === 0 && 
      payloadComparison.potentialMappingIssues.length === 0) {
    log += `   ✅ FORM DATA IS VALID AND PROPERLY MAPPED\n`;
  } else {
    if (formAnalysis.missingRequiredFields.length > 0) {
      log += `   ❌ MISSING ${formAnalysis.missingRequiredFields.length} REQUIRED FIELDS\n`;
    }
    if (formAnalysis.validationIssues.length > 0) {
      log += `   ⚠️ ${formAnalysis.validationIssues.length} FIELD VALIDATION ISSUES\n`;
    }
    if (payloadComparison.potentialMappingIssues.length > 0) {
      log += `   ⚠️ ${payloadComparison.potentialMappingIssues.length} POTENTIAL MAPPING ISSUES\n`;
    }
  }
  
  log += `\n========== END DIAGNOSTIC LOG ==========\n`;
  
  return log;
}

/**
 * Find a value in the webhook payload, checking various possible field names
 */
function findValueInPayload(
  field: string, 
  payload: any
): { field: string; value: any } | undefined {
  // Direct match
  if (payload[field] !== undefined) {
    return { field, value: payload[field] };
  }
  
  // Check mapped field
  const mappedField = findMappedField(field, payload);
  if (mappedField) {
    return { field: mappedField, value: payload[mappedField] };
  }
  
  return undefined;
}