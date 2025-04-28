// Define the MetaEventType to be used across the application
export type MetaEventType = 'quote_sent' | 'deal_closed';

// Meta event payload interface
export interface MetaEventPayload {
  eventType: MetaEventType;
  userData: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
  };
  eventSourceUrl: string;
  testEventCode?: string;
  // Facebook/Meta attribution parameters
  fbclid?: string | null; // Facebook click ID
  fbp?: string | null; // Facebook browser ID
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
}