// frontend/src/pages/RestaurantDetail.tsx

import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../api/client";
import type { Restaurant } from "../types/restaurant";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

/* ---------------- Error + Skeleton ---------------- */
function ErrorBox({ message }: { message: string }) {
  return (
    <div
      style={{
        background: "#fee2e2",
        color: "#991b1b",
        padding: 12,
        borderRadius: 12,
        border: "1px solid #fecaca",
        fontSize: 14,
      }}
    >
      <strong>⚠️ Oops!</strong> {message}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="detail">
      <div className="detail-hero shimmer" />
      <div className="detail-body">
        <div className="shimmer skel-bar" style={{ height: 16, width: "40%" }} />
        <div
          className="shimmer skel-bar"
          style={{ height: 10, width: "70%", marginTop: 10 }}
        />
        <div
          className="shimmer skel-bar"
          style={{ height: 10, width: "55%", marginTop: 6 }}
        />
        <div className="meta-grid" style={{ marginTop: 18 }}>
          <div className="shimmer skel-bar" style={{ height: 48 }} />
          <div className="shimmer skel-bar" style={{ height: 48 }} />
          <div className="shimmer skel-bar" style={{ height: 48 }} />
        </div>
        <div className="map-card" style={{ marginTop: 18 }}>
          <div className="shimmer" style={{ height: 260 }} />
        </div>
      </div>
    </div>
  );
}

/* -------- Opening Hours helpers -------- */
function normalizeDay(input: string): string | null {
  const clean = input.replace(":", "").trim().toLowerCase();
  const map: Record<string, string> = {
    mon: "Monday",
    monday: "Monday",
    tue: "Tuesday",
    tuesday: "Tuesday",
    tues: "Tuesday",
    wed: "Wednesday",
    wednesday: "Wednesday",
    weds: "Wednesday",
    thu: "Thursday",
    thursday: "Thursday",
    thur: "Thursday",
    thurs: "Thursday",
    fri: "Friday",
    friday: "Friday",
    sat: "Saturday",
    saturday: "Saturday",
    sun: "Sunday",
    sunday: "Sunday",
  };
  const key = Object.keys(map).find((k) => clean.startsWith(k));
  return key ? map[key] : null;
}

const WEEK_ORDER = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

function parseOpeningHours(lines: string[] | undefined) {
  const parsed: Record<string, string> = {};
  (lines ?? []).forEach((line) => {
    const idx = line.indexOf(":");
    if (idx < 0) return;
    const day = normalizeDay(line.slice(0, idx));
    const hours = line.slice(idx + 1).trim();
    if (day) parsed[day] = hours || "—";
  });
  return parsed;
}

function getTodayName(): string {
  return new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(
    new Date()
  );
}

/* ----------------- Main Component ----------------- */
export default function RestaurantDetail() {
  const { placeId } = useParams<{ placeId: string }>();

  // Fetch restaurant details
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["restaurant", placeId],
    enabled: !!placeId,
    queryFn: async () => {
      const res = await api.get<Restaurant | { error: string }>(
        `/restaurants/${placeId}`
      );
      return res.data;
    },
  });

  // Google Maps loader
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  });

  // Backend URL (used to prefix photo routes)
  const baseURL =
    (api as any)?.defaults?.baseURL ||
    (import.meta as any)?.env?.VITE_API_URL ||
    "http://localhost:4000";

  // Loading & error states
  if (!placeId) return <p>Missing placeId</p>;
  if (isLoading) return <DetailSkeleton />;
  if (isError) return <ErrorBox message={(error as Error).message} />;

  if ((data as any)?.error) {
    return (
      <div className="container" style={{ paddingTop: 18 }}>
        <Link to="/" className="back-link">
          ← Back
        </Link>
        <h2>Not implemented yet</h2>
      </div>
    );
  }

  const r = data as Restaurant;

  /* ---------- Collect multiple photos for the carousel ---------- */
  const carouselUrls: string[] = [];

  // backend returns: photos[] with names (proxy via /photos/v1)
  if (Array.isArray(r.photos) && r.photos.length > 0) {
    for (const ph of r.photos) {
      if (ph?.name) {
        carouselUrls.push(
          `${baseURL}/photos/v1/${encodeURIComponent(ph.name)}?maxwidth=1200`
        );
      }
    }
  }

  // also include the single photoUrl as fallback
  if (r.photoUrl) {
    // note: r.photoUrl is relative, so prefix baseURL
    carouselUrls.unshift(`${baseURL}${r.photoUrl}`);
  }

  // remove duplicates
  const photoUrls = Array.from(new Set(carouselUrls));

  // link to Google Maps app
  const mapsLink = r.location
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${r.name} ${r.address ?? ""}`
      )}&query_place_id=${encodeURIComponent(r.placeId)}`
    : undefined;

  const hoursByDay = parseOpeningHours(r.openingHours);
  const todayName = getTodayName();

  // slider settings for hero
  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 4000,
    pauseOnHover: true,
    adaptiveHeight: false,
  };

  return (
    <div className="container" style={{ paddingTop: 18 }}>
      <Link to="/" className="back-link">
        ← Back
      </Link>

      <div className="detail">
        {/* HERO (carousel) */}
        <div className="detail-hero">
          {photoUrls.length > 0 ? (
            <Slider {...sliderSettings} className="hero-carousel">
              {photoUrls.map((url: string, i: number) => (
                <div key={i} className="hero-slide">
                  <img
                    src={url}
                    alt={`${r.name}-${i}`}
                    className="detail-hero-img"
                  />
                </div>
              ))}
            </Slider>
          ) : (
            <div className="detail-hero-placeholder">No Photo</div>
          )}

          {/* Overlay title */}
          <div className="detail-hero-grad" />
          <div className="detail-hero-title">
            <h1 className="detail-title">{r.name}</h1>
            {typeof r.rating === "number" && (
              <span className="rating-badge">⭐ {r.rating.toFixed(1)}</span>
            )}
          </div>
        </div>

        {/* BODY */}
        <div className="detail-body">
          <p className="detail-address">{r.address ?? "—"}</p>

          {/* META GRID */}
          <div className="meta-grid">
            <div className="meta-item">
              <div className="meta-icon">📍</div>
              <div className="meta-text">
                <div className="meta-label">Address</div>
                <div className="meta-value">{r.address ?? "—"}</div>
              </div>
            </div>

            <div className="meta-item">
              <div className="meta-icon">📞</div>
              <div className="meta-text">
                <div className="meta-label">Phone</div>
                <div className="meta-value">{r.phone ?? "—"}</div>
              </div>
            </div>

            <div className="meta-item">
              <div className="meta-icon">🌐</div>
              <div className="meta-text">
                <div className="meta-label">Website</div>
                <div className="meta-value">
                  {r.website ? (
                    <a
                      href={r.website}
                      target="_blank"
                      rel="noreferrer"
                      className="underline"
                    >
                      {r.website.replace(/^https?:\/\//, "")}
                    </a>
                  ) : (
                    "—"
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* OPENING HOURS */}
          {r.openingHours && r.openingHours.length > 0 && (
            <div className="hours">
              <div className="hours-title">Opening hours</div>
              <div className="hours-table">
                {WEEK_ORDER.map((day) => {
                  const hours = hoursByDay[day] ?? "—";
                  const isToday =
                    day.toLowerCase() === todayName.toLowerCase();
                  return (
                    <div
                      key={day}
                      className={`hours-row${isToday ? " is-today" : ""}`}
                    >
                      <div className="hours-day">
                        {day}
                        {isToday && (
                          <span className="hours-today-badge">Today</span>
                        )}
                      </div>
                      <div className="hours-time">{hours}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ACTIONS */}
          <div className="detail-actions">
            {mapsLink && (
              <a
                href={mapsLink}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
              >
                Open in Google Maps
              </a>
            )}
          </div>

          {/* MAP */}
          {r.location && (
            <div className="map-card" style={{ marginTop: 18 }}>
              {loadError && <div style={{ padding: 12 }}>Failed to load map.</div>}
              {!isLoaded && !loadError && (
                <div style={{ padding: 12 }}>Loading map…</div>
              )}
              {isLoaded && (
                <GoogleMap
                  mapContainerStyle={{
                    width: "100%",
                    height: 280,
                    borderRadius: 16,
                  }}
                  center={{ lat: r.location.lat, lng: r.location.lng }}
                  zoom={15}
                  options={{
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                    clickableIcons: false,
                    zoomControl: true,
                    gestureHandling: "greedy",
                  }}
                >
                  <Marker
                    position={{ lat: r.location.lat, lng: r.location.lng }}
                    title={r.name}
                  />
                </GoogleMap>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
