import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { useMemo } from "react";

// Simple lat/lng type
type LatLng = { lat: number; lng: number };

// Pin marker type
type Pin = {
  position: LatLng;
  title?: string;
  onClick?: () => void;
};

// Props for the map component
type Props = {
  center: LatLng;     // required map center
  zoom?: number;      // default 12
  height?: number;    // map height (px)
  pins?: Pin[];       // markers to show
};

export default function GMap({
  center,
  zoom = 12,
  height = 280,
  pins = [],
}: Props) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

  // Load Google Maps script
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey ?? "",
  });

  // Style for the map container
  const containerStyle = useMemo(
    () => ({
      width: "100%",
      height: `${height}px`,
      borderRadius: "16px",
    }),
    [height]
  );

  // Map options (disable unnecessary controls)
  const options: google.maps.MapOptions = useMemo(
    () => ({
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      clickableIcons: false,
      zoomControl: true,
      gestureHandling: "greedy",
    }),
    []
  );

  // Error + loading states
  if (loadError) return <div style={{ padding: 12 }}>Failed to load map.</div>;
  if (!apiKey)
    return <div style={{ padding: 12 }}>Missing VITE_GOOGLE_MAPS_API_KEY</div>;
  if (!isLoaded) return <div style={{ padding: 12 }}>Loading map…</div>;

  // Render map + pins
  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      options={options}
    >
      {pins.map((p, idx) => (
        <Marker
          key={idx}
          position={p.position}
          title={p.title}
          onClick={p.onClick}
        />
      ))}
    </GoogleMap>
  );
}
