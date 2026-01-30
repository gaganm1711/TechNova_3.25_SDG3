# Quick Start Testing Guide

## Prerequisites
- Backend running: `http://localhost:8000`
- Frontend running: `http://localhost:5173`

## Test 1: Emergency Reporting (No Login)

### Steps:
1. Open browser: `http://localhost:5173/`
2. You should see the emergency form
3. Fill in:
   - Patient Name: "John Doe"
   - Age: 45
   - Symptoms: "chest pain" (or any symptom)
   - Click on map to select location
4. Click "Submit Emergency"
5. **Expected Result**: 
   - No login required ✅
   - Emergency created in database
   - Best hospital assigned by AI
   - Response shows hospital name and distance

### Via cURL:
```bash
curl -X POST http://localhost:8000/api/emergency \
  -H "Content-Type: application/json" \
  -d '{
    "patient_name": "John Doe",
    "age": 45,
    "symptoms": "chest pain, shortness of breath",
    "lat": 40.7128,
    "lon": -74.0060
  }'
```

## Test 2: Backend Auth Endpoints

### Create User (Set Role):
```bash
curl -X POST http://localhost:8000/api/auth/set-role \
  -H "Content-Type: application/json" \
  -d '{
    "firebase_uid": "test_user_123",
    "email": "driver@example.com",
    "role": "ambulance",
    "display_name": "John Driver"
  }'
```

**Response:**
```json
{
  "uid": "test_user_123",
  "email": "driver@example.com",
  "role": "ambulance",
  "display_name": "John Driver"
}
```

### Get User Role:
```bash
curl -X GET http://localhost:8000/api/user-role/test_user_123
```

**Response:**
```json
{
  "uid": "test_user_123",
  "email": "driver@example.com",
  "role": "ambulance",
  "display_name": "John Driver"
}
```

## Test 3: Health Check

```bash
curl -X GET http://localhost:8000/api/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "service": "Smart Ambulance Routing API"
}
```

## Test 4: Existing Data

### Get All Hospitals:
```bash
curl -X GET http://localhost:8000/api/hospitals
```

### Get All Ambulances:
```bash
curl -X GET http://localhost:8000/api/ambulances
```

### Get All Emergencies:
```bash
curl -X GET http://localhost:8000/api/emergency/all
```

## Test 5: Frontend Routes (After Google Setup)

| Route | Expected | Status |
|-------|----------|--------|
| `/` | Emergency form (no login) | ✅ Works |
| `/login` | Google OAuth screen | ⏳ Requires Firebase config |
| `/ambulance` | Protected - redirects to login | ⏳ Requires login |
| `/hospital` | Protected - redirects to login | ⏳ Requires login |
| `/admin` | Protected - redirects to login | ⏳ Requires login |

## Test 6: Role Enforcement (Manual Test)

Once Firebase is configured:

1. **Ambulance Driver Test**:
   - Login with email
   - Manually set role to `ambulance`
   - Visit `/ambulance` → Should see DriverDashboard
   - Try `/hospital` → Should see "Access Denied"

2. **Hospital Staff Test**:
   - Login with email
   - Manually set role to `hospital`
   - Visit `/hospital` → Should see HospitalDashboard
   - Try `/admin` → Should see "Access Denied"

3. **Admin Test**:
   - Login with email
   - Manually set role to `admin`
   - Visit `/admin` → Should see AdminDashboard
   - All other protected routes should be accessible

## Database Verification

To check if users are being created:

### SQLite:
```bash
sqlite3 test.db "SELECT * FROM users;"
```

### PostgreSQL:
```bash
psql -d ambulance_db -c "SELECT * FROM users;"
```

## Common Issues & Fixes

### Issue: 404 on `/api/health`
**Fix**: Ensure backend is running on port 8000
```bash
ps aux | grep uvicorn  # Check if running
```

### Issue: CORS errors in frontend
**Fix**: Backend CORS is already enabled for all origins. Check:
1. Backend is on `http://localhost:8000`
2. Frontend `.env.local` has correct `VITE_API_BASE`

### Issue: Emergency form not working
**Fix**: Check browser console for errors:
1. MapLibre loading properly
2. Backend `/api/emergency` endpoint is accessible
3. Network tab shows POST succeeding (200 status)

### Issue: Can't login (after Firebase setup)
**Fix**: 
1. Verify Firebase config in `.env.local`
2. Check browser console for Firebase errors
3. Enable Google sign-in in Firebase console
4. Add localhost to authorized domains

## Performance Notes

- **First Load**: ~2-3 seconds (normal for Vite dev server)
- **Emergency Submission**: <500ms (with AI hospital selection)
- **Database Queries**: <100ms (sample data is small)
- **Map Loading**: ~1 second (depends on network)

## Success Criteria ✅

- [x] Emergency form submits and creates record
- [x] No login required for emergency reporting
- [x] Backend auth endpoints respond correctly
- [x] Database stores user records with roles
- [x] Protected routes reject unauthenticated users
- [ ] Google OAuth works (requires Firebase setup)
- [ ] Role-based access enforced on all routes

## Debugging Tips

### Frontend Issues:
1. Open DevTools (F12)
2. Check Console tab for errors
3. Check Network tab for API calls
4. Verify `.env.local` is loaded (check Application tab)

### Backend Issues:
1. Check terminal output for startup errors
2. Look for database connection errors
3. Verify all imports resolve
4. Test with curl for API endpoints

### Database Issues:
1. Check `test.db` exists in backend folder
2. Verify schema created successfully
3. Check for constraint violations

---

**Ready to test?** Start with Test 1 (Emergency) and work your way up!
