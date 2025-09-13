import { GoogleMap, Marker } from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import type { Restaurant } from "../types/restaurant";

// Wrapper for GoogleMap with restaurant pins
export default function GoogleMapWrapper({
  restaurants,
}: {
  restaurants: Restaurant[];
}) {
  const navigate = useNavigate();

  // Marker icon color by rating (green, orange, red)
  const markerIcon = (rating?: number): google.maps.Symbol => ({
    path: google.maps.SymbolPath.CIRCLE,
    scale: 10,
    fillColor:
      rating && rating >= 4.5
        ? "green"
        : rating && rating >= 3.5
        ? "orange"
        : "red",
    fillOpacity: 0.9,
    strokeWeight: 1,
    strokeColor: "white",
  });

  return (
    <GoogleMap
      mapContainerStyle={{
        width: "100%",
        height: "100%",
        borderRadius: 16,
      }}
      center={{ lat: 59.3293, lng: 18.0686 }} // Stockholm center
      zoom={12}
      options={{
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        clickableIcons: false,
        zoomControl: true,
        gestureHandling: "greedy",
      }}
    >
      {restaurants
        .filter((r) => r.location) // skip if no coords
        .map((r, idx) => (
          <Marker
            key={`${r.placeId}-${idx}`} // ensures refresh on updates
            position={{ lat: r.location!.lat, lng: r.location!.lng }}
            title={r.name}
            onClick={() => navigate(`/r/${r.placeId}`)} // goes to detail page
            icon={markerIcon(r.rating)}
          />
        ))}
    </GoogleMap>
  );
}
