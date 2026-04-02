# Hotel Management System — Full Project Context

> **Purpose**: This document gives a complete picture of the project so any new session can understand what exists and continue implementation without gaps.

---

## 🌐 Project Overview

A **SaaS Hotel Management System** with two main user groups:
- **Hotel Admins/Managers** — the primary paying subscribers; manage hotels, rooms, reservations, guests, inventory, housekeeping
- **Guests** — secondary users; future public booking portal (not yet built)
- **SuperAdmin** — internal platform management

**Current market focus**: Walk-in guests with manual pricing (hotels that primarily take walk-ins over the counter, not OTA bookings).

**Business model**: Subscription SaaS — Starter $49/mo, Pro $99/mo, Enterprise $249/mo. Billing not yet implemented; features are being built first.

---

## 🏗️ Architecture Overview

### Backend
- **Framework**: ASP.NET Core 9.0 (C#)
- **ORM**: Entity Framework Core with PostgreSQL (Npgsql)
- **Auth**: ASP.NET Identity + JWT Bearer tokens (1-hour expiry)
- **Pattern**: Generic Repository → Service Layer → Controller
- **Validation**: FluentValidation (auto-validation via filter)
- **Mapping**: AutoMapper
- **Authorization**: Policy-based + Role-based (custom `IAuthorizationHandler` classes)

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Components**: shadcn/ui (`Card`, `Button`, `Dialog`, `Badge`, `Input`, `Select`, `Tabs`, etc.)
- **Icons**: Lucide React
- **Data Fetching**: TanStack React Query (v5)
- **HTTP Client**: Axios (via `apiClient` wrapper)
- **State**: Zustand (`useAuthStore`)
- **Date utils**: `date-fns`

---

## 🚀 Deployment

| Service | URL / Details |
|---|---|
| **Backend** | Railway — auto-deploys from GitHub `master` |
| **Frontend** | Vercel — auto-deploys from GitHub `master` |
| **Database** | Railway PostgreSQL — connection via `DATABASE_URL` env var |
| **Backend GitHub** | `https://github.com/KalemdzievskiV/Hotel-Management-backend.git` |
| **Frontend GitHub** | `https://github.com/KalemdzievskiV/Hotel-Management-frontend.git` |

### Backend `DATABASE_URL` parsing (in `Program.cs`):
```csharp
var databaseUrl = Environment.GetEnvironmentVariable("DATABASE_URL");
if (!string.IsNullOrEmpty(databaseUrl))
{
    var uri = new Uri(databaseUrl);
    var userInfo = uri.UserInfo.Split(':');
    var connectionString = $"Host={uri.Host};Port={uri.Port};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={userInfo[1]}";
    builder.Configuration["ConnectionStrings:DefaultConnection"] = connectionString;
}
```

---

## 📁 Repository Structure

### Backend: `c:\Users\vlada\RiderProjects\HotelManagement\`
```
Controllers/
  AuthController.cs
  GuestsController.cs
  HotelsController.cs
  HousekeepingController.cs
  InventoryController.cs
  ReportsController.cs
  ReservationsController.cs
  RoomsController.cs
  UsersController.cs
  WalkInController.cs
  CrudController.cs (base)
  HomeController.cs

Models/
  Entities/
    ApplicationUser.cs
    Guest.cs
    Hotel.cs
    HousekeepingTask.cs
    InventoryItem.cs
    InventoryTransaction.cs
    Reservation.cs
    Room.cs
  Enums/
    BookingType.cs
    HousekeepingTaskPriority.cs
    HousekeepingTaskStatus.cs
    HousekeepingTaskType.cs
    InventoryCategory.cs
    InventoryTransactionType.cs
    PaymentMethod.cs
    PaymentStatus.cs
    ReservationStatus.cs
    RoomStatus.cs
    RoomType.cs
  DTOs/
    Auth/ (LoginRequestDto, RegisterDto, AuthResponseDto)
    CreateReservationDto.cs
    GuestDto.cs
    HotelDto.cs
    HousekeepingDtos.cs
    HousekeepingDtos.cs
    InventoryDtos.cs
    OutstandingPaymentDto.cs
    ReportDtos.cs
    ReservationDto.cs
    RoomDto.cs
    UpdateReservationDto.cs
    UpdateUserDto.cs
    UserDto.cs
    WalkInDtos.cs
  Constants/
    AppRoles.cs  (SuperAdmin, Admin, Manager, Housekeeper, Guest)

Services/
  Interfaces/
    ICrudService.cs
    IGuestService.cs
    IHotelService.cs
    IHousekeepingService.cs
    IInventoryService.cs
    IReportService.cs
    IReservationService.cs
    IRoomService.cs
    ITokenService.cs
    IUserService.cs
  Implementations/
    (all corresponding implementations)

Repositories/
  Interfaces/IGenericRepository.cs
  Implementations/GenericRepository.cs

Data/
  ApplicationDbContext.cs

Infrastructure/
  Mapping/AutoMapperProfile.cs
  Filters/ValidationFilter.cs
  Middleware/ExceptionHandlingMiddleware.cs

Authorization/
  Requirements/ (HotelOwnershipRequirement, ManageHotelRequirement, ReservationAccessRequirement)
  Handlers/ (corresponding handlers)

Configurations/
  DependencyInjection.cs

Validators/
  LoginRequestDtoValidator.cs
  (other validators)

Migrations/
  (EF Core migration files)
```

### Frontend: `c:\Users\vlada\RiderProjects\hotel-management-frontend\`
```
app/
  dashboard/
    page.tsx               ← Dashboard home
    admin/                 ← Admin-specific views
    availability/          ← Room availability checker
    calendar/              ← Drag-and-drop reservation calendar
    guests/                ← Guest CRUD management
    hotels/                ← Hotel CRUD management
    housekeeping/          ← Housekeeping tasks (Phase 1B)
    inventory/             ← Inventory management (Phase 1B)
    profile/               ← User profile
    reports/               ← Reports & analytics (Phase 1A)
    reservations/          ← Reservation management
    rooms/                 ← Room CRUD management
    settings/              ← App settings
    super-admin/           ← SuperAdmin-only views
    users/                 ← User management
    walk-in/               ← Quick walk-in check-in (Phase 1C)

components/
  layout/
    Sidebar.tsx            ← Navigation sidebar with role-based links
    DashboardLayout.tsx    ← Wraps all dashboard pages
  ui/                      ← shadcn/ui components

lib/
  api/
    client.ts              ← Axios instance, base URL, auth interceptor
    index.ts               ← Re-exports all API modules
    auth.ts
    analytics.ts
    guests.ts
    hotels.ts
    housekeeping.ts
    inventory.ts
    public-hotels.ts
    reports.ts
    reservations.ts
    rooms.ts
    users.ts
    walk-in.ts

hooks/
  useGuests.ts
  (other React Query hooks)

store/
  authStore.ts             ← Zustand store: user, token, login/logout

types/
  index.ts                 ← Shared TypeScript interfaces (User, Room, Reservation, Guest, Hotel, etc.)
```

---

## 🔐 Roles & Authorization

Roles are defined in `AppRoles.cs`:
- `SuperAdmin` — platform owner, full access to everything
- `Admin` — hotel owner, manages their hotel(s), staff, billing
- `Manager` — senior staff, full operational access within assigned hotel
- `Housekeeper` — can update room status, view/complete housekeeping tasks
- `Guest` — registered guests (future public portal use)

### Authorization Policies
- `CanViewHotel` — hotel ownership check (`HotelOwnershipRequirement`)
- `CanManageHotel` — hotel management check (`ManageHotelRequirement`)
- `CanAccessReservation` — reservation ownership check (`ReservationAccessRequirement`)
- `AdminOnly` — SuperAdmin + Admin
- `ManagerOrAbove` — SuperAdmin + Admin + Manager

### Sidebar permissions (frontend)
The sidebar uses a `permissions` object derived from the user's role. Key permission: `canAccessAdminDashboard` gates Inventory and Housekeeping links to Admin/Manager only. `canViewGuests` gates Guest and Walk-In links.

---

## 🗃️ Database Entities (Complete Field List)

### `ApplicationUser` (extends IdentityUser)
```
Id (string, GUID)
FirstName, LastName
FullName (computed, not mapped)
ProfilePictureUrl
DateOfBirth, Gender
Address, City, State, Country, PostalCode
JobTitle, Department
HotelId (nullable FK → Hotel)  ← which hotel they work at
EmergencyContactName, EmergencyContactPhone, EmergencyContactRelationship
PreferredLanguage, TimeZone
EmailNotifications, SmsNotifications
IsActive, Notes
CreatedAt, UpdatedAt, LastLoginDate
```

### `Hotel`
```
Id
OwnerId (FK → ApplicationUser)
Name, Description
Address, City, Country, PostalCode
PhoneNumber, Email, Website
Stars (1-5), Rating (0-5), TotalReviews
Amenities (comma-separated string)
CheckInTime, CheckOutTime (default "14:00" / "11:00")
BufferTimeHours (default 3)
IsActive
CreatedAt, UpdatedAt
→ Rooms (ICollection), Reservations (ICollection)
```

### `Room`
```
Id
HotelId (FK → Hotel)
RoomNumber, Type (RoomType enum), Floor
Capacity, PricePerNight
AllowsShortStay, ShortStayHourlyRate, MinimumShortStayHours, MaximumShortStayHours
Description, Amenities (comma-separated), Images (JSON or comma-separated)
AreaSqM, BedType, ViewType
HasBathtub, HasBalcony, IsSmokingAllowed
Status (RoomStatus enum)
IsActive
CreatedAt, UpdatedAt, LastCleaned, LastMaintenance
Notes
→ Reservations (ICollection)
```

### `Guest`
```
Id
UserId (nullable FK → ApplicationUser)  ← null for walk-in guests
HotelId (nullable FK → Hotel)           ← which hotel owns this walk-in
CreatedByUserId (nullable FK → ApplicationUser)
FirstName, LastName, Email, PhoneNumber
IdentificationNumber, IdentificationType
DateOfBirth, Nationality, Gender
Address, City, State, Country, PostalCode
EmergencyContactName, EmergencyContactPhone, EmergencyContactRelationship
SpecialRequests, Preferences
IsVIP (bool)
LoyaltyProgramNumber
EmailNotifications, SmsNotifications
PreferredLanguage
CompanyName, TaxId
Notes
IsActive, IsBlacklisted, BlacklistReason
CreatedAt, UpdatedAt, LastStayDate
→ Reservations (ICollection)
```

### `Reservation`
```
Id
HotelId (FK → Hotel)
RoomId (FK → Room)
GuestId (FK → Guest)
CreatedByUserId (FK → ApplicationUser)
BookingType (BookingType enum: Daily=0, ShortStay=1)
CheckInDate, CheckOutDate
DurationInHours (nullable, for short-stay)
NumberOfGuests
Status (ReservationStatus enum)
TotalAmount, DepositAmount, RemainingAmount
PaymentStatus (PaymentStatus enum)
PaymentMethod (nullable PaymentMethod enum)
PaymentReference
DiscountAmount, DiscountReason     ← Added Phase 1C
ExtraCharges, ExtraChargesNotes    ← Added Phase 1C
SpecialRequests, Notes
CreatedAt, UpdatedAt, ConfirmedAt, CheckedInAt, CheckedOutAt, CancelledAt
CancellationReason
[NotMapped] TotalNights, IsActive, CanCheckIn, CanCheckOut, CanCancel
```

### `InventoryItem` (Phase 1B)
```
Id
HotelId (FK → Hotel)
Name, Description
Category (InventoryCategory enum)
Quantity, MinimumThreshold
UnitCost, Supplier, Unit (default "pcs")
LastRestocked
IsActive
CreatedAt, UpdatedAt
[NotMapped] IsLowStock (Quantity <= MinimumThreshold)
→ Transactions (ICollection<InventoryTransaction>)
```

### `InventoryTransaction` (Phase 1B)
```
Id
InventoryItemId (FK → InventoryItem)
RoomId (nullable FK → Room)
CreatedByUserId (FK → ApplicationUser)
Type (InventoryTransactionType enum)
Quantity
Notes
TransactionDate
CreatedAt
```

### `HousekeepingTask` (Phase 1B)
```
Id
RoomId (FK → Room)
AssignedToUserId (nullable FK → ApplicationUser)
CreatedByUserId (FK → ApplicationUser)
Type (HousekeepingTaskType enum)
Priority (HousekeepingTaskPriority enum)
Status (HousekeepingTaskStatus enum)
ScheduledFor
StartedAt, CompletedAt
Notes
CreatedAt, UpdatedAt
```

---

## 📋 Enums (Complete)

```csharp
BookingType:         Daily=0, ShortStay=1

RoomType:            Single=1, Double=2, Twin=3, Triple=4, Suite=5,
                     Deluxe=6, Presidential=7, Studio=8, Family=9, Accessible=10

RoomStatus:          Available=1, Occupied=2, Cleaning=3, Maintenance=4,
                     OutOfService=5, Reserved=6

ReservationStatus:   Pending=0, Confirmed=1, CheckedIn=2, CheckedOut=3,
                     Cancelled=4, NoShow=5

PaymentStatus:       Unpaid, PartiallyPaid, Paid, Refunded, PartialRefund

PaymentMethod:       Cash=0, CreditCard=1, DebitCard=2, BankTransfer=3,
                     Online=4, PayOnArrival=5

InventoryCategory:   Linens=1, Towels=2, Amenities=3, Cleaning=4,
                     Maintenance=5, FoodBeverage=6, Other=7

InventoryTransactionType: Usage, Restock, Damage, Loss

HousekeepingTaskType:     CleanRoom=1, ChangeLinen=2, DeepClean=3,
                          Maintenance=4, Inspection=5, TurnDown=6

HousekeepingTaskPriority: Low, Normal, High, Urgent

HousekeepingTaskStatus:   Pending, InProgress, Completed, Cancelled
```

---

## 🔌 API Endpoints (Complete)

Base URL: `http://localhost:5001/api` (dev) / Railway URL (prod)  
All endpoints require `Authorization: Bearer <token>` unless noted.

### Auth — `/api/auth`
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | None | Returns JWT token |
| POST | `/auth/register` | None | Register guest/staff |

### Hotels — `/api/hotels`
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/hotels` | All | Get hotels (filtered by ownership) |
| GET | `/hotels/{id}` | All | Get hotel by ID |
| POST | `/hotels` | Admin+ | Create hotel |
| PUT | `/hotels/{id}` | Admin+ | Update hotel |
| DELETE | `/hotels/{id}` | Admin+ | Delete hotel |
| GET | `/hotels/{id}/rooms` | All | Rooms for hotel |
| GET | `/hotels/{id}/availability` | All | Room availability |

### Rooms — `/api/rooms`
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/rooms` | All auth | Get rooms |
| GET | `/rooms/{id}` | All auth | Get room |
| POST | `/rooms` | Admin/Manager | Create room |
| PUT | `/rooms/{id}` | Admin/Manager | Update room |
| DELETE | `/rooms/{id}` | Admin | Delete room |
| PATCH | `/rooms/{id}/status` | Admin/Manager/Housekeeper | Update room status |
| GET | `/rooms/hotel/{hotelId}/available` | All auth | Available rooms for hotel |
| GET | `/rooms/{id}/occupancy` | Admin/Manager | Room occupancy stats |

### Guests — `/api/guests`
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/guests` | Admin/Manager | Get accessible guests |
| GET | `/guests/all-unfiltered` | SuperAdmin | All guests |
| GET | `/guests/{id}` | Admin/Manager | Get guest |
| POST | `/guests` | Admin/Manager | Create guest |
| PUT | `/guests/{id}` | Admin/Manager | Update guest |
| DELETE | `/guests/{id}` | Admin | Delete guest |
| GET | `/guests/search?name={q}` | Admin/Manager | Case-insensitive search by name/email/phone |
| GET | `/guests/email/{email}` | Admin/Manager | Find by email |
| GET | `/guests/phone/{phone}` | Admin/Manager | Find by phone |
| GET | `/guests/vip` | Admin/Manager | VIP guests |
| GET | `/guests/active` | Admin/Manager | Active (not blacklisted) |
| GET | `/guests/blacklisted` | Admin | Blacklisted guests |
| POST | `/guests/{id}/blacklist` | Admin | Blacklist with reason |
| POST | `/guests/{id}/unblacklist` | Admin | Remove from blacklist |
| PATCH | `/guests/{id}/vip` | Admin/Manager | Toggle VIP status |
| GET | `/guests/hotel/{hotelId}` | Admin/Manager | Guests for hotel |
| GET | `/guests/my-guests` | Admin/Manager | Guests created by current user |
| GET | `/guests/me` | Any auth | Get/create own guest profile |

### Reservations — `/api/reservations`
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| POST | `/reservations` | Any auth | Create reservation |
| GET | `/reservations/{id}` | Owner/Admin | Get reservation |
| GET | `/reservations` | Admin/Manager | All reservations |
| PUT | `/reservations/{id}` | Admin/Manager | Update reservation |
| DELETE | `/reservations/{id}` | Admin | Delete reservation |
| GET | `/reservations/hotel/{hotelId}` | Admin/Manager | By hotel |
| GET | `/reservations/guest/{guestId}` | Admin/Manager | By guest |
| GET | `/reservations/status/{status}` | Admin/Manager | By status |
| GET | `/reservations/date-range` | Admin/Manager | By date range |
| GET | `/reservations/my` | Any auth | Current user's reservations |
| GET | `/reservations/available-rooms` | Any auth | Available rooms (params: hotelId, checkIn, checkOut, bookingType) |
| POST | `/reservations/{id}/confirm` | Admin/Manager | Confirm → status=Confirmed |
| POST | `/reservations/{id}/checkin` | Admin/Manager | Check in → status=CheckedIn, room=Occupied |
| POST | `/reservations/{id}/checkout` | Admin/Manager | Check out → status=CheckedOut, room=Cleaning |
| POST | `/reservations/{id}/cancel` | Admin/Manager/Owner | Cancel with reason |
| POST | `/reservations/{id}/noshow` | Admin/Manager | Mark no-show |
| POST | `/reservations/{id}/payment` | Admin/Manager | Record payment (amount, method, reference) |
| POST | `/reservations/{id}/refund` | Admin | Record refund |
| GET | `/reservations/stats/count` | Admin | Total count |
| GET | `/reservations/stats/revenue` | Admin | Total revenue |
| GET | `/reservations/stats/by-status` | Admin | Count by status |
| GET | `/reservations/stats/by-month/{year}` | Admin | Count by month |

### Users — `/api/users`
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/users` | SuperAdmin/Admin | All users |
| GET | `/users/{id}` | Admin+ | Get user |
| POST | `/users` | SuperAdmin | Create user |
| PUT | `/users/{id}` | Admin+ | Update user |
| DELETE | `/users/{id}` | SuperAdmin | Delete user |
| GET | `/users/role/{role}` | Admin+ | By role |
| GET | `/users/hotel/{hotelId}` | Admin+ | By hotel |
| GET | `/users/search?searchTerm={q}` | Admin+ | Search |
| POST | `/users/{id}/activate` | Admin+ | Activate |
| POST | `/users/{id}/deactivate` | Admin+ | Deactivate |
| PATCH | `/users/{id}/hotel` | Admin+ | Assign to hotel |
| PATCH | `/users/{id}/role` | SuperAdmin | Update role |
| POST | `/users/{id}/roles` | SuperAdmin | Add role |
| DELETE | `/users/{id}/roles/{role}` | SuperAdmin | Remove role |

### Inventory — `/api/inventory` (Phase 1B)
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/inventory/hotel/{hotelId}` | Admin/Manager | All items for hotel |
| GET | `/inventory/{id}` | Admin/Manager | Get item |
| POST | `/inventory` | Admin/Manager | Create item |
| PUT | `/inventory/{id}` | Admin/Manager | Update item |
| DELETE | `/inventory/{id}` | Admin | Delete item |
| GET | `/inventory/hotel/{hotelId}/low-stock` | Admin/Manager | Low stock alerts |
| GET | `/inventory/{id}/transactions` | Admin/Manager | Item transaction history |
| POST | `/inventory/{id}/restock` | Admin/Manager | Record restock |
| POST | `/inventory/{id}/use` | Admin/Manager | Record usage |
| GET | `/inventory/hotel/{hotelId}/cost-analysis` | Admin/Manager | Cost by category |

### Housekeeping — `/api/housekeeping` (Phase 1B)
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/housekeeping/hotel/{hotelId}` | Admin/Manager | All tasks |
| GET | `/housekeeping/{id}` | Admin/Manager | Get task |
| POST | `/housekeeping` | Admin/Manager | Create task |
| PUT | `/housekeeping/{id}` | Admin/Manager | Update task |
| DELETE | `/housekeeping/{id}` | Admin | Delete task |
| GET | `/housekeeping/hotel/{hotelId}/schedule` | Admin/Manager | Today's schedule |
| POST | `/housekeeping/{id}/start` | Admin/Manager/Housekeeper | Start task → InProgress |
| POST | `/housekeeping/{id}/complete` | Admin/Manager/Housekeeper | Complete → room=Available |
| GET | `/housekeeping/hotel/{hotelId}/performance` | Admin/Manager | Staff performance metrics |
| POST | `/housekeeping/hotel/{hotelId}/generate-daily` | Admin/Manager | Auto-generate tasks from checkouts |

### Walk-In — `/api/walkin` (Phase 1C)
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/walkin/available-rooms/{hotelId}` | Admin/Manager | Available rooms tonight |
| GET | `/walkin/guest-intelligence/{guestId}` | Admin/Manager | Guest history + stats + flags |
| POST | `/walkin/quick-checkin` | Admin/Manager | Create guest (if new) + reservation + confirm + check-in in one call |
| POST | `/walkin/express-checkout/{reservationId}` | Admin/Manager | Add extra charges + final payment + checkout |
| PATCH | `/walkin/guest-flags/{guestId}` | Admin/Manager | Toggle VIP/blacklist/notes |

### Reports — `/api/reports` (Phase 1A)
| Method | Endpoint | Roles | Description |
|---|---|---|---|
| GET | `/reports/revenue/daily` | Admin/Manager | Daily revenue |
| GET | `/reports/revenue/weekly` | Admin/Manager | Weekly revenue |
| GET | `/reports/revenue/monthly` | Admin/Manager | Monthly revenue |
| GET | `/reports/payments/outstanding` | Admin/Manager | Unpaid/partial payments |
| GET | `/reports/occupancy/current` | Admin/Manager | Current occupancy |
| GET | `/reports/occupancy/history` | Admin/Manager | Historical occupancy |
| GET | `/reports/guests/summary` | Admin/Manager | Guest statistics |
| GET | `/reports/reservations/summary` | Admin/Manager | Reservation statistics |

---

## 💻 Frontend Pages (Complete List)

| Route | File | Description |
|---|---|---|
| `/dashboard` | `app/dashboard/page.tsx` | Dashboard home: today's check-ins/outs, occupancy, revenue, room status grid |
| `/dashboard/hotels` | Hotels CRUD | Create/edit/view hotels; hotel cards with room count, rating, amenities |
| `/dashboard/rooms` | Rooms CRUD | Room management with status badges, price, type, availability toggle |
| `/dashboard/guests` | Guests CRUD | Full guest list with VIP/blacklist badges, search, filters |
| `/dashboard/reservations` | Reservation management | Table with status workflow buttons (Confirm, Check-In, Check-Out, Cancel) |
| `/dashboard/calendar` | Drag-and-drop calendar | Visual reservation calendar, drag to reassign rooms |
| `/dashboard/availability` | Availability checker | Date-range picker to check available rooms across a hotel |
| `/dashboard/reports` | Reports dashboard | Revenue charts, occupancy trends, payment summaries |
| `/dashboard/inventory` | **Phase 1B** | Stock levels, low-stock alerts banner, transaction log, cost analysis by category; Add Item + Record Transaction dialogs |
| `/dashboard/housekeeping` | **Phase 1B** | Daily schedule, all tasks, staff performance tabs; Start/Complete task buttons; Auto-generate daily tasks button |
| `/dashboard/walk-in` | **Phase 1C** | 4-step wizard: Guest search or new guest → Room selection → Pricing with discount → Confirm; Express Checkout modal; Guest History popup |
| `/dashboard/users` | User management | Staff CRUD, role assignment, hotel assignment |
| `/dashboard/profile` | User profile | Edit own profile |
| `/dashboard/settings` | Settings | App settings |
| `/dashboard/admin` | Admin dashboard | Admin-only stats |
| `/dashboard/super-admin` | SuperAdmin dashboard | Platform-level stats |

---

## 📡 Frontend API Clients (`lib/api/`)

### `client.ts`
- Axios instance
- `baseURL`: `process.env.NEXT_PUBLIC_API_URL` || `http://localhost:5001/api`
- Request interceptor: attaches `Authorization: Bearer <token>` from Zustand `authStore`
- Response interceptor: auto-redirects to `/login` on 401

### `guests.ts` — `guestsApi`
Key method: `search(query)` → `GET /Guests/search?name={query}` — **case-insensitive** (uses `ILike` on backend)

### `reservations.ts` — `reservationsApi`
Covers full CRUD + all status transitions + payment recording + available rooms query

### `walk-in.ts` — `walkInApi`
```typescript
getAvailableRoomsTonight(hotelId)   // GET /walkin/available-rooms/{id}
getGuestIntelligence(guestId)       // GET /walkin/guest-intelligence/{id}
quickCheckIn(dto)                   // POST /walkin/quick-checkin
expressCheckOut(reservationId, dto) // POST /walkin/express-checkout/{id}
updateGuestFlags(guestId, dto)      // PATCH /walkin/guest-flags/{id}
```

### `inventory.ts` — `inventoryApi`
Full CRUD + low-stock + restock/use + cost-analysis

### `housekeeping.ts` — `housekeepingApi`
Full CRUD + schedule + start/complete + performance + generate-daily

---

## ✅ Implemented Features (Phase Completion Status)

### ✅ Foundation (Complete)
- JWT Authentication (login, registration, token refresh on each request)
- Role-based access control with custom policies
- Hotel CRUD with ownership filtering
- Room CRUD with status management
- Guest CRUD with VIP/blacklist system
- Reservation CRUD with full lifecycle (Pending → Confirmed → CheckedIn → CheckedOut)
- Short-stay (hourly) booking support alongside daily bookings
- Room availability engine (checks conflicts, buffer time)
- Drag-and-drop reservation calendar
- Dashboard with today's metrics, occupancy chart, recent activity
- Reports page (revenue, occupancy, payment summaries)
- User management with role assignment
- Profile editing

### ✅ Phase 1A — Reporting & Analytics (Complete)
- `ReportsController` with daily/weekly/monthly revenue, outstanding payments, occupancy history, guest summaries
- Frontend `/dashboard/reports` page with charts

### ✅ Phase 1B — Inventory & Housekeeping (Complete)
**Backend:**
- `InventoryItem`, `InventoryTransaction`, `HousekeepingTask` entities
- Full CRUD for both + specialized endpoints (low-stock alerts, cost analysis, task scheduling, performance metrics)
- Auto-generate daily housekeeping tasks from checkouts
- Completing a housekeeping task auto-sets room status to `Available`

**Frontend:**
- `/dashboard/inventory`: Tabs for Stock Items / Transactions / Cost Analysis; Low-stock alert banner; Add Item dialog; Record Transaction dialog
- `/dashboard/housekeeping`: Tabs for Daily Schedule / All Tasks / Performance; Start/Complete task controls; Generate Daily Tasks button; Task assignment

### ✅ Phase 1C — Enhanced Walk-In Guest Management (Complete)
**Backend (`WalkInController`):**
- `QuickCheckIn`: creates new guest (if needed) + reservation + confirm + check-in atomically; supports discount amount/reason; supports price override
- `ExpressCheckOut`: adds extra charges (minibar, damages), records final payment, performs checkout
- `GuestIntelligence`: returns total stays, total spent, last stay, most-used room type, outstanding payments flag, recent 5 stays
- `UpdateGuestFlags`: toggle VIP, blacklist with reason, update notes
- `GetAvailableRoomsTonight`: shortcut for tonight's available rooms

**`Reservation` entity additions:**
- `DiscountAmount`, `DiscountReason` — applied during walk-in pricing
- `ExtraCharges`, `ExtraChargesNotes` — applied during express checkout

**Frontend (`/dashboard/walk-in`):**
- Step 1 (Guest): search existing guest (case-insensitive by name/email/phone) OR register new guest inline
- Step 2 (Room): available rooms tonight grid with price/type/capacity
- Step 3 (Pricing): price override field, discount amount + reason dropdown, deposit, payment method, special requests; live price summary
- Step 4 (Confirm): summary of everything, blacklist warning if applicable
- Guest History popup: total stats + recent 5 stays + VIP toggle
- Express Checkout modal: extra charges, final payment, payment method
- Right panel: live list of checked-in guests with quick checkout button

**Bug fix (in this session):**
- `GuestService.SearchByNameAsync` switched from `Contains()` to `EF.Functions.ILike()` for PostgreSQL case-insensitive search; also extended to search email and phone

---

## ❌ Not Yet Implemented (Pending Phases)

### Phase 1D — Advanced Scheduling & Availability
- Overbooking protection (max occupancy warnings, buffer enforcement)
- Visual calendar capacity indicators
- Smart room auto-assignment
- Room blocking for maintenance
- Recurring reservations

### Phase 1E — Basic Communication Tools
- Email confirmation after booking
- SMS notifications
- In-dashboard announcements

### Phase 1F — Staff & Role Management Enhancements
- Shift management (clock in/out, schedule, handover notes)
- Finer permission granularity (housekeepers vs front desk vs managers)
- Audit trail / activity logging

### Phase 2A — Public Booking Website
- Public landing page (no auth required)
- Hotel discovery with filters
- Date availability search
- Booking flow for guests
- Mobile-responsive

### Phase 2B — Guest Self-Service Portal
- My Bookings view
- Modify/cancel reservation
- Download invoice

### Phase 2C — Payment Integration (Stripe)
- Online card processing
- 3D Secure compliance
- Webhooks
- Automated refunds

### Phase 2D — Guest Reviews & Ratings
- Post-checkout review emails
- Star ratings, written reviews, admin responses

### Phase 3A — Subscription & Billing System
- `Subscription` entity with plan limits
- Stripe integration for recurring billing
- Feature gating by plan
- Trial management (14-day free)

### Phase 3B — Admin Onboarding Wizard
- 7-step setup wizard (account → hotel → rooms → staff → payment → launch)

### Phase 3C — Super Admin Dashboard
- Platform MRR, churn, total hotels/rooms/admins
- Account management, suspension, impersonation

---

## 🧩 Key Code Patterns

### Adding a new backend feature
1. Create entity in `Models/Entities/`
2. Add `DbSet<>` in `ApplicationDbContext.cs` + configure relationships in `OnModelCreating`
3. Add DTOs in `Models/DTOs/`
4. Add service interface in `Services/Interfaces/` + implementation in `Services/Implementations/`
5. Add AutoMapper mapping in `Infrastructure/Mapping/AutoMapperProfile.cs`
6. Register service in `Configurations/DependencyInjection.cs`
7. Create controller in `Controllers/`
8. Run `dotnet ef migrations add <MigrationName>` from project root

### Adding a new frontend page
1. Create `app/dashboard/<feature>/page.tsx` with `'use client'`
2. Wrap content in `<DashboardLayout>`
3. Add API client in `lib/api/<feature>.ts`
4. Export from `lib/api/index.ts`
5. Add sidebar link in `components/layout/Sidebar.tsx` with appropriate `permission`
6. Use `useQuery` for data fetching, `useMutation` for writes

### Authentication flow
1. `POST /api/auth/login` → JWT token in response
2. Token stored in Zustand `authStore` (persisted to `localStorage`)
3. Axios interceptor attaches token to every request
4. 401 response → auto logout + redirect to `/login`

### Walk-in quick check-in payload example
```typescript
{
  hotelId: 1,
  roomId: 5,
  existingGuestId: 12,           // OR
  newGuest: { firstName, lastName, email, phoneNumber, identificationNumber, nationality },
  checkInDate: "2026-04-02T15:00:00Z",
  checkOutDate: "2026-04-03T11:00:00Z",
  numberOfGuests: 2,
  discountAmount: 20,
  discountReason: "Regular customer",
  depositAmount: 50,
  paymentMethod: 1,              // 1=Cash
  specialRequests: "High floor"
}
```

---

## 🚨 Known Issues / Notes

- `Reservation` entity uses `[NotMapped]` computed properties (`TotalNights`, `IsActive`, `CanCheckIn`, `CanCheckOut`, `CanCancel`) — these are not stored in DB
- AutoMapper profile for `CreateReservationDto → Reservation` ignores `DiscountAmount`, `DiscountReason`, `ExtraCharges`, `ExtraChargesNotes` — these are set manually in `WalkInController`
- Backend currently uses `Npgsql.EnableLegacyTimestampBehavior` to handle UTC datetime normalization via a custom `ValueConverter` in `OnModelCreating`
- Hotel → ApplicationUser navigation causes EF warning about separated navigations (benign, model works correctly)
- Frontend `guestsApi.search()` sends param as `name` (not `query`) to match backend `[FromQuery] string name`

---

## 📦 Dependencies

### Backend (NuGet)
- `Microsoft.AspNetCore.Identity.EntityFrameworkCore`
- `Microsoft.EntityFrameworkCore.Design`
- `Npgsql.EntityFrameworkCore.PostgreSQL`
- `Microsoft.AspNetCore.Authentication.JwtBearer`
- `AutoMapper.Extensions.Microsoft.DependencyInjection`
- `FluentValidation.AspNetCore`

### Frontend (npm)
- `next` 14
- `@tanstack/react-query` v5
- `axios`
- `zustand`
- `tailwindcss`
- `lucide-react`
- `@radix-ui/react-*` (via shadcn/ui)
- `date-fns`
- `recharts` (for charts in reports/dashboard)

---

## 🎯 Suggested Next Steps (in priority order)

1. **Phase 1D** — Advanced Scheduling: room blocking, overbooking protection, maintenance scheduling
2. **Phase 1F** — Staff shift management + activity audit log
3. **Phase 2A** — Public booking website (Next.js public routes, no auth required)
4. **Phase 2C** — Stripe payment integration
5. **Phase 3A** — Subscription & billing system

---

*Last updated: April 2026 — Phases 1A, 1B, 1C complete*
