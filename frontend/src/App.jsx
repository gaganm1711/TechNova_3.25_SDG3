import { Routes, Route } from "react-router-dom";

import EmergencyPage from "./pages/emergency/EmergencyPage";
import HospitalPage from "./pages/hospital/HospitalPage";
import AmbulancePage from "./pages/ambulance/AmbulancePage";
import AdminPage from "./pages/admin/AdminPage";
import VitalsDashboardPage from "./pages/vitals/VitalsDashboardPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<EmergencyPage />} />
      <Route path="/hospital" element={<HospitalPage />} />
      <Route path="/ambulance" element={<AmbulancePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/vitals" element={<VitalsDashboardPage />} />
    </Routes>
  );
}
