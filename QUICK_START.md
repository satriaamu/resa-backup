# 🚀 Quick Start Guide - Multi-User Authentication

Panduan cepat untuk menjalankan aplikasi dengan fitur autentikasi multiuser.

---

## ⚡ 5-Minute Setup

### 1. Start Backend
```bash
cd champion-backend
npm install  # if needed
npx prisma migrate deploy  # or migrate dev
npm run dev
```
✓ Backend berjalan di http://localhost:4000

### 2. Start Frontend
```bash
cd champion-frontend
npm install  # if needed
npm run dev
```
✓ Frontend berjalan di http://localhost:3000

### 3. Database Ready
✓ Prisma migration sudah berjalan
✓ Database schema updated with authentication fields

---

## 🎮 Quick Test Flow

### Test 1: Register User
```
1. Buka http://localhost:3000
2. Klik "Login / Register"
3. Register dengan data:
   - Nama: "Budi"
   - Email: "budi@test.com"
   - Password: "password123"
4. Verify: berhasil register, redirect ke /reservasi
5. Check navbar: tampil "👤 Budi"
```

### Test 2: Logout & Login
```
1. Klik "Logout" di navbar
2. Klik "Login / Register"
3. Login dengan:
   - Email: "budi@test.com"
   - Password: "password123"
4. Verify: berhasil login, redirect ke /reservasi
```

### Test 3: Try Booking
```
1. Di /reservasi, pilih lapangan
2. Pilih tanggal dan jam
3. Isi form reservasi
4. Klik "Kirim Reservasi"
5. Verify: berhasil booking, muncul bukti
```

### Test 4: Admin Login
```
1. Logout dulu
2. Klik "Admin Login"
3. (Untuk testing, ubah user role jadi admin di database)
4. Login dengan admin credentials
5. Verify: redirect ke /admin dashboard
```

---

## 📱 Architecture Overview

```
┌─────────────────────────────────────┐
│     FRONTEND (Next.js + Apollo)     │
├─────────────────────────────────────┤
│ pages/register.tsx     (NEW)        │
│ pages/admin-login.tsx  (UPDATED)    │
│ pages/reservasi.tsx    (UPDATED)    │
│ pages/navbar.tsx       (UPDATED)    │
└────────────┬────────────────────────┘
             │
      GraphQL (Apollo)
             │
┌────────────┴────────────────────────┐
│  BACKEND (Node.js + Apollo Server)  │
├─────────────────────────────────────┤
│ Mutations:                          │
│  - register()                       │
│  - login()                          │
│  - createReservation()              │
│                                     │
│ Queries:                            │
│  - fields()                         │
│  - slots()                          │
│  - me()                             │
└────────────┬────────────────────────┘
             │
┌────────────┴────────────────────────┐
│   DATABASE (SQLite + Prisma)        │
├─────────────────────────────────────┤
│ User (password, role, timestamps)   │
│ Field, Slot, Reservation (existing) │
└─────────────────────────────────────┘
```

---

## 🔐 Key Features

| Feature | Status | Details |
|---------|--------|---------|
| User Registration | ✅ | With password hashing |
| User Login | ✅ | JWT token-based |
| Admin Login | ✅ | Role-based access |
| Logout | ✅ | Clear session data |
| Login Requirement | ✅ | Booking requires login |
| Password Hashing | ✅ | Bcryptjs (10 salt rounds) |
| JWT Token | ✅ | 7 days expiration |
| User Profile | ✅ | Display in navbar |
| Role System | ✅ | "user" dan "admin" |

---

## 📂 Files Modified/Created

### New Files
```
✨ pages/register.tsx                 - User registration page
✨ AUTHENTICATION_GUIDE.md            - Full documentation
✨ TESTING_GUIDE.md                   - Testing instructions
```

### Modified Backend
```
📝 src/auth.ts                        - Password hashing functions
📝 src/schema.ts                      - GraphQL auth types
📝 src/resolvers.ts                   - Login/register logic
📝 src/index.ts                       - Auth context middleware
📝 prisma/schema.prisma               - User model update
```

### Modified Frontend
```
📝 pages/admin-login.tsx              - GraphQL-based login
📝 pages/reservasi.tsx                - Login requirement check
📝 pages/navbar.tsx                   - Auth UI + logout
```

---

## 🛠️ Customization

### Change JWT Expiration
File: `src/auth.ts`
```typescript
export function signToken(payload: object) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' }); // Change to 30 days
}
```

### Change Password Requirements
File: `pages/register.tsx`
```typescript
if (password.length < 8) { // Change to 8 chars
  setError("Password minimal 8 karakter");
}
```

### Add Email Verification
1. Add `emailVerified` field to User model
2. Send verification email on register
3. Require verification before login
4. Create `/verify-email` page

### Add Google OAuth
1. Install `next-auth` or similar
2. Configure Google OAuth app
3. Add sign-in with Google button
4. Update auth flow

---

## ⚠️ Important Notes

1. **Password Hashing**
   - Never store plain passwords
   - Always use bcryptjs or similar
   - Current: bcryptjs with 10 salt rounds

2. **Token Storage**
   - Stored in localStorage (vulnerable to XSS)
   - Better: HttpOnly cookies (requires backend setup)
   - For production: implement refresh tokens

3. **HTTPS Required**
   - For production, always use HTTPS
   - Tokens can be intercepted over HTTP

4. **Rate Limiting**
   - Consider adding rate limiting on login
   - Prevent brute force attacks
   - Example: max 5 login attempts per 15 minutes

---

## 🐛 Troubleshooting

### Frontend tidak bisa connect ke Backend
```
❌ Error: Network request failed

✅ Solution:
1. Verify backend running: curl http://localhost:4000
2. Check CORS settings in backend
3. Verify frontend apolloClient points to correct URL
```

### Password tidak match saat login
```
❌ Error: Email atau password salah

✅ Solution:
1. Verify bcryptjs installed: npm list bcryptjs
2. Check migration applied: npx prisma migrate status
3. Try logout and login again
```

### Token tidak tersimpan
```
❌ localStorage.getItem('authToken') returns null

✅ Solution:
1. Check browser localStorage not disabled
2. Check GraphQL response includes token
3. Check browser console for errors
```

### Booking page still loads without login
```
❌ Can see booking form without login

✅ Solution:
1. Hard refresh (Ctrl+Shift+R)
2. Clear browser cache
3. Check localStorage checks in useEffect
```

---

## 📞 Support

For issues or questions:
1. Check [AUTHENTICATION_GUIDE.md](./AUTHENTICATION_GUIDE.md) for detailed docs
2. Check [TESTING_GUIDE.md](./TESTING_GUIDE.md) for test cases
3. Review GraphQL schema: http://localhost:4000/graphql
4. Check browser DevTools:
   - Network tab for API calls
   - Console for errors
   - Application tab for localStorage

---

## 🎓 Learning Resources

- [JWT Tokens](https://jwt.io/)
- [Bcryptjs](https://github.com/dcodeIO/bcrypt.js)
- [Apollo Client](https://www.apollographql.com/docs/react/)
- [Apollo Server](https://www.apollographql.com/docs/apollo-server/)
- [Prisma Auth](https://www.prisma.io/docs/orm/guides/best-practices/nextjs-prisma-setup-postgres)

---

## 🎯 Next Steps

1. ✅ Test registration & login
2. ✅ Test booking with login requirement
3. ✅ Test admin login
4. ✅ Create test admin account
5. ⏳ Add email verification
6. ⏳ Add refresh tokens
7. ⏳ Add OAuth/SSO
8. ⏳ Add password reset

---

**Happy Coding! 🚀**

Last Updated: 16 January 2026
Version: 1.0
