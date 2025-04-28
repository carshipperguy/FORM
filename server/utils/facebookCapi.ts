import fetch from 'node-fetch';

const META_PIXEL_ID = '953087976815191';
const ACCESS_TOKEN = 'EAAWuSmOGqPoBOx8fbl8AqrBVGmC66mZBQkb8asm0cqFvZB1kpGZBGP2e88ftskhQl3IIodoEWnyVm5ciBL22xt38t01IbqYnISwRDOsfz3YZBZAKzUoPJWxXWrYImZBW7e0hENnCOQF9ZCVLggWK2Il1sAqQjCfAbagTxhEDrJoHlwZA59z45MBrvVhZBc40iVZCMZB7wZDZD';
const API_VERSION = 'v17.0';

type MetaEventType = 'quote_sent' | 'deal_closed';

interface SendMetaEventPayload {
  eventType: MetaEventType;
  userData: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
  };
  eventSourceUrl: string;
  testEventCode?: string;
  // Add Facebook/Meta attribution parameters
  fbc?: string; // Facebook click ID (fbclid)
  fbp?: string; // Facebook browser ID
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}

export async function sendMetaEvent({ 
  eventType, 
  userData, 
  eventSourceUrl,
  fbc,
  fbp,
  utm_source,
  utm_medium,
  utm_campaign,
  utm_content,
  utm_term
}: SendMetaEventPayload) {
  const url = `https://graph.facebook.com/${API_VERSION}/${META_PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`;

  const event = {
    event_name: eventType,
    event_time: Math.floor(Date.now() / 1000),
    event_source_url: eventSourceUrl,
    action_source: 'website',
    user_data: {
      em: userData.email ? [hash(userData.email)] : undefined,
      ph: userData.phone ? [hash(userData.phone)] : undefined,
      fn: userData.firstName ? [hash(userData.firstName)] : undefined,
      ln: userData.lastName ? [hash(userData.lastName)] : undefined,
      // Add Facebook attribution data if available
      fbc: fbc || undefined,
      fbp: fbp || undefined
    },
    // Include utm parameters in custom data for attribution tracking
    custom_data: {
      utm_source: utm_source || undefined,
      utm_medium: utm_medium || undefined,
      utm_campaign: utm_campaign || undefined,
      utm_content: utm_content || undefined,
      utm_term: utm_term || undefined
    }
  };

  const payload: any = { data: [event] };

  if (process.env.META_TEST_CODE) {
    payload.test_event_code = process.env.META_TEST_CODE;
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'application/json' }
    });

    const data = await res.json();
    console.log('✅ Meta CAPI Event Sent:', data);
    return data;
  } catch (err) {
    console.error('❌ Failed to send Meta CAPI event:', err);
    return null;
  }
}

// Helper hash function for simplicity (Meta expects SHA256)
import crypto from 'crypto';
function hash(value: string) {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex');
}