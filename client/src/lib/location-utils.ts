/**
 * Extracts ZIP code from a location string.
 * 
 * @param locationString - The location string in format "City, STATE ZIP"
 * @returns The extracted ZIP code or empty string if none found
 */
export function extractZipCode(locationString: string): string {
  // Check for ZIP code pattern (5 digits, optionally followed by dash and 4 more digits)
  const zipPattern = /\b(\d{5}(-\d{4})?)\b/;
  const match = locationString.match(zipPattern);
  
  if (match && match[1]) {
    return match[1];
  }
  
  return "";
}