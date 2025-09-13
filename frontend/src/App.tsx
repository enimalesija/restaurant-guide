import { Routes, Route, Navigate } from "react-router-dom";
import RestaurantsList from "./pages/RestaurantsList";
import RestaurantDetail from "./pages/RestaurantDetail";

/**
 * Main app routes
 */
export default function App() {
  return (
    <Routes>
      {/* Home → list of restaurants */}
      <Route path="/" element={<RestaurantsList />} />

      {/* Detail page by placeId */}
      <Route path="/r/:placeId" element={<RestaurantDetail />} />

      {/* Catch-all → redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
