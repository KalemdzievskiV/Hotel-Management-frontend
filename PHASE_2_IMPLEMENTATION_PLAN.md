# Phase 2: Guest Experience & User Management 🎯

**Timeline:** 2-3 weeks  
**Focus:** Enable guest functionality, improve authentication, add profile/settings pages

---

## 📋 **Implementation Order**

### **Week 1: Authentication & Profile**
1. Enhanced Sign-up Page (multi-step)
2. Improved Login Page
3. My Profile Page
4. Settings Page

### **Week 2: Guest Views**
5. Guest Dashboard
6. Guest Hotel Browsing
7. Guest Reservations View
8. Guest Calendar View

### **Week 3: Polish & Testing**
9. Navigation Updates
10. Permission Guards
11. Testing & Bug Fixes
12. Documentation

---

## 🔐 **1. Enhanced Sign-Up Page**

### **Features:**
- Multi-step form (3 steps)
  - Step 1: Account (email, password)
  - Step 2: Personal Info (name, phone, DOB)
  - Step 3: Address & Preferences
- Password strength indicator
- Email/phone validation
- Progress indicator
- Auto-save between steps

### **Fields:**
```typescript
{
  email, password, confirmPassword,
  fullName, firstName, lastName, phoneNumber, dateOfBirth,
  country, city, address, postalCode,
  preferredLanguage, currency,
  agreeToTerms, receivePromotions
}
```

### **Files:**
```
app/register/page.tsx
components/auth/MultiStepSignUp.tsx
components/auth/SignUpStep1.tsx
components/auth/SignUpStep2.tsx
components/auth/SignUpStep3.tsx
```

---

## 🔑 **2. Improved Login Page**

### **Features:**
- Remember me checkbox
- Forgot password link
- Show/hide password toggle
- Better error messages
- Loading states
- Social login buttons (optional)

### **File:**
```
app/login/page.tsx (update existing)
components/auth/LoginForm.tsx (update)
```

---

## 👤 **3. My Profile Page**

### **Route:** `/dashboard/profile`

### **Sections:**
1. **Profile Header**
   - Profile picture upload
   - User name and role
   - Member since date

2. **Personal Information**
   - Full name, email, phone
   - Date of birth, nationality
   - Editable fields

3. **Address Information**
   - Street, city, state, zip
   - Country
   - Editable

4. **Statistics (Role-specific)**
   - Guest: Reservations, stays, spending
   - Admin: Hotels managed, revenue
   - Manager: Reservations handled, occupancy

### **API Endpoints:**
```
GET  /api/users/me/profile
PUT  /api/users/me/profile
POST /api/users/me/profile-picture
GET  /api/users/me/statistics
```

### **Files:**
```
app/dashboard/profile/page.tsx
components/profile/ProfileHeader.tsx
components/profile/PersonalInfoCard.tsx
components/profile/AddressInfoCard.tsx
components/profile/StatisticsCard.tsx
```

---

## ⚙️ **4. Settings Page**

### **Route:** `/dashboard/settings`

### **Tabs:**

**Account Tab:**
- Email (with verification)
- Phone number
- Language, Currency, Time Zone
- Privacy settings

**Security Tab:**
- Change password form
- Two-factor authentication
- Active sessions list
- Sign out all devices

**Preferences Tab:**
- Email notifications
- Theme (light/dark)
- Default views
- Dashboard layout

**Notifications Tab:**
- Email notifications settings
- SMS notifications
- Push notifications (future)

### **API Endpoints:**
```
GET  /api/users/me/settings
PUT  /api/users/me/settings
POST /api/users/me/change-password
GET  /api/users/me/sessions
DELETE /api/users/me/sessions/:id
```

### **Files:**
```
app/dashboard/settings/page.tsx
components/settings/AccountTab.tsx
components/settings/SecurityTab.tsx
components/settings/PreferencesTab.tsx
components/settings/NotificationsTab.tsx
```

---

## 🎯 **5. Guest Dashboard**

### **Route:** `/dashboard/guest` (or `/dashboard` for guests)

### **Components:**
- Welcome banner with user name
- Upcoming reservations card (next stay)
- Booking statistics (upcoming, past, total)
- Quick actions (Search Hotels, My Reservations, Favorites)
- Recent activity timeline
- Recommended hotels (based on past stays)
- Special offers section

### **Data Needed:**
- User's reservations (upcoming & past)
- Favorite hotels
- Booking history
- Recommendations

### **Files:**
```
app/dashboard/guest/page.tsx
components/guest/UpcomingStayCard.tsx
components/guest/QuickActionsGrid.tsx
components/guest/BookingStats.tsx
components/guest/RecommendedHotels.tsx
```

---

## 🏨 **6. Guest Hotel Browsing**

### **Route:** `/hotels` or `/browse`

### **Features:**
- Search bar (destination, dates, guests)
- Filters sidebar
  - Price range
  - Star rating
  - Amenities
  - Room type
  - Distance from location
- Sort options (price, rating, distance)
- Hotel cards with:
  - Image, name, rating
  - Location
  - Price per night
  - Key amenities
  - "View Details" button
- Map view toggle
- Pagination or infinite scroll

### **Files:**
```
app/hotels/page.tsx
components/hotels/HotelSearchBar.tsx
components/hotels/HotelFilters.tsx
components/hotels/HotelCard.tsx
components/hotels/HotelList.tsx
components/hotels/HotelMap.tsx
```

---

## 🏨 **7. Guest Hotel Details**

### **Route:** `/hotels/:id`

### **Sections:**
1. **Image Gallery** (main + thumbnails)
2. **Hotel Header** (name, rating, address, contact)
3. **Booking Widget** (sticky on scroll)
   - Check-in/out dates
   - Guest count
   - Search rooms button
   - Price starting from
4. **About Hotel** (description)
5. **Amenities List**
6. **Available Rooms**
   - Room cards with images
   - Room type, size, bed info
   - Amenities
   - Price
   - "Select" button
7. **Location Map** with nearby attractions
8. **Guest Reviews** with ratings
9. **House Rules** (check-in/out, policies)

### **Files:**
```
app/hotels/[id]/page.tsx
components/hotels/HotelGallery.tsx
components/hotels/BookingWidget.tsx
components/hotels/RoomCard.tsx
components/hotels/ReviewsList.tsx
components/hotels/LocationMap.tsx
```

---

## 📅 **8. Guest Reservations View**

### **Route:** `/dashboard/reservations` (guest view)

### **Features:**
- Tab navigation: Upcoming | Past | Cancelled
- Reservation cards showing:
  - Hotel name and image
  - Dates (check-in/out)
  - Room type
  - Total price
  - Status
  - Actions (View, Cancel, Review)
- Filter by date range
- Search by hotel name
- Export booking details (PDF)

### **Differences from Staff View:**
- Guest only sees their own reservations
- Can't see all guest details
- Can't modify reservations (only cancel)
- Can leave reviews

### **Files:**
```
app/dashboard/reservations/page.tsx (update for guest)
components/reservations/GuestReservationCard.tsx
components/reservations/ReservationTabs.tsx
```

---

## 📆 **9. Guest Calendar View**

### **Route:** `/dashboard/calendar` (guest view)

### **Features:**
- Calendar showing user's reservations
- Color-coded by status
- Click reservation to see details
- Add new reservation button
- Month/Week/Day views
- Export to Google Calendar/iCal

### **Differences from Staff View:**
- Only shows guest's own reservations
- Simpler interface
- Focus on upcoming stays
- Can't see room assignments

### **Files:**
```
app/dashboard/calendar/page.tsx (update for guest)
components/calendar/GuestCalendar.tsx
```

---

## 🔄 **10. Navigation & Permissions Updates**

### **Sidebar Updates:**

**Guest Menu:**
- Dashboard
- Browse Hotels
- My Reservations
- Calendar
- Favorites
- Profile
- Settings

**Hide from Guests:**
- Hotels (management)
- Rooms
- Guests (list)
- Users

### **Permission Guards:**

Update `usePermissions` hook to add:
```typescript
canBrowseHotels: true (all users)
canBookRooms: isGuest || isAuthenticated
canViewOwnReservations: isGuest
canCancelReservation: isGuest (own only)
canLeaveReview: isGuest (after checkout)
```

### **Router Updates:**

```typescript
// Guest redirects
if (user.roles.includes('Guest')) {
  router.push('/dashboard/guest');
}

// Update dashboard/page.tsx to handle guests
```

---

## 🎨 **Design Principles**

### **Guest UX:**
1. **Simple & Clean** - Less clutter than staff views
2. **Visual Focus** - More images, less data tables
3. **Mobile-First** - Guests often book on mobile
4. **Clear CTAs** - Obvious "Book Now" buttons
5. **Trust Signals** - Reviews, ratings, verified badges

### **Color Coding:**
- **Blue** - Primary actions (Book, Search)
- **Green** - Confirmed reservations
- **Yellow** - Pending/Upcoming
- **Gray** - Past reservations
- **Red** - Cancelled

---

## 🔧 **Backend Requirements**

### **New API Endpoints:**

```typescript
// Profile
GET  /api/users/me/profile
PUT  /api/users/me/profile
POST /api/users/me/profile-picture

// Settings
GET  /api/users/me/settings
PUT  /api/users/me/settings
POST /api/users/me/change-password

// Guest browsing
GET  /api/hotels/search?destination=&checkIn=&checkOut=&guests=
GET  /api/hotels/:id/availability?checkIn=&checkOut=
GET  /api/hotels/:id/rooms/available

// Guest reservations
GET  /api/reservations/my-reservations
POST /api/reservations/guest-booking
PUT  /api/reservations/:id/cancel
POST /api/reviews

// Favorites
GET  /api/users/me/favorites
POST /api/users/me/favorites/:hotelId
DELETE /api/users/me/favorites/:hotelId
```

### **Database Updates:**

```sql
-- User profile extensions
ALTER TABLE users ADD COLUMN date_of_birth DATE;
ALTER TABLE users ADD COLUMN nationality VARCHAR(50);
ALTER TABLE users ADD COLUMN address TEXT;
ALTER TABLE users ADD COLUMN city VARCHAR(100);
ALTER TABLE users ADD COLUMN postal_code VARCHAR(20);

-- User settings
CREATE TABLE user_settings (
  user_id INT PRIMARY KEY,
  language VARCHAR(10),
  currency VARCHAR(3),
  timezone VARCHAR(50),
  theme VARCHAR(20),
  email_notifications BOOLEAN,
  sms_notifications BOOLEAN
);

-- Favorites
CREATE TABLE user_favorites (
  id INT PRIMARY KEY,
  user_id INT,
  hotel_id INT,
  created_at TIMESTAMP
);

-- Reviews
CREATE TABLE reviews (
  id INT PRIMARY KEY,
  user_id INT,
  hotel_id INT,
  reservation_id INT,
  rating INT,
  comment TEXT,
  created_at TIMESTAMP
);
```

---

## ✅ **Testing Checklist**

### **Authentication:**
- [ ] Multi-step sign-up works for all steps
- [ ] Email validation prevents duplicates
- [ ] Password strength requirements enforced
- [ ] Login remembers user if checked
- [ ] Forgot password flow works

### **Profile & Settings:**
- [ ] Profile displays correct user data
- [ ] Profile picture upload works
- [ ] Settings save correctly
- [ ] Password change works
- [ ] Sessions list accurate

### **Guest Experience:**
- [ ] Guest dashboard shows upcoming reservations
- [ ] Hotel browsing with filters works
- [ ] Hotel details page loads correctly
- [ ] Booking flow completes successfully
- [ ] Guest can view/cancel reservations
- [ ] Guest calendar shows bookings

### **Permissions:**
- [ ] Guests can't access staff pages
- [ ] Staff can't see guest-only views
- [ ] Role-based sidebar works
- [ ] API endpoints enforce permissions

---

## 📊 **Success Metrics**

- [ ] Guest sign-up completion rate > 80%
- [ ] Average time to complete booking < 3 minutes
- [ ] Profile completion rate > 70%
- [ ] Settings save success rate 100%
- [ ] Mobile responsiveness on all pages
- [ ] Zero permission bypass vulnerabilities

---

## 🚀 **Deployment Strategy**

### **Phase A (Week 1):**
1. Deploy enhanced sign-up
2. Deploy improved login
3. Deploy profile page
4. Deploy settings page

### **Phase B (Week 2):**
5. Deploy guest dashboard
6. Deploy hotel browsing
7. Deploy hotel details
8. Deploy booking flow

### **Phase C (Week 3):**
9. Deploy guest reservations view
10. Deploy guest calendar
11. Update navigation
12. Final testing & fixes

---

**This plan provides a clear roadmap for implementing complete guest functionality!** 🎯
