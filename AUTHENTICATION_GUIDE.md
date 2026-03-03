# 🎯 Multi-User Authentication & Registration Implementation

Dokumentasi lengkap untuk fitur autentikasi multiuser, registrasi, dan login requirement untuk booking.

---

## 📋 Ringkasan Perubahan

### Backend (champion-backend)

#### 1. **Prisma Schema Update** (`schema.prisma`)
- Menambahkan field `password` untuk hash password
- Menambahkan field `role` dengan default "user" (user | admin)
- Menambahkan `createdAt` dan `updatedAt` timestamps

#### 2. **Authentication Helper** (`src/auth.ts`)
- `hashPassword()` - Hash password menggunakan bcryptjs
- `verifyPassword()` - Verifikasi password yang di-hash
- `signToken()` - Generate JWT token (existing)
- `getUserFromToken()` - Verify JWT token (existing)

#### 3. **GraphQL Schema** (`src/schema.ts`)
- Type `AuthResponse` - Response dari login/register mutation
- Query `me` - Cek user dari token
- Mutation `register(nama, email, password)` - Registrasi user baru
- Mutation `login(email, password)` - Login user/admin

#### 4. **Resolvers** (`src/resolvers.ts`)
- `register()` - Create user baru dengan password yang di-hash
- `login()` - Autentikasi dan generate JWT token
- Validasi email sudah terdaftar
- Validasi password match
- Context dengan `currentUser` dari token

#### 5. **Server Setup** (`src/index.ts`)
- Tambah context middleware untuk ekstrak user dari Authorization header
- Pass currentUser ke resolvers

---

### Frontend (champion-frontend)

#### 1. **Registration Page** (`pages/register.tsx`) ✨ NEW
- Form registrasi dengan validasi
- Toggle antara Register dan Login mode
- Fields: Nama, Email, Password, Confirm Password
- Local storage untuk token dan user info
- Redirect ke /reservasi setelah sukses register/login

#### 2. **Admin Login Update** (`pages/admin-login.tsx`)
- Menggunakan GraphQL `login` mutation
- Validasi hanya admin yang bisa login
- Token-based authentication
- Improved UI dengan gradient background

#### 3. **Reservasi Page Update** (`pages/reservasi.tsx`)
- Check login status dari localStorage
- Jika belum login, tampilkan prompt login
- Button "Login / Register Sekarang"
- Redirect ke /register jika belum login

#### 4. **Navbar Update** (`pages/navbar.tsx`)
- Display user name dan role (Admin) jika sudah login
- Tombol "Login / Register" jika belum login
- Tombol "Admin Login" untuk admin
- Logout button dengan hapus localStorage
- Responsive styling

---

## 🚀 Cara Menggunakan

### 1. **User Registration & Login**

**Registrasi:**
```
1. Klik "Login / Register" di navbar
2. Pilih mode "Register"
3. Isi: Nama, Email, Password, Confirm Password
4. Klik "Register"
5. Auto redirect ke halaman reservasi
```

**Login:**
```
1. Klik "Login / Register" di navbar
2. Pilih mode "Login" 
3. Isi: Email, Password
4. Klik "Login"
5. Auto redirect ke halaman reservasi
```

### 2. **Admin Login**

```
1. Klik "Admin Login" di navbar
2. Isi: Email (admin), Password
3. Klik "Login"
4. Auto redirect ke /admin dashboard
```

### 3. **Booking Lapangan**

```
1. User harus login terlebih dahulu
2. Akses /reservasi atau /venue
3. Pilih lapangan dan waktu
4. Klik "Pesan"
5. Isi form dan submit
```

---

## 🔐 Database Schema

### User Table
```prisma
model User {
  id           Int      @id @default(autoincrement())
  nama         String
  email        String   @unique
  password     String   (hashed with bcryptjs)
  role         String   @default("user")  // "user" | "admin"
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  reservations Reservation[]
}
```

---

## 📱 API Endpoints

### GraphQL Mutations

#### **Register**
```graphql
mutation Register($nama: String!, $email: String!, $password: String!) {
  register(nama: $nama, email: $email, password: $password) {
    success
    message
    token
    user {
      id
      nama
      email
      role
    }
  }
}
```

#### **Login**
```graphql
mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    success
    message
    token
    user {
      id
      nama
      email
      role
    }
  }
}
```

### GraphQL Query

#### **Get Current User**
```graphql
query {
  me {
    id
    nama
    email
    role
  }
}
```

---

## 🛡️ Security Features

1. **Password Hashing** - Bcryptjs dengan salt rounds 10
2. **JWT Tokens** - 7 days expiration
3. **Email Uniqueness** - Constraint di database
4. **Role-Based Access** - "user" atau "admin"
5. **Authorization Header** - Token di Authorization: Bearer {token}
6. **LocalStorage** - Token disimpan di client untuk session management

---

## 🔄 Authentication Flow

```
User Input (email, password)
         ↓
GraphQL Mutation (login/register)
         ↓
Backend Validation & Password Hashing
         ↓
Generate JWT Token
         ↓
Return Token + User Info
         ↓
Save to localStorage
         ↓
Redirect ke halaman dashboard
```

---

## ⚙️ Setup Instructions

### Backend
```bash
cd champion-backend

# 1. Install dependencies (if needed)
npm install

# 2. Run migration
npx prisma migrate dev --name add_user_authentication

# 3. Generate Prisma Client
npx prisma generate

# 4. Start dev server
npm run dev
```

### Frontend
```bash
cd champion-frontend

# 1. Install dependencies (if needed)
npm install

# 2. Start dev server
npm run dev
```

---

## 🧪 Test Cases

### Registration
- ✅ Register user baru dengan email valid
- ✅ Validasi password minimal 6 karakter
- ✅ Validasi password match
- ✅ Cegah register dengan email yang sudah ada
- ✅ Token auto generate setelah register

### Login
- ✅ Login dengan email & password valid
- ✅ Validasi email/password salah
- ✅ Token auto generate setelah login
- ✅ Admin tidak bisa login melalui user login
- ✅ User tidak bisa login melalui admin login

### Booking
- ✅ Redirect ke login jika belum login
- ✅ Bisa booking setelah login
- ✅ Info user tersimpan di localStorage
- ✅ Logout hapus semua session data

---

## 📝 Default Test Credentials

**Admin Account** (Jika sudah seed):
```
Email: admin@champion.local
Password: admin123
Role: admin
```

Untuk testing, gunakan fitur register untuk membuat user baru.

---

## 🐛 Troubleshooting

### Password tidak cocok setelah hash
- Pastikan menggunakan `bcryptjs` bukan `bcrypt`
- Verify salt rounds: 10

### Token expired
- JWT expire time: 7 hari
- Clear localStorage dan login ulang

### Login redirect tidak berfungsi
- Check localStorage untuk authToken
- Pastikan token valid

### Booking masih bisa tanpa login
- Clear browser cache
- Cek useEffect dependency array di reservasi.tsx

---

## 📚 File yang Diubah

### Backend
- `prisma/schema.prisma` - Schema update
- `src/auth.ts` - Password hashing functions
- `src/schema.ts` - GraphQL type definitions
- `src/resolvers.ts` - Login/register logic
- `src/index.ts` - Context middleware

### Frontend
- `pages/register.tsx` - NEW registration page
- `pages/admin-login.tsx` - Updated admin login
- `pages/reservasi.tsx` - Login requirement
- `pages/navbar.tsx` - Auth UI elements

---

## ✨ Future Improvements

1. Email verification sebelum confirm register
2. Forgot password & reset password
3. OAuth/SSO integration (Google, Facebook)
4. Two-factor authentication (2FA)
5. Admin dashboard untuk manage users
6. Refresh token untuk security
7. Rate limiting untuk login attempts
8. Audit logs untuk login/register

---

**Last Updated:** 16 January 2026
**Version:** 1.0
**Author:** AI Assistant
