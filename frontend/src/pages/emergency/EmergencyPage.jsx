import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestAmbulance, getEmergencyStatus, getMapState } from "../../api";

export default function EmergencyPage() {
  const navigate = useNavigate();

  const [patientName, setPatientName] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [condition, setCondition] = useState("cardiac");
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState("IDLE");
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState(null);
  const [patientId, setPatientId] = useState(null);
  const [ambulanceId, setAmbulanceId] = useState(null);
  const [eta, setEta] = useState(null);
  const [loading, setLoading] = useState(false);

  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const patientMarker = useRef(null);
  const ambulanceMarker = useRef(null);
  const hospitalMarker = useRef(null);

  // Load Leaflet
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

  // Timer
  useEffect(() => {
    if (status === "DISPATCHED") {
      const t = setInterval(() => setTimer((s) => s + 1), 1000);
      return () => clearInterval(t);
    }
  }, [status]);

  // Poll map state
  useEffect(() => {
    if (status !== "DISPATCHED" || !patientId) return;

    const interval = setInterval(async () => {
      try {
        const mapState = await getMapState();
        if (mapState.patient && mapState.ambulances && mapState.hospitals) {
          updateMapMarkers(mapState);
          setEta(mapState.patient.ambulanceETA || eta);
        }
      } catch (err) {
        console.error("Map update failed:", err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [status, patientId]);

  // Initialize map
  useEffect(() => {
    if (!location || !window.L || mapObj.current) return;

    mapObj.current = window.L.map(mapRef.current).setView(
      [location.lat, location.lng],
      14
    );
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapObj.current);
  }, [location]);

  // Update markers
  const updateMapMarkers = (mapState) => {
    if (!mapObj.current || !window.L) return;

    const patient = mapState.patient;
    const hospitals = mapState.hospitals;
    const ambulances = mapState.ambulances;

    // Patient marker (red)
    if (patient && patient.location) {
      if (!patientMarker.current) {
        patientMarker.current = window.L.circleMarker(
          [patient.location.lat, patient.location.lng],
          { color: "red", radius: 12, weight: 3 }
        )
          .addTo(mapObj.current)
          .bindPopup(`<b>${patient.name}</b><br>${patient.status}`);
      } else {
        patientMarker.current.setLatLng([patient.location.lat, patient.location.lng]);
      }
    }

    // Ambulance marker (blue)
    if (patient && patient.ambulanceLocation && ambulances.length > 0) {
      const amb = ambulances.find(a => a.ambulanceId === patient.ambulanceId);
      if (amb) {
        if (!ambulanceMarker.current) {
          ambulanceMarker.current = window.L.circleMarker(
            [amb.location.lat, amb.location.lng],
            { color: "blue", radius: 10, weight: 2 }
          )
            .addTo(mapObj.current)
            .bindPopup(`<b>${amb.driverName}</b><br>ETA: ${patient.ambulanceETA}s`);
        } else {
          ambulanceMarker.current.setLatLng([amb.location.lat, amb.location.lng]);
        }
      }
    }

    // Hospital marker (green)
    if (patient && patient.hospitalLocation && hospitals.length > 0) {
      const hosp = hospitals.find(h => h.hospitalId === patient.hospitalId);
      if (hosp) {
        if (!hospitalMarker.current) {
          hospitalMarker.current = window.L.circleMarker(
            [hosp.location.lat, hosp.location.lng],
            { color: "green", radius: 12, weight: 3 }
          )
            .addTo(mapObj.current)
            .bindPopup(`<b>${hosp.name}</b><br>Beds: ${hosp.generalBeds}`);
        } else {
          hospitalMarker.current.setLatLng([hosp.location.lat, hosp.location.lng]);
        }
      }
    }
  };

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
  };

  const dispatch = async () => {
    if (!location) {
      setError("Please get your location first");
      return;
    }
    if (!patientName) {
      setError("Please enter your name");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await requestAmbulance(
        patientName,
        patientAge,
        condition,
        location.lat,
        location.lng
      );

      setPatientId(response.patientId);
      setAmbulanceId(response.assignedAmbulanceId);
      setEta(response.eta);
      setStatus("DISPATCHED");
      setTimer(0);
    } catch (err) {
      setError(err.message || "Failed to request ambulance");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
*{box-sizing:border-box;font-family:Segoe UI}
body{
margin:0;
background:radial-gradient(circle at top,#021b3a,#020612);
color:white;
}

/* NAV */
.nav{
height:60px;
background:linear-gradient(90deg,#001933,#0044aa,#001933);
display:flex;
align-items:center;
justify-content:space-between;
padding:0 30px;
box-shadow:0 0 40px rgba(0,150,255,.6);
}
.nav span{
margin-left:30px;
cursor:pointer;
padding:8px 18px;
border-radius:20px;
transition:.3s;
}
.nav span:hover{background:rgba(0,150,255,.2)}
.nav-active{
background:linear-gradient(45deg,#00aaff,#0066ff);
box-shadow:0 0 20px rgba(0,150,255,.8);
}

/* LAYOUT */
.layout{
display:grid;
grid-template-columns:420px 1fr;
height:calc(100vh - 60px);
}

/* LEFT */
.left{
padding:20px;
background:rgba(0,20,50,.8);
border-right:1px solid rgba(0,150,255,.3);
overflow:auto;
}

/* SECTION */
.section{
background:linear-gradient(160deg,#021b3a,#020812);
border-radius:16px;
padding:18px;
margin-bottom:18px;
box-shadow:0 0 40px rgba(0,150,255,.4);
border:1px solid rgba(0,150,255,.4);
}
.section h3{color:#66ccff}

/* INPUTS */
input,select{
width:100%;
padding:14px;
margin-bottom:12px;
border-radius:10px;
border:none;
background:rgba(255,255,255,.05);
color:white;
border:1px solid rgba(0,150,255,.4);
}

/* BUTTONS */
.btn{
width:100%;
padding:15px;
border-radius:30px;
border:none;
background:linear-gradient(45deg,#00aaff,#0066ff);
color:white;
font-weight:bold;
box-shadow:0 15px 40px rgba(0,150,255,.6);
cursor:pointer;
transition:.2s;
}
.btn:hover{transform:translateY(-2px)}

.sos{
width:100%;
height:90px;
border-radius:45px;
background:radial-gradient(circle at top,#66ccff,#0066ff);
font-size:26px;
box-shadow:0 0 60px rgba(0,150,255,.8);
border:none;
margin-top:10px;
cursor:pointer;
}

/* RIGHT */
.right{
padding:12px;
display:grid;
grid-template-rows:minmax(0,1fr) minmax(0,1fr);
gap:12px;
}

/* MAP */
#map{
width:100%;
height:100%;
border-radius:20px;
box-shadow:0 0 40px rgba(0,150,255,.6);
border:1px solid rgba(0,150,255,.4);
}

/* CARDS */
.cards{
display:grid;
grid-template-columns:1fr 1fr;
gap:12px;
}
.card{
background:linear-gradient(160deg,rgba(0,150,255,0.12),rgba(0,50,100,0.1));
backdrop-filter:blur(12px);
border-radius:18px;
padding:18px;
box-shadow:0 25px 50px rgba(0,150,255,.4), inset 0 0 15px rgba(0,150,255,.3);
border:1px solid rgba(0,150,255,.35);
transition:.3s;
}
.card:hover{transform:translateY(-4px) scale(1.02)}
.card h4{color:#66ccff}
.card p{color:#e0f3ff}

/* ERROR */
.error{
background:rgba(255,100,100,.2);
border:1px solid #ff6464;
color:#ff9999;
padding:12px;
border-radius:8px;
margin-bottom:12px;
}
      `}</style>

      <div className="nav">
        <b>🚑 SMART AMBULANCE</b>
        <div>
          <span className="nav-active">Emergency</span>
          <span onClick={()=>navigate("/hospital")}>Hospitals</span>
          <span onClick={()=>navigate("/ambulance")}>Ambulances</span>
          <span onClick={()=>navigate("/admin")}>Admin</span>
        </div>
      </div>

      <div className="layout">
        <div className="left">
          {error && <div className="error">{error}</div>}

          <div className="section">
            <h3>Patient Info</h3>
            <input value={patientName} onChange={e=>setPatientName(e.target.value)} placeholder="Full Name" disabled={status === "DISPATCHED"}/>
            <input value={patientAge} onChange={e=>setPatientAge(e.target.value)} placeholder="Age" type="number" disabled={status === "DISPATCHED"}/>
            <select value={condition} onChange={e=>setCondition(e.target.value)} disabled={status === "DISPATCHED"}>
              <option value="cardiac">Cardiac</option>
              <option value="trauma">Trauma</option>
              <option value="stroke">Stroke</option>
              <option value="respiratory">Respiratory</option>
            </select>
          </div>

          <div className="section">
            <button className="btn" onClick={getLocation} disabled={status === "DISPATCHED"}>📍 Get My Location</button>
            {location && <p>✓ Lat {location.lat.toFixed(4)} | Lng {location.lng.toFixed(4)}</p>}
          </div>

          <div className="section">
            <button className="btn" onClick={dispatch} disabled={status === "DISPATCHED" || loading}>
              {loading ? "Requesting..." : "Request Ambulance"}
            </button>
            <button className="sos" onClick={dispatch} disabled={status === "DISPATCHED" || loading}>
              🆘 SOS
            </button>
          </div>

          {status === "DISPATCHED" && (
            <div className="section">
              <h3>✓ Dispatch Confirmed</h3>
              <p><b>Patient ID:</b> {patientId}</p>
              <p><b>Ambulance:</b> {ambulanceId}</p>
              <p><b>ETA:</b> {eta ? `${eta}s` : "Calculating..."}</p>
              <p><b>Time Elapsed:</b> {timer}s</p>
            </div>
          )}
        </div>

        <div className="right">
          <div id="map" ref={mapRef}></div>
          <div className="cards">
            <div className="card"><h4>📍 Status</h4><p>{status === "IDLE" ? "Ready" : "In Progress"}</p></div>
            <div className="card"><h4>🚑 Ambulance</h4><p>{ambulanceId || "Assigning..."}</p></div>
            <div className="card"><h4>⏱️ ETA</h4><p>{eta ? `${eta}s` : "---"}</p></div>
            <div className="card"><h4>📡 Signal</h4><p>{status === "DISPATCHED" ? "Connected" : "Ready"}</p></div>
          </div>
        </div>
      </div>
    </>
  );
}
