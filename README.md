# 🍽️ Stockholm Flavors – Restaurant Guide

This is a full-stack web application to explore restaurants in Stockholm for an assigment purpose. 
Built with **React + Vite** on the frontend, **Fastify + TypeScript** on the backend, and fully containerized using **Docker & Docker Compose**.  
The app integrates with the **Google Places API** to fetch real-time restaurant data, details, and photos.

---

## 🚀 Features

- 🔍 **Search & Filter** restaurants by category, distance, rating, and “open now”
- 🗺️ **Interactive Map** with restaurant markers (Google Maps API)
- ⭐ **Restaurant Details Page** with carousel photos, opening hours, contact info, and direct Google Maps link
- 📱 **Responsive UI** with desktop filters & mobile filter modal
- 🌐 **Multi-language Support** (Google Translate integration)
- 🌓 **Dark Mode Toggle**
- ⚡ **Optimized API proxy** on backend to securely fetch Google Places data

---

## 🛠️ Tech Stack

**Frontend**
- React + TypeScript
- Vite
- React Query
- React Router
- Google Maps API (`@react-google-maps/api`)
- Tailwind CSS + custom components

**Backend**
- Fastify
- TypeScript
- Google Places API (v1)
- CORS enabled for frontend requests

**Infrastructure**
- Docker
- Docker Compose
- Nginx (to serve frontend build)

---

## 📦 Project Structure

```
restaurant-guide/
│
├── backend/              # Fastify backend (API + Google Places proxy)
│   ├── src/
│   │   ├── index.ts      # API routes (restaurants, details, photos)
│   │   └── places.ts     # Google Places API integration
│   ├── Dockerfile
│   └── package.json
│
├── frontend/             # React + Vite frontend
│   ├── src/
│   │   ├── pages/        # RestaurantsList, RestaurantDetail
│   │   └── components/
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml    # Orchestration for frontend + backend
└── README.md
```

---

## ⚙️ Setup & Running Locally

### 1️⃣ Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/restaurant-guide.git
cd restaurant-guide
```

### 2️⃣ Environment Variables

Create a `.env` file in the project root:

```env
# Backend
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Frontend
VITE_API_URL=http://localhost:4000
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```
You will need 2 API keys. One for front-end one for back-end.
👉 Make sure your **Google Cloud Console** project has these APIs enabled:
- **Places API**
- **Maps JavaScript API**

### 3️⃣ Run with Docker Compose
```bash
docker compose up --build
```

- Frontend: [http://localhost:3000](http://localhost:3000)  
- Backend API: [http://localhost:4000/restaurants](http://localhost:4000/restaurants)  

---

## 🧪 Testing

Check if everything works:

- **Backend health**: [http://localhost:4000/health](http://localhost:4000/health) → `{ "ok": true }`
- **Restaurant list**: [http://localhost:4000/restaurants?q=pizza](http://localhost:4000/restaurants?q=pizza)
- **Frontend UI**: Visit [http://localhost:3000](http://localhost:3000)

---

## 🐳 Dockerfiles

Both frontend and backend are fully containerized.

- `backend/Dockerfile` → builds TypeScript and runs Fastify server
- `frontend/Dockerfile` → builds React app and serves via Nginx
- `docker-compose.yml` → orchestrates services (frontend ↔ backend)

---

## 📸 Screenshots

### Home (Restaurant List)
<img width="1914" height="911" alt="image" src="https://github.com/user-attachments/assets/99617cf0-b833-43ed-906e-7b3c896d1d3e" />


### Restaurant Detail
<img width="1884" height="902" alt="image" src="https://github.com/user-attachments/assets/baf5ac3c-a7d6-49b2-990a-08e2978a6335" />


---

## 📑 Assignment Deliverables

- ✅ **Containerization with Docker** (frontend + backend have Dockerfiles)
- ✅ **Perfect containerization with Docker Compose** (frontend ↔ backend orchestrated)
- ✅ **Environment configuration** with `.env`
- ✅ **Google Places API integration** for real restaurant data
- ✅ **Frontend + Backend fully working locally in Docker**

---

## 👨‍💻 Author

Developed by **[A. Malesija](https://amalesija.se)**

---

## 📜 License

MIT License – feel free to use and adapt.
