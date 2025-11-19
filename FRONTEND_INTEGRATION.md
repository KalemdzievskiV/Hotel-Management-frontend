# 🎨 Frontend Integration - Availability Features

## 📅 Date: November 4, 2025

## ✅ Completed Frontend Changes

### 1. **Hotel Types & API** 🏨

#### Updated Files:
- `types/hotel.ts` - Added `bufferTimeHours` property
- `lib/api/reservations.ts` - Added available rooms API

#### Changes:

**Hotel Interface:**
```typescript
export interface Hotel {
  // ... existing fields
  bufferTimeHours: number;  // NEW
}

export interface CreateHotelDto {
  // ... existing fields
  bufferTimeHours?: number;  // NEW (optional, defaults to 3)
}
```

**Available Rooms API:**
```typescript
export interface AvailableRoomsParams {
  hotelId: number;
  checkIn: string;
  checkOut: string;
  bookingType?: BookingType;
  minCapacity?: number;
  roomType?: string;
}

export interface AvailableRoomsResponse {
  hotelId: number;
  checkIn: string;
  checkOut: string;
  bookingType: BookingType;
  totalAvailable: number;
  rooms: Room[];
}

// New API method
reservationsApi.getAvailableRooms(params: AvailableRoomsParams)
```

---

### 2. **Hotel Management UI** 🏗️

#### Updated Files:
- `app/dashboard/hotels/new/page.tsx` - Add hotel form
- `app/dashboard/hotels/[id]/edit/page.tsx` - Edit hotel form

#### New Field: Buffer Time Hours

**Visual:**
```
┌─────────────────────────────────────────────┐
│ Check-in/Check-out                          │
├─────────────────────────────────────────────┤
│ [Check-in Time]  [Check-out Time]  [Buffer] │
│     14:00            11:00            3     │
│                                      hours   │
│     Time needed between guests for cleaning  │
└─────────────────────────────────────────────┘
```

**Form Code:**
```tsx
<div className="space-y-2">
  <Label htmlFor="bufferTimeHours">Cleaning Buffer (hours)</Label>
  <Input
    id="bufferTimeHours"
    type="number"
    name="bufferTimeHours"
    min="0"
    max="24"
    value={formData.bufferTimeHours}
    onChange={handleChange}
  />
  <p className="text-xs text-gray-500">
    Time needed between guests for cleaning
  </p>
</div>
```

**Features:**
- ✅ Number input with min/max validation (0-24)
- ✅ Default value: 3 hours
- ✅ Help text for clarity
- ✅ Auto-saves with hotel data
- ✅ Works in both create and edit modes

---

### 3. **Error Handling** ⚠️

#### Existing Implementation (Already Good!):
```tsx
catch (error: any) {
  const errorMessage = error?.response?.data?.message 
    || error?.response?.data?.title 
    || error?.response?.data 
    || error?.message 
    || 'An error occurred while creating the reservation';
  
  showToast(errorMessage, 'error');
}
```

**What Users See Now:**
```
❌ Before:
"An error occurred"

✅ After:
"Room 102 is not available for the selected dates. 
Room is occupied until 11/5/2025 11:00 AM. 
Earliest check-in: 11/5/2025 2:00 PM (3h cleaning buffer). 
Guest: John Doe, Reservation #123"
```

---

## 🚀 Usage Examples

### Example 1: Creating a New Hotel

```tsx
// User fills form:
{
  name: "Grand Hotel",
  checkInTime: "15:00",
  checkOutTime: "12:00",
  bufferTimeHours: 4  // ← NEW FIELD
}

// Backend stores this configuration
// All reservations for this hotel will use 4-hour buffer
```

### Example 2: Searching Available Rooms

```tsx
// Call the new API from your booking flow:
import { reservationsApi } from '@/lib/api/reservations';

const searchAvailableRooms = async () => {
  const result = await reservationsApi.getAvailableRooms({
    hotelId: 1,
    checkIn: '2025-11-05T00:00:00',
    checkOut: '2025-11-07T00:00:00',
    bookingType: 0, // Daily
    minCapacity: 2,
    roomType: 'Deluxe'
  });

  console.log(`Found ${result.totalAvailable} rooms`);
  console.log(result.rooms); // Array of available rooms
};
```

### Example 3: Error Display

When user tries to book with insufficient buffer time:
```tsx
// Backend returns detailed error
// Frontend automatically displays it in toast:
showToast(
  "Room is occupied until 11/5/2025 11:00 AM. " +
  "Earliest check-in: 11/5/2025 2:00 PM (3h cleaning buffer)",
  'error'
);
```

---

## 📋 Testing Checklist

### Hotel Management
- [ ] Create new hotel with custom buffer time
- [ ] Edit existing hotel to change buffer time
- [ ] Verify buffer time defaults to 3 if not specified
- [ ] Verify validation (0-24 hours)
- [ ] Check buffer time displays correctly in hotel list

### Reservations
- [ ] Create reservation - see detailed error if conflict
- [ ] Error message shows guest name and reservation ID
- [ ] Error message shows earliest available check-in time
- [ ] Buffer time from hotel is respected

### API Integration
- [ ] Call `getAvailableRooms` endpoint
- [ ] Filter by capacity works
- [ ] Filter by room type works
- [ ] Filter by booking type works
- [ ] Response includes totalAvailable count

---

## 🎯 Next Steps (Optional Enhancements)

### 1. **Visual Availability Calendar** (High Value)
Create a visual room availability calendar in the booking flow:

```tsx
// components/reservations/AvailabilityCalendar.tsx
export function AvailabilityCalendar({
  hotelId,
  checkIn,
  checkOut
}: AvailabilityCalendarProps) {
  const { data: availableRooms } = useQuery({
    queryKey: ['available-rooms', hotelId, checkIn, checkOut],
    queryFn: () => reservationsApi.getAvailableRooms({
      hotelId,
      checkIn,
      checkOut,
    }),
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {availableRooms?.rooms.map(room => (
        <RoomCard
          key={room.id}
          room={room}
          onSelect={() => handleSelectRoom(room)}
        />
      ))}
    </div>
  );
}
```

### 2. **Smart Date Picker** (High Value)
Disable unavailable dates in the date picker:

```tsx
// Fetch conflicting dates when date picker opens
const { data: conflicts } = useQuery({
  queryKey: ['conflicts', roomId],
  queryFn: () => reservationsApi.getConflicts(roomId, startDate, endDate),
});

// Disable conflicting dates in UI
<DatePicker
  disabledDates={conflicts?.map(c => ({
    start: c.checkInDate,
    end: c.checkOutDate,
  }))}
/>
```

### 3. **Real-time Availability** (Medium Value)
Add SignalR for real-time updates:

```tsx
// When another user books a room, update availability
useEffect(() => {
  const connection = new HubConnectionBuilder()
    .withUrl('/hubs/reservations')
    .build();

  connection.on('RoomBooked', (roomId, dates) => {
    // Refresh available rooms
    queryClient.invalidateQueries(['available-rooms']);
  });

  return () => connection.stop();
}, []);
```

### 4. **Buffer Time Suggestions** (Low Value)
Show buffer time recommendations based on hotel type:

```tsx
<div className="space-y-2">
  <Label>Buffer Time (hours)</Label>
  <div className="flex gap-2">
    <Input
      type="number"
      value={bufferTimeHours}
      onChange={e => setBufferTimeHours(parseInt(e.target.value))}
    />
    <div className="text-xs text-gray-500">
      <p>Suggested:</p>
      <Button variant="link" size="sm" onClick={() => setBufferTimeHours(2)}>
        Budget: 2h
      </Button>
      <Button variant="link" size="sm" onClick={() => setBufferTimeHours(3)}>
        Standard: 3h
      </Button>
      <Button variant="link" size="sm" onClick={() => setBufferTimeHours(5)}>
        Luxury: 5h
      </Button>
    </div>
  </div>
</div>
```

### 5. **Buffer Time Analytics** (Low Value)
Show how buffer time affects occupancy:

```tsx
// Dashboard card
<Card>
  <CardHeader>
    <CardTitle>Buffer Time Impact</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <p>Current buffer: {hotel.bufferTimeHours}h</p>
      <p>Lost potential bookings: {lostBookings}</p>
      <p className="text-sm text-gray-600">
        Reducing to 2h could allow {additionalBookings} more bookings/month
      </p>
    </div>
  </CardContent>
</Card>
```

---

## 🔧 API Endpoints Reference

### Get Available Rooms
```http
GET /api/reservations/available-rooms
Query Parameters:
  - hotelId (required): number
  - checkIn (required): ISO date string
  - checkOut (required): ISO date string
  - bookingType (optional): 0=Daily, 1=ShortStay
  - minCapacity (optional): number
  - roomType (optional): string

Response:
{
  "hotelId": 1,
  "checkIn": "2025-11-05T00:00:00",
  "checkOut": "2025-11-07T00:00:00",
  "bookingType": 0,
  "totalAvailable": 5,
  "rooms": [
    {
      "id": 1,
      "roomNumber": "101",
      "type": "Deluxe",
      "capacity": 2,
      "pricePerNight": 150.00,
      ...
    }
  ]
}
```

### Create/Update Hotel
```http
POST /api/hotels
Body:
{
  "name": "Grand Hotel",
  "bufferTimeHours": 3,  // NEW FIELD
  ...
}

Response:
{
  "id": 1,
  "bufferTimeHours": 3,
  ...
}
```

---

## 📊 Benefits

| Feature | Before | After |
|---------|--------|-------|
| **Buffer Configuration** | ❌ Hardcoded | ✅ Per-hotel customizable |
| **Error Messages** | ❌ Generic | ✅ Detailed with suggestions |
| **Room Search** | ❌ Manual check | ✅ API-powered search |
| **User Experience** | ❌ Confusing | ✅ Clear and helpful |
| **Flexibility** | ❌ One-size-fits-all | ✅ Hotel-specific rules |

---

## 🧪 Testing Commands

### Start Frontend Dev Server
```bash
cd c:\Users\vlada\RiderProjects\hotel-management-frontend
npm run dev
# Visit http://localhost:3000
```

### Test Buffer Time Configuration
1. Go to Dashboard → Hotels → Add New Hotel
2. Fill in hotel details
3. Set "Cleaning Buffer" to 4 hours
4. Save and verify it appears in hotel list

### Test Available Rooms API
```bash
# Open browser console on any page
const result = await fetch('/api/reservations/available-rooms?hotelId=1&checkIn=2025-11-05T00:00:00&checkOut=2025-11-07T00:00:00')
  .then(r => r.json());
console.log(result);
```

### Test Error Messages
1. Create a reservation for Room 101, Nov 5, 11 AM - Nov 6
2. Try to create another for Room 101, Nov 5, 12 PM - Nov 6
3. Verify you see detailed error with earliest available time

---

## 📁 Files Modified

### Types:
- ✅ `types/hotel.ts` - Added bufferTimeHours
- ✅ `lib/api/reservations.ts` - Added getAvailableRooms API

### UI Components:
- ✅ `app/dashboard/hotels/new/page.tsx` - Buffer time field
- ✅ `app/dashboard/hotels/[id]/edit/page.tsx` - Buffer time field

### Error Handling:
- ✅ Already implemented in `ReservationDialog.tsx` ✨

---

## ✅ Status: READY FOR TESTING

All frontend integration complete! The UI now supports:
1. ✅ Configuring buffer time per hotel
2. ✅ Searching available rooms via API
3. ✅ Displaying detailed error messages
4. ✅ Type-safe API calls
5. ✅ Proper validation (0-24 hours)

**Next:** Test in browser and verify everything works end-to-end!

---

## 🎉 Quick Start

1. **Backend** (if not running):
   ```bash
   cd c:\Users\vlada\RiderProjects\HotelManagement
   dotnet run
   ```

2. **Frontend**:
   ```bash
   cd c:\Users\vlada\RiderProjects\hotel-management-frontend
   npm run dev
   ```

3. **Test Flow**:
   - Create a hotel with buffer time = 4 hours
   - Add rooms to that hotel
   - Try booking same-day turnover (should respect 4h buffer)
   - See detailed error if conflict occurs

---

**Happy Testing! 🚀**
