# Start backend server
cd "c:\CIH\Smart_Ambulance Routing"
& ".venv/Scripts/python.exe" -m uvicorn backend.main:app --host 0.0.0.0 --port 8002
