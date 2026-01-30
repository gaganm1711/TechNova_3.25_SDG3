import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AmbulancePage() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapObj = useRef(null);
  const markers = useRef([]);

  const [ambulances] = useState([
    { id:"MH-31 A102", lat:21.1458, lng:79.0882, status:"Dispatched", driver:"Ravi" },
    { id:"MH-31 B221", lat:21.1521, lng:79.0815, status:"Available", driver:"Amit" },
    { id:"MH-31 C884", lat:21.1382, lng:79.0911, status:"Returning", driver:"Suresh" },
    { id:"MH-31 D998", lat:21.1410, lng:79.0755, status:"Available", driver:"Manoj" },
    { id:"MH-31 E776", lat:21.1505, lng:79.0955, status:"Dispatched", driver:"Karan" }
  ]);

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

  useEffect(() => {
    if (!window.L || mapObj.current) return;

    mapObj.current = window.L.map(mapRef.current).setView([21.1458,79.0882], 13);
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(mapObj.current);

    ambulances.forEach(a=>{
      const m = window.L.marker([a.lat,a.lng]).addTo(mapObj.current);
      m.bindPopup(`🚑 ${a.id}<br/>${a.status}<br/>Driver: ${a.driver}`);
      markers.current.push(m);
    });
  }, [ambulances]);

  return (
    <>
      <style>{`
body{margin:0;background:#020b14;color:white;font-family:Segoe UI}

.nav{
height:60px;
background:linear-gradient(90deg,#001933,#0077ff,#001933);
display:flex;
align-items:center;
justify-content:space-between;
padding:0 30px;
box-shadow:0 0 30px rgba(0,120,255,.7);
}

.nav span{
margin-left:30px;
cursor:pointer;
padding:8px 18px;
border-radius:20px;
}

.nav-active{
background:linear-gradient(45deg,#00aaff,#66ccff);
box-shadow:0 0 15px #00aaff;
}

.layout{
display:grid;
grid-template-columns:420px 1fr;
height:calc(100vh - 60px);
}

.left{
padding:20px;
background:#030d1c;
overflow:auto;
}

.card{
background:linear-gradient(160deg,#071d3a,#020812);
border-radius:18px;
padding:20px;
margin-bottom:15px;
box-shadow:0 0 40px rgba(0,120,255,.4);
border:1px solid rgba(0,120,255,.4);
}

.right{
padding:10px;
}

#map{
width:100%;
height:100%;
border-radius:20px;
box-shadow:0 0 50px rgba(0,120,255,.6);
}
      `}</style>

      <div className="nav">
        <b>🚑 Ambulance Fleet Control</b>
        <div>
          <span onClick={()=>navigate("/")}>Emergency</span>
          <span onClick={()=>navigate("/hospital")}>Hospitals</span>
          <span className="nav-active">Ambulances</span>
          <span onClick={()=>navigate("/admin")}>Admin</span>
        </div>
      </div>

      <div className="layout">
        <div className="left">
          {ambulances.map(a=>(
            <div className="card" key={a.id}>
              <h3>{a.id}</h3>
              <p>Driver: {a.driver}</p>
              <p>Status: {a.status}</p>
              <p>Lat: {a.lat}</p>
              <p>Lng: {a.lng}</p>
            </div>
          ))}
        </div>

        <div className="right">
          <div id="map" ref={mapRef}></div>
        </div>
      </div>
    </>
  );
}
