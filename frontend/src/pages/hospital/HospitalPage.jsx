import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HospitalPage() {
  const navigate = useNavigate();

  // ICU state is now actually used (no ESLint warning)
  const [icuBeds, setIcuBeds] = useState(3);

  const [emergencyQueue] = useState([
    { name: "Rohit Sharma", condition: "Heart Attack", status: "Critical" },
    { name: "Anita Verma", condition: "Road Accident", status: "Severe" },
    { name: "Amit Patil", condition: "Stroke", status: "Stable" },
  ]);

  return (
    <>
      <style>{`
      body{margin:0;background:#070b14;color:white;font-family:Segoe UI}

      /* NAVBAR */
      .nav{
        height:60px;
        background:linear-gradient(90deg,#001a33,#0055ff,#001a33);
        display:flex;
        align-items:center;
        justify-content:space-between;
        padding:0 30px;
        box-shadow:0 0 30px rgba(0,100,255,.6);
      }

      .nav span{
        margin-left:30px;
        cursor:pointer;
        padding:8px 16px;
        border-radius:20px;
        transition:.3s;
      }

      .nav span:hover{
        background:rgba(0,100,255,.2);
      }

      /* LAYOUT */
      .container{
        display:grid;
        grid-template-columns:1fr 1fr;
        padding:30px;
        gap:25px;
      }

      /* CARDS */
      .card{
        background:linear-gradient(160deg,#0b1b3a,#030915);
        border-radius:18px;
        padding:25px;
        box-shadow:0 0 30px rgba(0,100,255,.4);
        border:1px solid rgba(0,100,255,.4);
      }

      .card h2{
        margin-top:0;
        color:#66aaff;
      }

      .stat{
        font-size:38px;
        font-weight:bold;
        margin-top:10px;
        color:#00aaff;
      }

      /* TABLE */
      table{
        width:100%;
        border-collapse:collapse;
        margin-top:15px;
      }

      th,td{
        padding:10px;
        border-bottom:1px solid rgba(255,255,255,.1);
        text-align:left;
      }

      th{
        color:#66aaff;
      }

      .critical{color:#ff4d4d}
      .severe{color:#ffaa00}
      .stable{color:#00ff99}

      /* BUTTON */
      .btn{
        margin-top:15px;
        padding:12px 18px;
        border-radius:12px;
        border:none;
        background:#0055ff;
        color:white;
        cursor:pointer;
        box-shadow:0 0 15px rgba(0,100,255,.6);
      }

      .btn:hover{
        background:#3388ff;
      }
      `}</style>

      {/* NAVBAR */}
      <div className="nav">
        <b>🏥 Hospital Command Center</b>
        <div>
          <span onClick={() => navigate("/")}>Emergency</span>
          <span onClick={() => navigate("/ambulance")}>Ambulances</span>
          <span onClick={() => navigate("/admin")}>Admin</span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="container">
        {/* ICU CARD */}
        <div className="card">
          <h2>ICU Availability</h2>
          <div className="stat">{icuBeds} Beds Available</div>
          <p>Live ICU capacity monitored by AI system</p>
          <button 
            className="btn"
            onClick={() => setIcuBeds(beds => beds > 0 ? beds - 1 : 0)}
          >
            Allocate ICU Bed
          </button>
        </div>

        {/* TRAUMA */}
        <div className="card">
          <h2>Trauma Unit</h2>
          <div className="stat">ACTIVE</div>
          <p>All doctors and ventilators are on standby</p>
        </div>

        {/* EMERGENCY QUEUE */}
        <div className="card" style={{gridColumn:"1/3"}}>
          <h2>Incoming Emergency Patients</h2>
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Condition</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {emergencyQueue.map((p,i)=>(
                <tr key={i}>
                  <td>{p.name}</td>
                  <td>{p.condition}</td>
                  <td className={
                    p.status==="Critical" ? "critical" :
                    p.status==="Severe" ? "severe" : "stable"
                  }>
                    {p.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
