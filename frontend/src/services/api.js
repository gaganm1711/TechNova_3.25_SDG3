const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export async function createEmergency(payload){
  const res = await fetch(`${API_BASE}/emergency`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(payload)})
  return res.json()
}

export async function getBestRoute(id){
  const res = await fetch(`${API_BASE}/best-route/${id}`)
  return res.json()
}

export async function getAmbulances(){
  const res = await fetch(`${API_BASE}/ambulances`)
  return res.json()
}

export async function getHospitals(){
  const res = await fetch(`${API_BASE}/hospitals`)
  return res.json()
}

export async function fetchEmergencies(){
  const res = await fetch(`${API_BASE}/emergency/all`)
  return res.json()
}
