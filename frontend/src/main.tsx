import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./index.css";

// react-slick styles
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Create React Query client (for caching & deduplication)
const queryClient = new QueryClient();

// Bootstrap React app
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
