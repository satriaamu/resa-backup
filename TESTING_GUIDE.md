# 🧪 Testing Guide - Multi-User Authentication

Panduan lengkap untuk testing fitur autentikasi, registrasi, dan login requirement.

---

## ✅ Pre-Testing Checklist

- [ ] Database migration sudah berjalan
- [ ] Backend server berjalan di port 4000
- [ ] Frontend server berjalan di port 3000
- [ ] Browser cache sudah di-clear
- [ ] Local storage sudah kosong

---

## 🚀 Test Scenario 1: User Registration

### Step 1: Navigate to Register Page
```
1. Buka http://localhost:3000
2. Klik tombol "Login / Register" di navbar
3. Verifikasi halaman register terbuka dengan form
```

### Step 2: Test Valid Registration
```
Form Input:
- Nama: "John Doe"
- Email: "john@example.com"
- Password: "password123"
- Confirm Password: "password123"

Expected Results:
✓ Form submit tanpa error
✓ Message "Registrasi berhasil!"
✓ Auto redirect ke /reservasi (3 detik)
✓ Navbar menampilkan "👤 John Doe"
✓ Token tersimpan di localStorage
```

**Verify localStorage:**
```javascript
// Buka console dan jalankan:
console.log(localStorage.getItem('authToken'));
console.log(localStorage.getItem('userId'));
console.log(localStorage.getItem('userName'));
console.log(localStorage.getItem('userRole'));
```

### Step 3: Test Invalid Inputs

#### 3a. Password tidak cocok
```
Form Input:
- Nama: "Jane Doe"
- Email: "jane@example.com"
- Password: "password123"
- Confirm Password: "password456"

Expected:
✗ Error message: "Password tidak cocok"
✗ Form tidak submit
```

#### 3b. Password terlalu pendek
```
Form Input:
- Password: "abc" (kurang dari 6 char)

Expected:
✗ Error message: "Password minimal 6 karakter"
```

#### 3c. Email sudah terdaftar
```
Form Input:
- Email: "john@example.com" (sudah register di step 1)

Expected:
✗ Error message: "Email sudah terdaftar"
```

---

## 🔐 Test Scenario 2: User Login

### Step 1: Logout dulu (jika masih login)
```
1. Klik "Logout" di navbar
2. Verifikasi localStorage kosong
3. Navbar kembali menampilkan "Login / Register"
```

### Step 2: Test Valid Login
```
1. Klik "Login / Register" di navbar
2. Pilih mode "Login" (toggle)
3. Form Input:
   - Email: "john@example.com"
   - Password: "password123"
4. Klik "Login"

Expected:
✓ Message "Login berhasil!"
✓ Auto redirect ke /reservasi
✓ Navbar tampil "👤 John Doe"
✓ Token tersimpan di localStorage
```

### Step 3: Test Invalid Login

#### 3a. Email tidak terdaftar
```
Form Input:
- Email: "notexist@example.com"
- Password: "password123"

Expected:
✗ Error: "Email atau password salah"
```

#### 3b. Password salah
```
Form Input:
- Email: "john@example.com"
- Password: "wrongpassword"

Expected:
✗ Error: "Email atau password salah"
```

#### 3c. Field kosong
```
Form Input:
- Email: "" (kosong)
- Password: "" (kosong)

Expected:
✗ Error: "Email dan password harus diisi"
```

---

## 👨‍💼 Test Scenario 3: Admin Login

### Step 1: Logout user dulu
```
1. Klik "Logout" di navbar
```

### Step 2: Navigate to Admin Login
```
1. Klik "Admin Login" di navbar
2. Verifikasi halaman /admin-login terbuka
```

### Step 3: Test Admin Login dengan User Account
```
Form Input:
- Email: "john@example.com" (regular user)
- Password: "password123"

Expected:
✗ Error: "Hanya admin yang dapat login disini..."
✗ Tidak bisa login meskipun password benar
```

### Step 4: Create Admin Account for Testing

**Option A: Manual Database Edit**
```sql
-- Update user role menjadi admin
UPDATE User SET role = 'admin' WHERE email = 'john@example.com';
```

**Option B: Using Backend Console**
```javascript
// Jalankan di backend terlebih dahulu
// Edit src/seed.ts atau create migration
```

### Step 5: Test Admin Login (setelah update role)
```
Form Input:
- Email: "john@example.com" (now admin)
- Password: "password123"

Expected:
✓ Message "Login berhasil!"
✓ Auto redirect ke /admin
✓ Navbar tampil "👤 John Doe (Admin)" dengan warna merah
✓ localStorage['userRole'] = 'admin'
```

---

## 📅 Test Scenario 4: Booking dengan Login Requirement

### Step 1: Logout dulu
```
1. Klik "Logout" di navbar
2. Verifikasi localStorage kosong
```

### Step 2: Try access /reservasi without login
```
1. Akses http://localhost:3000/reservasi
2. Atau klik "Booking" di navbar

Expected:
✓ Halaman menampilkan warning message
✓ Tombol "Login / Register Sekarang"
✓ Tombol "Kembali ke Home"
✓ Tidak ada form booking visible
```

### Step 3: Click Login button
```
1. Dari halaman reservasi, klik "Login / Register Sekarang"
2. Register atau login user baru

Expected:
✓ Auto redirect kembali ke /reservasi
✓ Kali ini form booking visible
```

### Step 4: Test Booking Flow
```
1. Pilih lapangan
2. Pilih tanggal dan jam
3. Isi form reservasi
4. Click "Kirim Reservasi"

Expected:
✓ Reservasi berhasil
✓ Popup bukti reservasi
✓ Bisa print/save sebagai PDF
```

### Step 5: Verify Booking Data
```javascript
// Check di backend GraphQL playground:
query {
  reservations(userId: 1) {
    id
    user { nama email }
    field { nama_lapangan }
    slot { jam_mulai jam_selesai }
    status
  }
}
```

---

## 🔄 Test Scenario 5: Session Management

### Step 1: Token Persistence
```
1. Login dengan user
2. Refresh halaman (F5)
3. Logout dan refresh

Expected:
✓ Sebelum logout: session tetap aktif, user masih login
✓ Sesudah logout: session cleared, user perlu login ulang
```

### Step 2: Multiple Users
```
1. Login dengan john@example.com
2. Open browser developer console:
   localStorage.getItem('userName') → "John Doe"
3. Open incognito window
4. Register jane@example.com
5. Console check in incognito:
   localStorage.getItem('userName') → "Jane Doe"
6. Back to original window:
   localStorage.getItem('userName') → "John Doe" (unchanged)

Expected:
✓ Each browser/window punya session sendiri
✓ localStorage terpisah per browser instance
```

### Step 3: Token Expiration (7 days)
```
Test Manual (TBD):
1. Generate token
2. Wait untuk token expire (7 hari)
3. Try use expired token

Expected:
✗ Token invalid error
✗ User harus login ulang
```

---

## 🔍 Verification Checklist

### Frontend
- [ ] Register form works with validation
- [ ] Login form works with validation
- [ ] Admin login validates role
- [ ] Navbar shows user info when logged in
- [ ] Logout clears all data
- [ ] Booking page blocks non-login users
- [ ] Token persists in localStorage
- [ ] UI responsive on mobile

### Backend
- [ ] Register mutation creates user with hashed password
- [ ] Login mutation validates credentials
- [ ] JWT token generated correctly
- [ ] Password hash using bcryptjs
- [ ] Role field default "user"
- [ ] Email uniqueness constraint works
- [ ] Database migration applied

### Database
- [ ] User table has password field
- [ ] User table has role field
- [ ] email field is unique
- [ ] createdAt/updatedAt fields exist
- [ ] Old data migrated correctly

---

## 🐛 Common Issues & Solutions

### Issue: "Email sudah terdaftar" tapi email baru
**Solution:**
- Cek database apakah email sudah ada
- Restart backend server
- Clear database dan migrate ulang

### Issue: Password hash tidak cocok
**Solution:**
- Pastikan pakai bcryptjs (bukan bcrypt)
- Check salt rounds: 10
- Restart backend

### Issue: Token tidak tersimpan di localStorage
**Solution:**
- Check browser console untuk error
- Verify GraphQL response includes token
- Check localStorage key names match

### Issue: Redirect tidak berfungsi
**Solution:**
- Check Next.js router working
- Verify page path correct (/reservasi, /admin)
- Check localStorage checks run after mount

### Issue: CORS error
**Solution:**
- Backend ApolloServer allows all origins (default)
- Frontend apolloClient pointing to correct URL
- Check network tab di DevTools

---

## 📊 Test Report Template

```
TEST DATE: _______________
TESTER: ___________________

PASSED TESTS:
☐ User Registration
☐ User Login
☐ Admin Login
☐ Booking with Login
☐ Logout & Session Clear
☐ Token Persistence
☐ Error Handling

FAILED TESTS:
- [Issue description]
- [Issue description]

BUGS FOUND:
1. [Bug description]
2. [Bug description]

NOTES:
- [Additional notes]
```

---

## 🎯 Quick Test Links

```
Frontend:
- Home: http://localhost:3000
- Register: http://localhost:3000/register
- Admin Login: http://localhost:3000/admin-login
- Reservasi: http://localhost:3000/reservasi

Backend:
- GraphQL: http://localhost:4000/graphql
- Playground: http://localhost:4000 (dengan Apollo)
```

---

## 📚 GraphQL Test Queries

Copy-paste di Apollo Playground (http://localhost:4000)

### Test Register
```graphql
mutation {
  register(
    nama: "Test User"
    email: "test@example.com"
    password: "testpass123"
  ) {
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

### Test Login
```graphql
mutation {
  login(
    email: "test@example.com"
    password: "testpass123"
  ) {
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

### Test Get Current User
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

Headers (setelah login):
```json
{
  "Authorization": "Bearer {token_dari_login_response}"
}
```

---

**Happy Testing! 🎉**

Last Updated: 16 January 2026
