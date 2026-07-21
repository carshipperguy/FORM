/**
 * Distance service — wraps MapQuest directions.
 *
 * Reads the key from MAPQUEST_API_KEY, falling back to the key already committed
 * in server/routes.ts so this keeps working in the current environment. Move it
 * fully to an env var before this goes anywhere public.
 */

const MAPQUEST_API_KEY = process.env.MAPQUEST_API_KEY || "YDMaftbjplfYTcQ129jOTQEkt37kNXy9";

export interface DistanceResult {
  distance: number; // miles
  timeText?: string;
}

/** Reduce a messy location string to "City, ST" which MapQuest handles best. */
function normalize(location: string): string {
  const m = location.match(/([^,]+,\s*[A-Z]{2})/i);
  return m && m[1] ? m[1].trim() : location;
}

export async function getDistance(origin: string, destination: string): Promise<DistanceResult> {
  const from = normalize(origin);
  const to = normalize(destination);

  const url =
    `http://www.mapquestapi.com/directions/v2/route?key=${MAPQUEST_API_KEY}` +
    `&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&unit=m`;

  const response = await fetch(url);
  const data: any = await response.json();

  if (data.route && typeof data.route.distance === "number") {
    return {
      distance: Math.round(data.route.distance),
      timeText: data.route.formattedTime,
    };
  }

  if (data.info?.messages?.length > 0) {
    throw new Error(`MapQuest API error: ${data.info.messages.join(", ")}`);
  }
  throw new Error("Distance calculation failed - no distance in response");
}
