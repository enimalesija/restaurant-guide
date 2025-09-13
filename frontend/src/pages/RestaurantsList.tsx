import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import type { Restaurant } from "../types/restaurant";
import { useState, useEffect, useRef } from "react";
import { useLoadScript } from "@react-google-maps/api";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import GoogleMapWrapper from "../components/GoogleMapWrapper";

/* -------- Skeleton + Error UI -------- */
function SkeletonCard() {
  return (
    <div className="skel">
      <div className="shimmer skel-img skel-bar" />
      <div
        className="shimmer skel-bar"
        style={{ height: 10, width: "70%", marginTop: 10 }}
      />
      <div
        className="shimmer skel-bar"
        style={{ height: 8, width: "40%", marginTop: 6 }}
      />
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div
      style={{
        background: "#fee2e2",
        color: "#991b1b",
        padding: 10,
        borderRadius: 12,
        border: "1px solid #fecaca",
        fontSize: 14,
      }}
    >
      <strong>⚠️ Oops!</strong> {message}
    </div>
  );
}

/* ---------------- Component ---------------- */
export default function RestaurantsList() {
  // Search + filters state
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [page, setPage] = useState(1);
  const [radius, setRadius] = useState(5000);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [sortBy, setSortBy] = useState("best");
  const [openNowOnly, setOpenNowOnly] = useState(false);

  // Mobile filters modal
  const [showFiltersModal, setShowFiltersModal] = useState(false);

  // Language dropdown
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement | null>(null);
  const languages = [
    { code: "en", label: "English" },
    { code: "sv", label: "Svenska" },
    { code: "fr", label: "Français" },
    { code: "es", label: "Español" },
    { code: "de", label: "Deutsch" },
    { code: "el", label: "Ελληνικά" },
  ];

  const handleLanguageChange = (code: string) => {
    const selectEl =
      document.querySelector<HTMLSelectElement>(".goog-te-combo");
    if (selectEl) {
      selectEl.value = code;
      selectEl.dispatchEvent(new Event("change"));
    }
    setLangOpen(false);
  };

  // Close language dropdown on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!langRef.current) return;
      if (!langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Load Google Maps
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string,
  });

  // Fetch restaurants (react-query)
  const { data, isLoading, isError, error, isFetching } = useQuery<
    Restaurant[]
  >({
    queryKey: ["restaurants", query, category, minRating, page, radius],
    queryFn: async (): Promise<Restaurant[]> => {
      const params = new URLSearchParams();
      const qFinal = category ? category : query;
      if (qFinal) params.set("q", qFinal);
      if (minRating > 0) params.set("minRating", String(minRating));
      params.set("page", String(page));
      params.set("limit", "30");
      params.set("radius", String(radius));
      const res = await api.get<Restaurant[]>(
        "/restaurants?" + params.toString()
      );
      return res.data;
    },
    placeholderData: (prev) => prev,
  });

  // Append or reset list
  useEffect(() => {
    if (data) {
      setRestaurants((prev) => (page === 1 ? data : [...prev, ...data]));
    }
  }, [data, page]);

  // Apply filters + sorting
  const filteredRestaurants = restaurants
    .filter((r) => (openNowOnly ? r.openNow : true))
    .sort((a, b) => {
      if (sortBy === "best") return (b.rating ?? 0) - (a.rating ?? 0);
      if (sortBy === "closest")
        return (a.location?.lat ?? 0) - (b.location?.lat ?? 0); 
      if (sortBy === "reviewed")
        return (b.userRatingsTotal ?? 0) - (a.userRatingsTotal ?? 0);
      return 0;
    });

  // Reset all filters
  const clearFilters = () => {
    setQuery("");
    setCategory("");
    setMinRating(0);
    setRadius(5000);
    setSortBy("best");
    setOpenNowOnly(false);
    setPage(1);
  };

  // Dynamic baseURL 
  const baseURL =
    (api as any)?.defaults?.baseURL ||
    (import.meta as any)?.env?.VITE_API_URL ||
    "http://localhost:4000";

  return (
    <div>
      {/* ---------------- Header ---------------- */}
      <header className="sticky-nav">
        <div className="hero-inner container header-row">
          <div className="logo-block">
            <h1 className="hero-title">
              <span className="logo-text">Stockholm Flavors</span>
            </h1>
          </div>

          <div className="header-controls">
            {/* Language selector Translator*/}
            <div className="lang-selector" ref={langRef}>
              <button
                className="lang-btn"
                onClick={() => setLangOpen((o) => !o)}
                title="Change language"
              >
                🌐
              </button>
              {langOpen && (
                <ul className="lang-dropdown">
                  {languages.map((lang) => (
                    <li
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                    >
                      {lang.label}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Dark mode toggle */}
            <button
              className="toggle"
              onClick={() =>
                document.documentElement.classList.toggle("dark")
              }
              aria-label="Toggle dark mode"
              title="Toggle dark mode"
            >
              🌙
            </button>
          </div>
        </div>
      </header>

      {/* ---------------- Toolbar (desktop) ---------------- */}
      <div className="container toolbar toolbar--in-header desktop-filters">
        <div className="tbar-row">
          {/* Search */}
          <div className="input-wrap">
            <span className="input-icon">
              <MagnifyingGlassIcon width={16} height={16} />
            </span>
            <input
              className="input"
              type="text"
              placeholder="Search restaurants..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setPage(1);
              }}
            />
          </div>

          {/* Category chips */}
          <div className="chips">
            {["Pizza", "Sushi", "Café", "Burgers", "Vegan"].map((c) => (
              <div
                key={c}
                className={`chip ${category === c ? "active" : ""}`}
                onClick={() => {
                  setCategory(c);
                  setQuery("");
                  setPage(1);
                }}
              >
                {c}
              </div>
            ))}
          </div>

          {/* Rating filter */}
          <div className="range-wrap">
            <span>Min ⭐</span>
            <input
              className="range"
              type="range"
              min={0}
              max={5}
              step={0.5}
              value={minRating}
              onChange={(e) => {
                setMinRating(Number(e.target.value));
                setPage(1);
              }}
            />
            <span>{minRating}+</span>
          </div>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="input"
            style={{ width: 160 }}
          >
            <option value="best">Best Rated</option>
            <option value="closest">Closest</option>
            <option value="reviewed">Most Reviewed</option>
          </select>

          {/* Radius dropdown */}
          <select
            value={radius}
            onChange={(e) => {
              setRadius(Number(e.target.value));
              setPage(1);
            }}
            className="input"
            style={{ width: 200 }}
          >
            <option value={5000}>Distance: 5 km (Near city center)</option>
            <option value={15000}>Distance: 15 km (Medium)</option>
            <option value={30000}>Distance: 30 km (Whole Stockholm)</option>
          </select>

          {/* Open now */}
          <div
            className="chip"
            onClick={() => setOpenNowOnly((v) => !v)}
            style={{ background: openNowOnly ? "#22c55e" : "" }}
          >
            {openNowOnly ? "Open Now" : "Open Now"}
          </div>

          {/* Clear filters */}
          <button
            className="btn"
            style={{ background: "#ef4444", marginLeft: 10 }}
            onClick={clearFilters}
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* ---------------- Toolbar (mobile) ---------------- */}
      <div className="container toolbar mobile-filters">
        <button className="btn" onClick={() => setShowFiltersModal(true)}>
          ⚙️ Filters
        </button>
      </div>

      {/* ---------------- Filters Modal (mobile) ---------------- */}
      {showFiltersModal && (
        <div className="filters-modal">
          <div className="filters-modal-content">
            <div className="filters-header">
              <h2>Filters</h2>
              <button onClick={() => setShowFiltersModal(false)}>✖</button>
            </div>

            {/* Filters inside modal */}
            <div className="input-wrap" style={{ marginBottom: 12 }}>
              <span className="input-icon">
                <MagnifyingGlassIcon width={16} height={16} />
              </span>
              <input
                className="input"
                type="text"
                placeholder="Search restaurants…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="chips">
              {["Pizza", "Sushi", "Café", "Burgers", "Vegan"].map((c) => (
                <div
                  key={c}
                  className={`chip ${category === c ? "active" : ""}`}
                  onClick={() => {
                    setCategory(c);
                    setQuery("");
                    setPage(1);
                  }}
                >
                  {c}
                </div>
              ))}
            </div>

            <div className="range-wrap">
              <span>Min ⭐</span>
              <input
                className="range"
                type="range"
                min={0}
                max={5}
                step={0.5}
                value={minRating}
                onChange={(e) => {
                  setMinRating(Number(e.target.value));
                  setPage(1);
                }}
              />
              <span>{minRating}+</span>
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input"
              style={{ width: "100%", marginTop: 10 }}
            >
              <option value="best">Best Rated</option>
              <option value="closest">Closest</option>
              <option value="reviewed">Most Reviewed</option>
            </select>

            <select
              value={radius}
              onChange={(e) => {
                setRadius(Number(e.target.value));
                setPage(1);
              }}
              className="input"
              style={{ width: "100%", marginTop: 10 }}
            >
              <option value={5000}>Distance: 5 km (Near city center)</option>
              <option value={15000}>Distance: 15 km (Medium)</option>
              <option value={30000}>Distance: 30 km (Whole Stockholm)</option>
            </select>

            <div
              className="chip"
              onClick={() => setOpenNowOnly((v) => !v)}
              style={{
                background: openNowOnly ? "#22c55e" : "",
                marginTop: 10,
              }}
            >
              {openNowOnly ? "Open Now" : "Open Now"}
            </div>

            <div className="modal-actions">
              <button className="btn danger" onClick={clearFilters}>
                Clear Filters
              </button>
              <button className="btn" onClick={() => setShowFiltersModal(false)}>
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- Layout ---------------- */}
      <div className="container list-grid">
        {/* Map */}
        <aside className="map-wrap">
          <div className="map-card">
            {loadError && <div style={{ padding: 12 }}>Failed to load map.</div>}
            {!isLoaded && !loadError && (
              <div style={{ padding: 12 }}>Loading map…</div>
            )}
            {isLoaded && (
              <GoogleMapWrapper restaurants={filteredRestaurants} />
            )}
          </div>
        </aside>

        {/* Cards */}
        <section className="cards-scroll">
          {isLoading && page === 1 && (
            <div className="grid section--tight">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {isError && (
            <div className="section--tight">
              <ErrorBox message={(error as Error).message} />
            </div>
          )}

          {!isError && filteredRestaurants.length > 0 && (
            <>
              <div className="grid section--tight">
                {filteredRestaurants.map((r, idx) => (
                  <Link to={`/r/${r.placeId}`} key={r.placeId}>
                    <article
                      className="card"
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
                      {r.photoUrl ? (
                        <img
                          src={`${baseURL}${r.photoUrl}`} // ✅ dynamic
                          alt={r.name}
                          className="card-img"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="card-img--placeholder">No Photo</div>
                      )}
                      <div className="card-body">
                        <h2 className="card-title">{r.name}</h2>
                        <p className="card-sub">{r.address ?? "—"}</p>
                        {r.rating !== undefined && (
                          <span className="rating-badge">
                            ⭐ {r.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </article>
                  </Link>
                ))}
              </div>

              <div style={{ textAlign: "center", marginTop: 20 }}>
                <button
                  className="btn"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={isFetching}
                >
                  {isFetching ? "Loading…" : "Load more"}
                </button>
              </div>
            </>
          )}

          {!isLoading && !isError && filteredRestaurants.length === 0 && (
            <div
              className="section--tight"
              style={{ textAlign: "center", padding: "40px 0" }}
            >
              <div style={{ fontSize: 44 }}>🔍</div>
              <p style={{ margin: "10px 0 6px", fontWeight: 700 }}>
                No restaurants found
              </p>
              <p style={{ margin: 0, color: "#64748b" }}>
                Try another search or remove filters.
              </p>
            </div>
          )}
        </section>
      </div>

      {/* ---------------- Footer ---------------- */}
      <footer className="footer">
        <div className="footer-container">
          <div>
            <p style={{ fontSize: "14px", color: "#cbd5e1" }}>
              Discover the best restaurants experiences in Stockholm.
            </p>
            <div className="footer-social">
              <a href="#">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <a href="#">About Us</a>
              </li>
              <li>
                <a href="#">Contact</a>
              </li>
              <li>
                <a href="#">Privacy Policy</a>
              </li>
              <li>
                <a href="#">Terms of Service</a>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Explore</h4>
            <ul>
              <li>
                <a href="#">Top Restaurants</a>
              </li>
              <li>
                <a href="#">Guides</a>
              </li>
              <li>
                <a href="#">Events</a>
              </li>
              <li>
                <a href="#">Blog</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          © {new Date().getFullYear()} Developed by:{" "}
          <a
            href="https://amalesija.se"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "rgb(255 197 25)" }}
          >
            A.Malesija
          </a>
          .
        </div>
      </footer>
    </div>
  );
}
