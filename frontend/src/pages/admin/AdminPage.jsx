import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin, getAdminDashboard, dispatchAllAmbulances, releaseAllAmbulances, markPatientReached, setAuthToken, getAuthToken, clearAuthToken, getSystemLogs } from "../../api";

export default function AdminPage() {
  const navigate = useNavigate();

  // AUTH
  const [loggedIn, setLoggedIn] = useState(!!getAuthToken());
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // MAP
  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const patientMarker = useRef(null);
  const ambulanceMarkers = useRef({});
  const hospitalMarker = useRef(null);

  // DATA
  const [patient, setPatient] = useState(null);
  const [ambulances, setAmbulances] = useState([]);
  const [hospital, setHospital] = useState(null);
  const [logs, setLogs] = useState([]);

  // LOAD LEAFLET
  useEffect(() => {
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
    if (!window.L) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      document.body.appendChild(script);
    }
  }, []);

  // LOGIN
  const login = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminLogin(username, password);
      setAuthToken(response.access_token);
      setLoggedIn(true);
      setUsername("");
      setPassword("");
      setLogs(l => ["✓ Admin logged in", ...l]);
    } catch (err) {
      setError(err.message || "Login failed");
      setLogs(l => ["✗ Login failed: " + (err.message || "Invalid credentials"), ...l]);
    } finally {
      setLoading(false);
    }
  };

  // LOGOUT
  const logout = () => {
    clearAuthToken();
    setLoggedIn(false);
    setLogs(l => ["Admin logged out", ...l]);
  };

  // INIT MAP
  useEffect(() => {
    if (!loggedIn || !window.L || mapObj.current) return;

    mapObj.current = window.L.map(mapRef.current).setView([21.1458, 79.0882], 13);
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapObj.current);
  }, [loggedIn]);

  // POLL DASHBOARD
  useEffect(() => {
    if (!loggedIn) return;

    const pollDashboard = async () => {
      try {
        const data = await getAdminDashboard();
        setPatient(data.patient);
        setAmbulances(data.ambulances);
        setHospital(data.hospital);
        updateMapMarkers(data);
      } catch (err) {
        if (err.message.includes("401")) {
          logout();
        }
        console.error("Dashboard poll failed:", err);
      }
    };

    pollDashboard();
    const interval = setInterval(pollDashboard, 1000);
    return () => clearInterval(interval);
  }, [loggedIn]);

  // UPDATE MAP MARKERS
  const updateMapMarkers = (data) => {
    if (!mapObj.current || !window.L) return;

    const { patient, ambulances, hospital } = data;

    // Patient marker (red)
    if (patient && patient.location) {
      if (!patientMarker.current) {
        patientMarker.current = window.L.circleMarker(
          [patient.location.lat, patient.location.lng],
          { color: "red", radius: 12, weight: 3 }
        )
          .addTo(mapObj.current)
          .bindPopup(`<b>${patient.name}</b><br>Status: ${patient.status}`);
      } else {
        patientMarker.current.setLatLng([patient.location.lat, patient.location.lng]);
      }
    }

    // Ambulance markers (blue)
    ambulances.forEach((amb) => {
      const key = amb.ambulanceId;
      if (!ambulanceMarkers.current[key]) {
        ambulanceMarkers.current[key] = window.L.circleMarker(
          [amb.location.lat, amb.location.lng],
          { color: amb.status === "AVAILABLE" ? "blue" : "orange", radius: 10, weight: 2 }
        )
          .addTo(mapObj.current)
          .bindPopup(`<b>${amb.driverName}</b><br>${amb.status}`);
      } else {
        ambulanceMarkers.current[key]
          .setLatLng([amb.location.lat, amb.location.lng])
          .setStyle({ color: amb.status === "AVAILABLE" ? "blue" : "orange" });
      }
    });

    // Hospital marker (green)
    if (hospital && hospital.location) {
      if (!hospitalMarker.current) {
        hospitalMarker.current = window.L.circleMarker(
          [hospital.location.lat, hospital.location.lng],
          { color: "green", radius: 12, weight: 3 }
        )
          .addTo(mapObj.current)
          .bindPopup(`<b>${hospital.name}</b><br>Beds: ${hospital.generalBeds}`);
      } else {
        hospitalMarker.current.setLatLng([hospital.location.lat, hospital.location.lng]);
      }
    }

    if (mapObj.current && patient && patient.location) {
      mapObj.current.setView([patient.location.lat, patient.location.lng], 13);
    }
  };

  // ACTION HANDLERS
  const handleDispatch = async () => {
    try {
      await dispatchAllAmbulances();
      setLogs(l => ["✓ All ambulances dispatched", ...l]);
    } catch (err) {
      setLogs(l => ["✗ Dispatch failed: " + err.message, ...l]);
    }
  };

  const handleRelease = async () => {
    try {
      await releaseAllAmbulances();
      setLogs(l => ["✓ All ambulances released", ...l]);
    } catch (err) {
      setLogs(l => ["✗ Release failed: " + err.message, ...l]);
    }
  };

  const handleMarkReached = async () => {
    if (!patient || !patient.patientId) return;
    try {
      await markPatientReached(patient.patientId);
      setLogs(l => ["✓ Patient marked as reached", ...l]);
    } catch (err) {
      setLogs(l => ["✗ Mark reached failed: " + err.message, ...l]);
    }
  };

  return (
    <>
      <style>{`
* {
  box-sizing: border-box;
  font-family: Segoe UI;
}
body {
  margin: 0;
  background: radial-gradient(circle at top, #021b3a, #020612);
  color: white;
}

.nav {
  height: 60px;
  background: linear-gradient(90deg, #001933, #0044aa, #001933);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  box-shadow: 0 0 40px rgba(0, 150, 255, 0.6);
}
.nav span {
  margin-left: 30px;
  cursor: pointer;
  padding: 8px 18px;
  border-radius: 20px;
  transition: 0.3s;
}
.nav span:hover {
  background: rgba(0, 150, 255, 0.2);
}
.nav-active {
  background: linear-gradient(45deg, #00aaff, #0066ff);
  box-shadow: 0 0 20px rgba(0, 150, 255, 0.8);
}

.layout {
  display: grid;
  grid-template-columns: 450px 1fr;
  height: calc(100vh - 60px);
}

.left {
  padding: 20px;
  background: rgba(0, 20, 50, 0.8);
  border-right: 1px solid rgba(0, 150, 255, 0.3);
  overflow: auto;
}

.section {
  background: linear-gradient(160deg, #021b3a, #020812);
  border-radius: 16px;
  padding: 18px;
  margin-bottom: 18px;
  box-shadow: 0 0 40px rgba(0, 150, 255, 0.4);
  border: 1px solid rgba(0, 150, 255, 0.4);
}
.section h3 {
  color: #66ccff;
}

input, button, select {
  width: 100%;
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 10px;
  border: none;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  border: 1px solid rgba(0, 150, 255, 0.4);
}
button {
  cursor: pointer;
  background: linear-gradient(45deg, #00aaff, #0066ff);
  box-shadow: 0 15px 40px rgba(0, 150, 255, 0.6);
  transition: 0.2s;
}
button:hover {
  transform: translateY(-2px);
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error {
  background: rgba(255, 100, 100, 0.2);
  border: 1px solid #ff6464;
  color: #ff9999;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 12px;
}

.right {
  padding: 12px;
  display: grid;
  grid-template-rows: 1fr minmax(0, 200px);
  gap: 12px;
}

#map {
  width: 100%;
  height: 100%;
  border-radius: 20px;
  box-shadow: 0 0 40px rgba(0, 150, 255, 0.6);
  border: 1px solid rgba(0, 150, 255, 0.4);
}

.logs {
  background: linear-gradient(160deg, #021b3a, #020812);
  border-radius: 16px;
  padding: 12px;
  border: 1px solid rgba(0, 150, 255, 0.4);
  height: 100%;
  overflow-y: auto;
  font-size: 12px;
}
.log-entry {
  padding: 4px 8px;
  border-bottom: 1px solid rgba(0, 150, 255, 0.2);
  color: #99ddff;
}

.stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
}
.stat {
  background: linear-gradient(160deg, rgba(0, 150, 255, 0.12), rgba(0, 50, 100, 0.1));
  padding: 12px;
  border-radius: 10px;
  border: 1px solid rgba(0, 150, 255, 0.35);
}
.stat h4 {
  color: #66ccff;
  margin: 0;
}
.stat p {
  margin: 4px 0 0 0;
  color: #e0f3ff;
}
      `}</style>

      <div className="nav">
        <b>🚨 ADMIN DASHBOARD</b>
        <div>
          <span onClick={() => navigate("/")}>Emergency</span>
          <span onClick={() => navigate("/hospital")}>Hospitals</span>
          <span onClick={() => navigate("/ambulance")}>Ambulances</span>
          <span className="nav-active">Admin</span>
        </div>
      </div>

      {!loggedIn ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "calc(100vh - 60px)", background: "rgba(0, 20, 50, 0.9)" }}>
          <div className="section" style={{ width: "350px" }}>
            <h2 style={{ textAlign: "center", color: "#66ccff" }}>Admin Login</h2>
            {error && <div className="error">{error}</div>}
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && login()}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && login()}
            />
            <button onClick={login} disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </div>
      ) : (
        <div className="layout">
          <div className="left">
            <div className="stats">
              <div className="stat">
                <h4>🚑 Ambulances</h4>
                <p>{ambulances.length} total</p>
              </div>
              <div className="stat">
                <h4>👤 Patient</h4>
                <p>{patient?.name || "None"}</p>
              </div>
            </div>

            {patient && (
              <div className="section">
                <h3>Patient Details</h3>
                <p><b>Name:</b> {patient.name}</p>
                <p><b>Age:</b> {patient.age}</p>
                <p><b>Condition:</b> {patient.condition}</p>
                <p><b>Status:</b> {patient.status}</p>
                <p><b>Priority:</b> {patient.priority}</p>
              </div>
            )}

            {hospital && (
              <div className="section">
                <h3>Assigned Hospital</h3>
                <p><b>Name:</b> {hospital.name}</p>
                <p><b>General Beds:</b> {hospital.generalBeds}</p>
                <p><b>ICU Beds:</b> {hospital.icuBeds}</p>
                <p><b>Distance:</b> {hospital.distance?.toFixed(2)} km</p>
              </div>
            )}

            <div className="section">
              <h3>Actions</h3>
              <button onClick={handleDispatch}>🚨 Dispatch All</button>
              <button onClick={handleRelease}>✋ Release All</button>
              <button onClick={handleMarkReached}>✓ Mark Reached</button>
              <button onClick={logout} style={{ marginTop: "20px", background: "#ff6666" }}>
                Logout
              </button>
            </div>
          </div>

          <div className="right">
            <div id="map" ref={mapRef}></div>
            <div className="logs">
              <div style={{ color: "#66ccff", fontWeight: "bold", marginBottom: "8px" }}>
                System Logs
              </div>
              {logs.map((log, i) => (
                <div key={i} className="log-entry">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
