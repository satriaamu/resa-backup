import { gql, useMutation } from '@apollo/client';
import { useState } from 'react';
import { useRouter } from 'next/router';

const LOGIN_MUTATION = gql`mutation($email:String!,$password:String!){login(email:$email,password:$password){token user{ id nama email role }}}`;

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [login, { loading }] = useMutation(LOGIN_MUTATION);

  async function submit(e: any) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await login({ variables: { email, password } });
      const token = data?.login?.token;
      const user = data?.login?.user;
      const role = user?.role;
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        // Redirect berdasarkan role
        if (role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } else {
        setError('Email atau password salah');
      }
    } catch (err: any) {
      setError(err?.message || 'Gagal login');
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    outline: 'none',
    fontSize: '0.95rem',
  };

  const btnStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: 'none',
    background: '#2563eb',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer',
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'Poppins, sans-serif' }}>
      <div style={{ width: 380, background: '#fff', borderRadius: 12, boxShadow: '0 8px 30px rgba(2,6,23,0.08)', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <img src="/champion-futsal-logo.png" alt="logo" style={{ height: 56, objectFit: 'contain' }} />
          <h2 style={{ margin: '12px 0 4px', color: '#0f172a' }}>Masuk</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Masuk untuk mengelola reservasi dan jadwal</p>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '8px 10px', borderRadius: 8, marginBottom: 12 }}>{error}</div>}

        <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
          <input id="email" required type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
          <input id="password" required type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} />
          <button type="submit" disabled={loading} style={btnStyle}>{loading ? 'Memproses...' : 'Masuk'}</button>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 6 }}>
            <a href="/register" style={{ color: '#2563eb', textDecoration: 'none', fontSize: '0.9rem' }}>Daftar</a>
            <a href="/" style={{ color: '#64748b', textDecoration: 'none', fontSize: '0.9rem' }}>Kembali ke beranda</a>
          </div>
        </form>
      </div>
    </div>
  );
}