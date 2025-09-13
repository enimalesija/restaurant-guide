/**
 * Here we have restaurant entity type shared across app.
 * Mirrors data returned by backend (from Google Places API).
 */
export interface Restaurant {
  placeId: string; // unique Google Places ID
  name: string; // restaurant name

  address?: string; // formatted address
  phone?: string; // national phone number
  website?: string; // website URL
  rating?: number; // average rating (0–5)
  userRatingsTotal?: number; // total number of ratings

  openingHours?: string[]; // weekday descriptions
  openNow?: boolean; // true if currently open

  location?: {
    lat: number;
    lng: number;
  };

  photoUrl?: string; // first photo (for list preview)
  photos?: { name: string; url: string }[]; // all photos (for the carousel)
}
