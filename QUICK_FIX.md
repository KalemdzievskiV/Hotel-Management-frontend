# ⚡ Quick Fix - 3 Steps

## The Error:
```
No response from server
```

## The Fix:

### 1️⃣ Update `.env.local` (Frontend)
```env
NEXT_PUBLIC_API_URL=http://localhost:5213/api
```

### 2️⃣ Restart Backend
```powershell
cd C:\Users\vlada\RiderProjects\HotelManagement
dotnet run
```

### 3️⃣ Restart Frontend
```powershell
cd C:\Users\vlada\RiderProjects\hotel-management-frontend
npm run dev
```

## ✅ Done!
Now login should work: `admin@admin.com` / `Admin123!`

---

## What I Fixed:
✅ Added CORS to backend (Program.cs)
✅ Correct API URL (port 5213, not 5001)
✅ Using HTTP instead of HTTPS (avoids SSL issues)
