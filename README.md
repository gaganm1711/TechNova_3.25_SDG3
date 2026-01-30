# Smart Ambulance Routing System 🚑

**Overview**
A full-stack prototype that optimizes ambulance routing using patient condition, hospital capacity, and real-time routing. Built with open-source tools:

- Frontend: React + Vite + Tailwind CSS + MapLibre + OpenStreetMap
- Backend: FastAPI (Python)
- Database: Supabase (PostgreSQL)
- Maps & Routing: OpenStreetMap + OSRM
- Real-time: WebSockets
- AI: Rule-based priority engine (Python)

---

## Project structure
```
/smart-ambulance-routing
  /frontend
    /src
      /components
      /pages
      /services
      /maps
      App.jsx
      main.jsx
  /backend
    main.py
    /models
    /routes
    /ai
    /db
  README.md
```

---

## Quick start

Prerequisites:
- Node.js (>=16)
- Python 3.10+
- Docker (for OSRM) or access to an OSRM server
- Supabase account (or local Postgres) — see `.env.example`

1) Backend

```bash
# create & activate venv
python -m venv .venv
.\.venv\Scripts\activate
pip install -r backend/requirements.txt
# initialize DB & seed sample data
python backend/db/init_db.py
# start backend
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

2) Frontend

```bash
cd frontend
npm install
npm run dev
```

3) OSRM

You can run OSRM via Docker:

```bash
docker run -p 5000:5000 -t osrm/osrm-backend osrm-routed --algorithm mld /data/your-latest.osm.pbf
```

(See README details below for full OSRM setup and alternatives.)

---

See the rest of README for API docs, environment variables, and more.
