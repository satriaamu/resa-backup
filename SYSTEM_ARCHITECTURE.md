# 🏗️ System Architecture - Multi-User Authentication

Dokumentasi lengkap sistem arsitektur untuk implementasi autentikasi multiuser.

---

## 📐 High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    CLIENT SIDE (Browser)                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────────────┐  ┌──────────────────┐                 │
│  │   Pages (Next.js)   │  │  Components      │                 │
│  ├─────────────────────┤  ├──────────────────┤                 │
│  │ - index.tsx         │  │ - Navbar         │                 │
│  │ - register.tsx (NEW)│  │ - ImageSlider    │                 │
│  │ - admin-login.tsx   │  │                  │                 │
│  │ - reservasi.tsx     │  │                  │                 │
│  │ - admin.tsx         │  │                  │                 │
│  │ - venue.tsx         │  │                  │                 │
│  │ - event.tsx         │  │                  │                 │
│  └─────────────────────┘  └──────────────────┘                 │
│           │                                                      │
│           │ useRouter, useState, useEffect                      │
│           │                                                      │
│  ┌──────────────────────────────────────────┐                 │
│  │  Apollo Client                           │                 │
│  │  ├─ cache                                │                 │
│  │  ├─ link (HTTP to backend)               │                 │
│  │  └─ credentials (include)                │                 │
│  └──────────────────────────────────────────┘                 │
│           │                                                      │
│  ┌──────────────────────────────────────────┐                 │
│  │  LocalStorage                            │                 │
│  │  ├─ authToken (JWT)                      │                 │
│  │  ├─ userId                               │                 │
│  │  ├─ userName                             │                 │
│  │  └─ userRole (user|admin)                │                 │
│  └──────────────────────────────────────────┘                 │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              │ HTTPS/GraphQL
                              │
        ┌─────────────────────┴──────────────────────┐
        ↓                                             ↓
  ┌─────────────────────────────────────────────────────────┐
  │           API GATEWAY / BACKEND SERVER                 │
  ├─────────────────────────────────────────────────────────┤
  │                                                         │
  │  ┌────────────────────────────────────────────────┐   │
  │  │  Apollo Server (GraphQL)                       │   │
  │  │  Port: 4000                                    │   │
  │  │                                                │   │
  │  │  Context Middleware:                          │   │
  │  │  ├─ Extract Authorization header              │   │
  │  │  ├─ Parse JWT token                           │   │
  │  │  └─ Set currentUser in context                │   │
  │  └────────────────────────────────────────────────┘   │
  │           │                                             │
  │           │ (Queries & Mutations)                      │
  │           ↓                                             │
  │  ┌────────────────────────────────────────────────┐   │
  │  │  Resolvers (src/resolvers.ts)                  │   │
  │  │                                                │   │
  │  │  Queries:                                      │   │
  │  │  ├─ fields()          → get all fields         │   │
  │  │  ├─ slots()           → get slots by field     │   │
  │  │  ├─ reservations()    → get user reservations │   │
  │  │  ├─ reservationsAll() → get all (admin)       │   │
  │  │  └─ me()              → get current user      │   │
  │  │                                                │   │
  │  │  Mutations:                                    │   │
  │  │  ├─ register()        → create user (NEW)     │   │
  │  │  ├─ login()           → authenticate (NEW)    │   │
  │  │  ├─ createReservation()                       │   │
  │  │  ├─ updateReservationStatus()                 │   │
  │  │  ├─ deleteReservation()                       │   │
  │  │  ├─ createSlot()                              │   │
  │  │  └─ deleteSlot()                              │   │
  │  └────────────────────────────────────────────────┘   │
  │           │                                             │
  │           │ (Authentication & Business Logic)          │
  │           ↓                                             │
  │  ┌────────────────────────────────────────────────┐   │
  │  │  Auth Module (src/auth.ts)                     │   │
  │  │                                                │   │
  │  │  ├─ hashPassword()     → bcryptjs              │   │
  │  │  ├─ verifyPassword()   → compare hash          │   │
  │  │  ├─ signToken()        → JWT generation        │   │
  │  │  └─ getUserFromToken() → JWT verification      │   │
  │  └────────────────────────────────────────────────┘   │
  │           │                                             │
  │           │ (Database Operations)                      │
  │           ↓                                             │
  │  ┌────────────────────────────────────────────────┐   │
  │  │  Prisma Client                                │   │
  │  │  ├─ user.create()                             │   │
  │  │  ├─ user.findUnique()                         │   │
  │  │  ├─ user.upsert()                             │   │
  │  │  ├─ field.findMany()                          │   │
  │  │  ├─ slot.findMany()                           │   │
  │  │  ├─ reservation.create()                      │   │
  │  │  └─ reservation.findMany()                    │   │
  │  └────────────────────────────────────────────────┘   │
  │           │                                             │
  └───────────┼─────────────────────────────────────────────┘
              │ SQL Queries
              │
┌─────────────┴────────────────────────────────────────┐
│          DATABASE (SQLite + Prisma)                 │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Tables:                                            │
│  ├─ User                                            │
│  │  ├─ id (PK)                                     │
│  │  ├─ nama (String)                               │
│  │  ├─ email (UNIQUE)                              │
│  │  ├─ password (hashed) [NEW]                    │
│  │  ├─ role (user|admin) [NEW]                    │
│  │  ├─ createdAt [NEW]                            │
│  │  ├─ updatedAt [NEW]                            │
│  │  └─ reservations (1:N)                         │
│  │                                                  │
│  ├─ Field                                           │
│  │  ├─ id (PK)                                     │
│  │  ├─ nama_lapangan                               │
│  │  ├─ tipe                                        │
│  │  ├─ harga_per_jam                               │
│  │  ├─ slots (1:N)                                 │
│  │  └─ reservations (1:N)                          │
│  │                                                  │
│  ├─ Slot                                            │
│  │  ├─ id (PK)                                     │
│  │  ├─ tanggal                                     │
│  │  ├─ jam_mulai                                   │
│  │  ├─ jam_selesai                                 │
│  │  ├─ status                                      │
│  │  ├─ fieldId (FK)                                │
│  │  └─ reservations (1:N)                          │
│  │                                                  │
│  └─ Reservation                                     │
│     ├─ id (PK)                                     │
│     ├─ userId (FK)                                 │
│     ├─ fieldId (FK)                                │
│     ├─ slotId (FK)                                 │
│     ├─ tanggal                                     │
│     ├─ jam_mulai                                   │
│     ├─ jam_selesai                                 │
│     └─ status                                      │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    USER REGISTRATION                        │
└─────────────────────────────────────────────────────────────┘

User Input
  │ nama, email, password
  ↓
┌─────────────────────────────────────────────────────┐
│  Frontend Validation                                │
│  ├─ Email format valid?                            │
│  ├─ Password >= 6 chars?                           │
│  ├─ Password match confirm?                        │
│  └─ All fields filled?                             │
└─────────────────────────────────────────────────────┘
  │ YES
  ↓
┌─────────────────────────────────────────────────────┐
│  GraphQL Mutation: register()                       │
│  POST http://localhost:4000/graphql                │
│  {                                                  │
│    "query": "mutation { register(...) }"           │
│  }                                                  │
└─────────────────────────────────────────────────────┘
  │
  ↓
┌─────────────────────────────────────────────────────┐
│  Backend Resolver: register()                       │
│                                                     │
│  1. Check email exists?                            │
│     ├─ YES: return error                           │
│     └─ NO: continue                                │
│                                                     │
│  2. Hash password                                  │
│     └─ bcryptjs.hashSync(password, 10)             │
│                                                     │
│  3. Create user in database                        │
│     └─ prisma.user.create({...})                   │
│                                                     │
│  4. Generate JWT token                             │
│     └─ jwt.sign({ id, email, role }, SECRET)      │
│                                                     │
│  5. Return AuthResponse                            │
│     ├─ success: true                               │
│     ├─ message: "Registrasi berhasil"              │
│     ├─ token: "eyJhbGc..."                         │
│     └─ user: { id, nama, email, role }             │
└─────────────────────────────────────────────────────┘
  │
  ↓
┌─────────────────────────────────────────────────────┐
│  Frontend Handler                                   │
│                                                     │
│  1. Save to localStorage                           │
│     ├─ authToken                                   │
│     ├─ userId                                      │
│     ├─ userName                                    │
│     └─ userRole                                    │
│                                                     │
│  2. Update UI                                      │
│     └─ Navbar shows user name                      │
│                                                     │
│  3. Redirect                                       │
│     └─ router.push("/reservasi")                   │
└─────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────┐
│                      USER LOGIN                             │
└─────────────────────────────────────────────────────────────┘

User Input
  │ email, password
  ↓
┌─────────────────────────────────────────────────────┐
│  Frontend Validation                                │
│  ├─ Email filled?                                  │
│  ├─ Password filled?                               │
│  └─ Email format valid?                            │
└─────────────────────────────────────────────────────┘
  │ YES
  ↓
┌─────────────────────────────────────────────────────┐
│  GraphQL Mutation: login()                          │
│  POST http://localhost:4000/graphql                │
└─────────────────────────────────────────────────────┘
  │
  ↓
┌─────────────────────────────────────────────────────┐
│  Backend Resolver: login()                          │
│                                                     │
│  1. Find user by email                             │
│     ├─ Found: continue                             │
│     └─ Not found: error "Email atau password salah"│
│                                                     │
│  2. Verify password                                │
│     ├─ bcryptjs.compareSync(input, hash)           │
│     ├─ Match: continue                             │
│     └─ No match: error "Email atau password salah" │
│                                                     │
│  3. Check role (admin login only)                  │
│     ├─ Admin check: validate role == 'admin'       │
│     ├─ Valid: continue                             │
│     └─ Invalid: error "Hanya admin..."             │
│                                                     │
│  4. Generate JWT token                             │
│     └─ jwt.sign({ id, email, role }, SECRET)      │
│                                                     │
│  5. Return AuthResponse                            │
│     ├─ success: true                               │
│     ├─ message: "Login berhasil"                   │
│     ├─ token: "eyJhbGc..."                         │
│     └─ user: { id, nama, email, role }             │
└─────────────────────────────────────────────────────┘
  │
  ↓
┌─────────────────────────────────────────────────────┐
│  Frontend Handler                                   │
│                                                     │
│  1. Save to localStorage (same as register)        │
│  2. Update UI (same as register)                   │
│  3. Redirect                                       │
│     ├─ if admin: /admin                            │
│     └─ if user: /reservasi                         │
└─────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────┐
│               BOOKING WITH LOGIN CHECK                      │
└─────────────────────────────────────────────────────────────┘

User Access /reservasi
  │
  ↓
┌─────────────────────────────────────────────────────┐
│  Frontend: Check Authentication                     │
│                                                     │
│  useEffect(() => {                                 │
│    const token = localStorage.getItem('authToken') │
│    const userId = localStorage.getItem('userId')   │
│                                                     │
│    if (!token || !userId) {                        │
│      setIsLoggedIn(false)  ← NOT LOGGED IN         │
│    } else {                                         │
│      setIsLoggedIn(true)   ← LOGGED IN             │
│    }                                                │
│  }, [])                                            │
└─────────────────────────────────────────────────────┘
  │
  ├─── NOT LOGGED IN ─────────────────────────────────┐
  │                                                    │
  ↓                                                    │
┌──────────────────────────────────────────────────┐  │
│  Render Login Prompt                             │  │
│  ├─ Warning message                              │  │
│  ├─ Button: "Login / Register Sekarang"          │  │
│  └─ Button: "Kembali ke Home"                    │  │
│                                                   │  │
│  If user clicks login button:                    │  │
│  └─ router.push("/register")                     │  │
└──────────────────────────────────────────────────┘  │
  │                                                    │
  └─── LOGGED IN ────────────────────────────────────┐
                                                     │
                                                     ↓
                                    ┌────────────────────────────────┐
                                    │  Load Booking Interface        │
                                    │  ├─ Fetch fields               │
                                    │  ├─ Show field list            │
                                    │  ├─ Allow slot selection       │
                                    │  └─ Show reservation form      │
                                    └────────────────────────────────┘
                                                     │
                                                     ↓
                                    ┌────────────────────────────────┐
                                    │  User Selects & Books          │
                                    │                                │
                                    │  GraphQL: createReservation()  │
                                    │  {                             │
                                    │    userId (from token)         │
                                    │    fieldId, slotId             │
                                    │    tanggal, jam_mulai/selesai  │
                                    │  }                             │
                                    └────────────────────────────────┘
```

---

## 🔄 Data Flow Diagram

```
┌────────────────────────────────────┐
│      User Actions/Input            │
├────────────────────────────────────┤
│ • Register form submit             │
│ • Login form submit                │
│ • Select lapangan                  │
│ • Select waktu                     │
│ • Book lapangan                    │
└────────────────────────────────────┘
           │
           ↓
┌────────────────────────────────────┐
│   Next.js Pages & Components       │
├────────────────────────────────────┤
│ • Validate input                   │
│ • Format data                      │
│ • Handle user interactions         │
│ • Manage local state               │
└────────────────────────────────────┘
           │
           ↓
┌────────────────────────────────────┐
│    Apollo Client                   │
├────────────────────────────────────┤
│ • Build GraphQL query/mutation     │
│ • Add headers (Authorization)      │
│ • Send HTTP POST to backend        │
│ • Receive response                 │
│ • Update cache                     │
└────────────────────────────────────┘
           │
           │ HTTP POST
           │ Content-Type: application/json
           │ Authorization: Bearer {token}
           ↓
┌────────────────────────────────────┐
│    Apollo Server (Backend)         │
├────────────────────────────────────┤
│ • Parse request                    │
│ • Extract authorization header     │
│ • Verify JWT token                 │
│ • Set currentUser in context       │
│ • Route to appropriate resolver    │
└────────────────────────────────────┘
           │
           ↓
┌────────────────────────────────────┐
│    Resolvers                       │
├────────────────────────────────────┤
│ • Validate input parameters        │
│ • Apply business logic             │
│ • Call Prisma methods              │
│ • Return formatted data            │
└────────────────────────────────────┘
           │
           ↓
┌────────────────────────────────────┐
│    Prisma Client                   │
├────────────────────────────────────┤
│ • Generate SQL queries             │
│ • Execute against database         │
│ • Handle transactions              │
│ • Return results                   │
└────────────────────────────────────┘
           │
           ↓
┌────────────────────────────────────┐
│    SQLite Database                 │
├────────────────────────────────────┤
│ • Read/Write data                  │
│ • Enforce constraints              │
│ • Return results                   │
└────────────────────────────────────┘
           │
           │ (Response flows back)
           ↓
```

---

## 🔐 Token Flow Diagram

```
REGISTRATION/LOGIN
       │
       ├─ User credentials (email, password)
       │
       ↓
   Backend: Verify password & create JWT
       │
       ├─ jwt.sign({
       │   id: user.id,
       │   email: user.email,
       │   role: user.role
       │ }, JWT_SECRET, { expiresIn: '7d' })
       │
       └─ Return token: "eyJhbGciOiJIUzI1NiIsInR5..."
              │
              ↓
       Frontend: Save to localStorage
              │
              ├─ localStorage.setItem('authToken', token)
              └─ localStorage.setItem('userId', user.id)
              │
              ↓
       Browser Storage (localStorage)
              │
              ├─ authToken: "eyJhbGciOiJIUzI1NiIsInR5..."
              ├─ userId: "1"
              ├─ userName: "John Doe"
              └─ userRole: "user"
              │
              ↓
   SUBSEQUENT REQUESTS
              │
              ├─ Apollo Client retrieves token from localStorage
              ├─ Sets Authorization header: "Bearer {token}"
              │
              ↓
       Backend: Verify token
              │
              ├─ Extract token from Authorization header
              ├─ jwt.verify(token, JWT_SECRET)
              ├─ Decode payload
              └─ Set currentUser in context
              │
              ↓
       Resolver: Use currentUser
              │
              ├─ Access currentUser.id
              ├─ Access currentUser.email
              ├─ Access currentUser.role
              └─ Apply authorization logic
```

---

## 📊 State Management Diagram

```
┌──────────────────────────────────────────────────┐
│         APPLICATION STATE MANAGEMENT             │
└──────────────────────────────────────────────────┘

Frontend State Layers:

┌─────────────────────────────────────┐
│  Browser LocalStorage (Persistent)  │
├─────────────────────────────────────┤
│ • authToken (JWT)                   │
│ • userId                            │
│ • userName                          │
│ • userRole                          │
│                                     │
│ Purpose: Session persistence       │
│ Duration: Until manual clear       │
└─────────────────────────────────────┘
        │ Read on app init
        ↓
┌─────────────────────────────────────┐
│  Apollo Client Cache                │
├─────────────────────────────────────┤
│ • Query results                     │
│ • User info                         │
│ • Fields & Slots                    │
│ • Reservations                      │
│                                     │
│ Purpose: Reduce API calls           │
│ Duration: Current session           │
└─────────────────────────────────────┘
        │ Provide to components
        ↓
┌─────────────────────────────────────┐
│  React Component State              │
├─────────────────────────────────────┤
│ • isLoggedIn (boolean)              │
│ • userName (string)                 │
│ • userRole (string)                 │
│ • selectedField (object)            │
│ • formData (object)                 │
│ • loading (boolean)                 │
│ • error (string)                    │
│                                     │
│ Purpose: UI control                 │
│ Duration: Component mount           │
└─────────────────────────────────────┘

Backend State Layers:

┌─────────────────────────────────────┐
│  Context (Request-scoped)           │
├─────────────────────────────────────┤
│ • currentUser (from JWT)            │
│ • authorization info                │
│                                     │
│ Purpose: Auth on each request       │
│ Duration: Single request            │
└─────────────────────────────────────┘
        │
        ↓
┌─────────────────────────────────────┐
│  Resolver Variables                 │
├─────────────────────────────────────┤
│ • userId, fieldId, slotId           │
│ • Form data                         │
│ • Derived values                    │
│                                     │
│ Purpose: Mutation processing        │
│ Duration: Single request            │
└─────────────────────────────────────┘
        │
        ↓
┌─────────────────────────────────────┐
│  Database (Persistent)              │
├─────────────────────────────────────┤
│ • All tables (User, Field, etc)     │
│ • Constraints & relationships       │
│                                     │
│ Purpose: Data persistence           │
│ Duration: Indefinite                │
└─────────────────────────────────────┘
```

---

## 🔗 Component Interaction Diagram

```
┌──────────────────────────────────────────────────────────┐
│                    _app.tsx                              │
│              (Apollo Provider)                           │
└──────────────┬───────────────────────────────────────────┘
               │
        ┌──────┴──────────────────┬─────────────────┬─────────────┐
        │                         │                 │             │
        ↓                         ↓                 ↓             ↓
┌─────────────────┐    ┌──────────────────┐   ┌────────────┐   ┌──────────┐
│   navbar.tsx    │    │  Pages/Routes    │   │ Components │   │ Context  │
├─────────────────┤    ├──────────────────┤   ├────────────┤   ├──────────┤
│ • User profile  │    │ • register.tsx   │   │ • Slider   │   │ Auth     │
│ • Login/Logout  │    │ • admin-login    │   │ • Form     │   │ Theme    │
│ • Navigation    │    │ • reservasi      │   │ • Modal    │   │          │
│ • Role badge    │    │ • admin          │   │            │   │          │
└────────┬────────┘    └────────┬─────────┘   └────────────┘   └──────────┘
         │                      │
         └──────────────────────┼──────────────────────┐
                                │                      │
         ┌──────────────────────┘                      │
         │                                             │
         ↓                                             ↓
    ┌────────────────────────┐            ┌──────────────────┐
    │  Apollo Client         │            │ LocalStorage     │
    ├────────────────────────┤            ├──────────────────┤
    │ Queries:               │            │ • authToken      │
    │ • fields               │            │ • userId         │
    │ • slots                │            │ • userName       │
    │ • me                   │            │ • userRole       │
    │ • reservations         │            └──────────────────┘
    │                        │
    │ Mutations:             │
    │ • register             │
    │ • login                │
    │ • createReservation    │
    └──────────┬─────────────┘
               │
      GraphQL over HTTP
               │
               ↓
    ┌────────────────────────┐
    │  Backend API           │
    │  (Apollo Server)       │
    └────────────────────────┘
```

---

## 🎯 User Journey Map

```
GUEST USER
    │
    ├─ Visits Homepage
    │  └─ Sees "Login / Register" button
    │
    ├─ Clicks "Login / Register"
    │  └─ Redirects to /register
    │
    ├─ Chooses Registration
    │  ├─ Fills form
    │  ├─ Validates inputs
    │  └─ Submits
    │
    ├─ Backend processes
    │  ├─ Hash password
    │  ├─ Create user
    │  ├─ Generate token
    │  └─ Return AuthResponse
    │
    ├─ Frontend saves token
    │  ├─ Save to localStorage
    │  ├─ Update navbar
    │  └─ Show user name
    │
    └─ Auto-redirect to /reservasi
       │
       └─ REGISTERED USER ──────────┐
                                    │
                                    ├─ Browse lapangan
                                    ├─ Select tanggal & jam
                                    ├─ Fill reservation form
                                    ├─ Submit booking
                                    ├─ Get receipt
                                    ├─ Print/Save PDF
                                    │
                                    └─ Can logout anytime
                                       └─ Clears session
                                          └─ Redirects to home
```

```
ADMIN USER
    │
    ├─ Visits Homepage
    │  └─ Clicks "Admin Login"
    │
    ├─ Redirects to /admin-login
    │  ├─ Fills email & password
    │  └─ Submits
    │
    ├─ Backend validates
    │  ├─ Check user exists
    │  ├─ Verify password
    │  ├─ Check role == 'admin'
    │  ├─ Generate token
    │  └─ Return AuthResponse
    │
    ├─ Frontend saves token
    │  └─ localStorage.userRole = 'admin'
    │
    └─ Auto-redirect to /admin
       │
       └─ ADMIN DASHBOARD
          ├─ View all reservations
          ├─ Update reservation status
          ├─ Manage lapangan & slots
          ├─ View analytics
          │
          └─ Can logout anytime
```

---

**Last Updated:** 16 January 2026
**Version:** 1.0
