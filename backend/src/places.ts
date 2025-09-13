// backend/src/places.ts

import * as dotenv from "dotenv";
dotenv.config();

// Helper: get API key safely
function getApiKey(): string {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) throw new Error("Missing GOOGLE_MAPS_API_KEY");
  return key;
}

// Shape of restaurant items (used in list view)
export type RestaurantListItem = {
  placeId: string;
  name: string;
  address?: string;
  rating?: number;
  photoUrl?: string;
  location?: {
    lat: number;
    lng: number;
  };
};

/**
 * Search restaurants in Stockholm (always scoped to Stockholm).
 * Uses `page` to vary the query so each call returns different results.
 */
export async function searchRestaurants(params: {
  q?: string;
  limit?: number;
  page?: number;
}): Promise<RestaurantListItem[]> {
  const API_KEY = getApiKey();
  const { q = "restaurants", limit = 20, page = 1 } = params;

  // Always scope to Stockholm — append `page` for variety
  const textQuery = q.toLowerCase().includes("stockholm")
    ? `${q} page ${page}`
    : `${q} in Stockholm page ${page}`;

  const body: any = {
    textQuery,
    locationBias: {
      circle: {
        center: { latitude: 59.3293, longitude: 18.0686 }, // Stockholm center
        radius: 30000, // 30 km radius
      },
    },
  };

  // Call Places API (searchText)
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": [
        "places.id",
        "places.displayName",
        "places.formattedAddress",
        "places.rating",
        "places.userRatingCount",
        "places.photos",
        "places.location",
        "places.currentOpeningHours.openNow",
      ].join(","),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Places v1 search failed (${res.status}) ${t}`);
  }

  // Parse response JSON
  const json = (await res.json()) as {
    places?: Array<{
      id: string;
      displayName?: { text: string };
      formattedAddress?: string;
      rating?: number;
      userRatingCount?: number;
      location?: { latitude: number; longitude: number };
      photos?: Array<{ name: string }>;
      currentOpeningHours?: { openNow?: boolean };
    }>;
  };

  const results = json.places ?? [];

  // Apply client-side limit 
  return results.slice(0, limit).map((p) => {
    const placeId = p.id;
    const photoName: string | undefined = p.photos?.[0]?.name;
    const photoUrl = photoName
      ? `/photos/v1/${encodeURIComponent(photoName)}?maxwidth=400`
      : undefined;

    return {
      placeId,
      name: p.displayName?.text ?? "Unknown",
      address: p.formattedAddress,
      rating: p.rating,
      userRatingsTotal: p.userRatingCount, 
      photoUrl,
      location: p.location
        ? { lat: p.location.latitude, lng: p.location.longitude }
        : undefined,
      openNow: p.currentOpeningHours?.openNow ?? false, 
    };
  });
}

/**
 * Get detailed info for one restaurant by placeId
 */
export async function getRestaurantDetails(placeId: string) {
  const API_KEY = getApiKey();
  const url = `https://places.googleapis.com/v1/places/${encodeURIComponent(
    placeId
  )}`;

  const res = await fetch(url, {
    headers: {
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": [
        "id",
        "displayName",
        "formattedAddress",
        "nationalPhoneNumber",
        "websiteUri",
        "rating",
        "regularOpeningHours.weekdayDescriptions",
        "location",
        "photos",
      ].join(","),
    },
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Place v1 details failed (${res.status}) ${t}`);
  }

  // Response JSON
  const r = (await res.json()) as {
    id: string;
    displayName?: { text: string };
    formattedAddress?: string;
    nationalPhoneNumber?: string;
    websiteUri?: string;
    rating?: number;
    regularOpeningHours?: { weekdayDescriptions?: string[] };
    location?: { latitude: number; longitude: number };
    photos?: Array<{ name: string }>;
  };

  // Collect all photos for carousel
  const photos = (r.photos ?? []).map((p) => ({
    name: p.name,
    url: `/photos/v1/${encodeURIComponent(p.name)}?maxwidth=1200`,
  }));

  // Main photo for list view
  const photoName: string | undefined = r.photos?.[0]?.name;
  const photoUrl = photoName
    ? `/photos/v1/${encodeURIComponent(photoName)}?maxwidth=800`
    : undefined;

  return {
    placeId: r.id,
    name: r.displayName?.text ?? "Unknown",
    address: r.formattedAddress,
    phone: r.nationalPhoneNumber,
    website: r.websiteUri,
    rating: r.rating,
    openingHours: r.regularOpeningHours?.weekdayDescriptions ?? [],
    location: r.location
      ? { lat: r.location.latitude, lng: r.location.longitude }
      : undefined,
    photoUrl, // first photo for list view
    photos, // all photos for carousel
  };
}

/**
 * Proxy a photo download from Google Places API v1
 */
export async function fetchPhotoV1(photoName: string, maxwidth = 400) {
  const API_KEY = getApiKey();
  const url = `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=${maxwidth}&key=${API_KEY}`;

  const res = await fetch(url, { method: "GET" });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Photo v1 fetch failed (${res.status}) ${t}`);
  }

  return res;
}
