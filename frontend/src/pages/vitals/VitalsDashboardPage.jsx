import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getMapState } from "../../api";
import { VitalsMonitor, recommendHospital } from "../../vitals";

export default function VitalsDashboardPage() {
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState(null);
  const [vitals, setVitals] = useState(null);
  const [condition, setCondition] = useState(null);
  const [severity, setSeverity] = useState(0);
  const [trend, setTrend] = useState("STABLE");
  const [alerts, setAlerts] = useState([]);
  const [mapData, setMapData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const vitalsMonitor = useRef(null);
  const chartRef = useRef(null);
  const hrChartRef = useRef(null);
  const o2ChartRef = useRef(null);

  // Initialize vitals monitor on demo mode
  useEffect(() => {
    const demoPatientId = "DEMO-" + Date.now();
    setPatientId(demoPatientId);
    vitalsMonitor.current = new VitalsMonitor(demoPatientId);
  }, []);

  // Real-time vitals simulation and monitoring
  useEffect(() => {
    if (!patientId || !isMonitoring) return;

    const vitalsInterval = setInterval(() => {
      // Simulate increasing stress as ambulance moves
      const stressLevel = Math.min(1, Date.now() % 30000 / 30000);
      
      const newVitals = vitalsMonitor.current.updateVitals(stressLevel);
      const newCondition = vitalsMonitor.current.assessCondition();
      
      setVitals(newVitals);
      setCondition(newCondition);
      setSeverity(newCondition.severity);
      setAlerts(newCondition.alerts);
      setTrend(vitalsMonitor.current.getTrend());

      updateCharts(newVitals);
    }, 1000);

    return () => clearInterval(vitalsInterval);
  }, [patientId, isMonitoring]);

  // Get map data and recommendations
  useEffect(() => {
    if (!isMonitoring) return;

    const mapInterval = setInterval(async () => {
      try {
        const data = await getMapState();
        setMapData(data);

        if (condition && data.hospitals) {
          const recs = recommendHospital(
            data.hospitals,
            condition,
            35,
            vitals
          );
          setRecommendations(recs);
        }
      } catch (err) {
        console.error("Map update failed:", err);
      }
    }, 2000);

    return () => clearInterval(mapInterval);
  }, [isMonitoring, condition, vitals]);

  const updateCharts = (newVitals) => {
    // Simple chart update (in production, use Chart.js or Recharts)
    if (hrChartRef.current) {
      hrChartRef.current.innerHTML = `<div style="font-size: 28px; font-weight: bold; color: #ff6666;">${Math.round(newVitals.heartRate)} <span style="font-size: 16px;">bpm</span></div>`;
    }
    if (o2ChartRef.current) {
      o2ChartRef.current.innerHTML = `<div style="font-size: 28px; font-weight: bold; color: #66ff66;">${Math.round(newVitals.oxygenSaturation)}% <span style="font-size: 16px;">O₂</span></div>`;
    }
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    const newVitals = vitalsMonitor.current.updateVitals(0);
    const newCondition = vitalsMonitor.current.assessCondition();
    setVitals(newVitals);
    setCondition(newCondition);
    setSeverity(newCondition.severity);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
  };

  const getSeverityColor = (sev) => {
    if (sev > 70) return "#ff3333";
    if (sev > 40) return "#ffaa33";
    return "#33ff33";
  };

  const getSeverityLabel = (sev) => {
    if (sev > 70) return "🔴 CRITICAL";
    if (sev > 40) return "🟠 SERIOUS";
    return "🟢 STABLE";
  };

  return (
    <>
      <style>{`
* { box-sizing: border-box; font-family: 'Courier New', monospace; }
body { margin: 0; background: #0a0e27; color: #00ff88; }

.nav {
  height: 60px;
  background: linear-gradient(90deg, #1a1a3e, #2d5f6f);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 30px;
  box-shadow: 0 0 30px rgba(0, 255, 200, 0.5);
  border-bottom: 2px solid #00ff88;
}

.nav span {
  margin-left: 20px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 5px;
  transition: 0.2s;
  border: 1px solid #00ff88;
}

.nav span:hover {
  background: #00ff88;
  color: #0a0e27;
  box-shadow: 0 0 15px #00ff88;
}

.container {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 15px;
  padding: 20px;
  height: calc(100vh - 80px);
}

.card {
  background: linear-gradient(135deg, #1a1a3e, #0f1a2e);
  border: 2px solid #00ff88;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.3), inset 0 0 20px rgba(0, 255, 136, 0.1);
  overflow: auto;
  position: relative;
}

.card h2 {
  margin: 0 0 15px 0;
  color: #00ff88;
  text-shadow: 0 0 10px #00ff88;
  border-bottom: 1px solid #00ff88;
  padding-bottom: 10px;
}

.card h3 {
  margin: 15px 0 10px 0;
  color: #ffff00;
  font-size: 14px;
}

.vitals-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.vital-box {
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid rgba(0, 255, 136, 0.5);
  border-radius: 5px;
  padding: 10px;
  text-align: center;
}

.vital-label {
  font-size: 11px;
  color: #00ff88;
  opacity: 0.7;
}

.vital-value {
  font-size: 20px;
  font-weight: bold;
  color: #00ff88;
  margin: 5px 0;
}

.severity-bar {
  width: 100%;
  height: 30px;
  background: #0a0e27;
  border: 2px solid #00ff88;
  border-radius: 5px;
  position: relative;
  overflow: hidden;
  margin: 15px 0;
}

.severity-fill {
  height: 100%;
  background: linear-gradient(90deg, #00ff00, #ffff00, #ff6600, #ff0000);
  transition: width 0.3s;
}

.severity-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: bold;
  color: white;
  text-shadow: 0 0 5px black;
  z-index: 10;
}

.alert-box {
  background: rgba(255, 50, 50, 0.2);
  border: 1px solid #ff3333;
  border-radius: 5px;
  padding: 10px;
  margin: 8px 0;
  color: #ff6666;
  font-size: 12px;
}

.alert-critical {
  background: rgba(255, 0, 0, 0.3);
  border: 2px solid #ff0000;
  color: #ff0000;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.recommend-box {
  background: rgba(0, 200, 100, 0.1);
  border: 1px solid #00cc66;
  border-radius: 5px;
  padding: 12px;
  margin: 10px 0;
  color: #00ff88;
}

.recommend-title {
  font-weight: bold;
  color: #ffff00;
  margin-bottom: 5px;
}

.recommend-details {
  font-size: 11px;
  color: #00ff88;
  opacity: 0.8;
}

.button {
  width: 100%;
  padding: 12px;
  margin: 10px 0;
  border: 1px solid #00ff88;
  background: rgba(0, 255, 136, 0.1);
  color: #00ff88;
  cursor: pointer;
  border-radius: 5px;
  font-weight: bold;
  transition: 0.2s;
}

.button:hover {
  background: #00ff88;
  color: #0a0e27;
  box-shadow: 0 0 15px #00ff88;
}

.button-danger {
  border-color: #ff3333;
  background: rgba(255, 50, 50, 0.1);
  color: #ff3333;
}

.button-danger:hover {
  background: #ff3333;
  color: white;
}

.chart-box {
  background: rgba(0, 255, 136, 0.05);
  border: 1px solid rgba(0, 255, 136, 0.3);
  border-radius: 5px;
  padding: 15px;
  margin: 10px 0;
  text-align: center;
}

.status-badge {
  display: inline-block;
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  margin: 5px 5px 5px 0;
  border: 1px solid currentColor;
}

.status-critical { color: #ff0000; background: rgba(255, 0, 0, 0.2); }
.status-serious { color: #ffaa00; background: rgba(255, 170, 0, 0.2); }
.status-stable { color: #00ff00; background: rgba(0, 255, 0, 0.2); }

.trend-arrow {
  font-size: 20px;
}
      `}</style>

      <div className="nav">
        <b>🏥 IOT VITALS MONITORING SYSTEM</b>
        <div>
          <span onClick={() => navigate("/")}>Emergency</span>
          <span onClick={() => navigate("/admin")}>Admin</span>
          <span style={{ borderColor: '#00ff88', background: '#00ff88', color: '#0a0e27' }}>Vitals</span>
        </div>
      </div>

      <div className="container">
        {/* LEFT: Vitals Display */}
        <div className="card">
          <h2>📊 VITAL SIGNS</h2>
          
          {!isMonitoring ? (
            <button className="button" onClick={startMonitoring}>
              ▶ START MONITORING
            </button>
          ) : (
            <button className="button button-danger" onClick={stopMonitoring}>
              ⏹ STOP MONITORING
            </button>
          )}

          {vitals && (
            <>
              <h3>Real-time Data</h3>
              <div className="vitals-grid">
                <div className="vital-box">
                  <div className="vital-label">HEART RATE</div>
                  <div ref={hrChartRef} className="vital-value">--</div>
                  <div className="vital-label">BPM</div>
                </div>

                <div className="vital-box">
                  <div className="vital-label">BLOOD PRESSURE</div>
                  <div className="vital-value" style={{ fontSize: '16px' }}>
                    {Math.round(vitals.systolicBP)}/{Math.round(vitals.diastolicBP)}
                  </div>
                  <div className="vital-label">mmHg</div>
                </div>

                <div className="vital-box">
                  <div className="vital-label">OXYGEN SAT</div>
                  <div ref={o2ChartRef} className="vital-value">--</div>
                  <div className="vital-label">%</div>
                </div>

                <div className="vital-box">
                  <div className="vital-label">TEMPERATURE</div>
                  <div className="vital-value" style={{ fontSize: '16px' }}>
                    {vitals.temperature.toFixed(1)}°C
                  </div>
                  <div className="vital-label">CORE</div>
                </div>
              </div>

              <h3 style={{ marginTop: '20px' }}>Patient ID</h3>
              <div style={{ fontSize: '12px', color: '#00ff88', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {patientId}
              </div>
            </>
          )}
        </div>

        {/* CENTER: Severity & Alerts */}
        <div className="card">
          <h2>⚠️ SEVERITY ASSESSMENT</h2>

          {condition && (
            <>
              <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>
                  {getSeverityLabel(severity)}
                </div>
                <div className="severity-bar">
                  <div 
                    className="severity-fill" 
                    style={{ width: `${severity}%` }}
                  ></div>
                  <div className="severity-label">{Math.round(severity)}</div>
                </div>
              </div>

              <h3>Status</h3>
              <div>
                <span className={`status-badge status-${condition.condition.toLowerCase()}`}>
                  {condition.condition}
                </span>
                <br />
                <span className="status-badge" style={{ color: '#ffff00' }}>
                  {trend === 'IMPROVING' && '📈'} 
                  {trend === 'DECLINING' && '📉'} 
                  {trend === 'STABLE' && '→'} 
                  {' ' + trend}
                </span>
              </div>

              <h3 style={{ marginTop: '15px' }}>Specialty Needed</h3>
              <div style={{ color: '#ffff00', fontSize: '14px', fontWeight: 'bold' }}>
                {condition.recommendedSpecialty}
              </div>

              <h3 style={{ marginTop: '15px' }}>Critical Alerts ({condition.alerts.length})</h3>
              {condition.alerts.length === 0 ? (
                <div style={{ color: '#00ff88', fontSize: '12px' }}>✓ All vitals normal</div>
              ) : (
                condition.alerts.map((alert, i) => (
                  <div key={i} className={`alert-box ${alert.severity === 'CRITICAL' ? 'alert-critical' : ''}`}>
                    <strong>{alert.type}</strong><br />
                    Value: {alert.value.toFixed(1)} ({alert.severity})
                  </div>
                ))
              )}
            </>
          )}
        </div>

        {/* RIGHT: Hospital Recommendations */}
        <div className="card">
          <h2>🏥 HOSPITAL RECOMMENDATIONS</h2>

          {recommendations.length === 0 ? (
            <div style={{ color: '#00ff88', fontSize: '12px', marginTop: '20px' }}>
              Start monitoring to see AI-powered hospital recommendations
            </div>
          ) : (
            <>
              <h3>Top Matches (AI Ranked)</h3>
              {recommendations.slice(0, 3).map((rec, idx) => (
                <div key={idx} className="recommend-box">
                  <div className="recommend-title">
                    #{idx + 1} {rec.name}
                  </div>
                  <div className="recommend-details">
                    <div>📍 Distance: {rec.distance.toFixed(1)} km</div>
                    <div>⭐ Score: {Math.round(rec.recommendation)}/100</div>
                    <div>🏨 {rec.specialty}</div>
                    <div style={{ marginTop: '5px', color: '#00ff88', fontSize: '10px' }}>
                      💡 {rec.reason}
                    </div>
                  </div>
                </div>
              ))}

              <h3 style={{ marginTop: '15px' }}>Why This Hospital?</h3>
              <div style={{ fontSize: '11px', color: '#00ff88', lineHeight: '1.6' }}>
                AI analysis selected hospitals based on:
                <ul style={{ margin: '8px 0' }}>
                  <li>Patient severity level</li>
                  <li>Required medical specialty</li>
                  <li>Available ICU/Emergency beds</li>
                  <li>Distance from patient</li>
                  <li>Hospital success rates</li>
                  <li>Estimated response time</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
