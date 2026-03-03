import { gql, useMutation } from '@apollo/client';
import { useState } from 'react';
import { useRouter } from 'next/router';

const CREATE_USER = gql`
  mutation($nama:String!,$email:String!,$password:String!){
    createUser(nama:$nama,email:$email,password:$password){ id nama email }
  }
`;

export default function Register(){
  const router = useRouter();
  const [nama,setNama] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [confirmPassword,setConfirmPassword] = useState('');
  const [error,setError] = useState('');
  const [success,setSuccess] = useState('');
  const [createUser, { loading }] = useMutation(CREATE_USER);

  async function submit(e:any){
    e.preventDefault();
    setError('');
    if(password !== confirmPassword){
      setError('Password tidak cocok');
      return;
    }
    try{
      const { data } = await createUser({ variables: { nama, email, password } });
      if(data?.createUser?.id){
        setSuccess('Pendaftaran berhasil. Silakan login.');
        setTimeout(()=>router.push('/login'),1200);
      } else {
        setError('Gagal mendaftar');
      }
    }catch(err:any){
      setError(err?.message || 'Gagal mendaftar');
    }
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: 'Poppins, sans-serif' }}>
      <div style={{ width: 420, background: '#fff', borderRadius: 12, boxShadow: '0 8px 30px rgba(2,6,23,0.06)', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: 14 }}>
          <h2 style={{ margin: 0, color: '#0f172a' }}>Daftar Akun</h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>Buat akun user untuk bisa melakukan reservasi</p>
        </div>

        {error && <div style={{ background: '#fee2e2', color: '#991b1b', padding: '8px 10px', borderRadius: 8, marginBottom: 12 }}>{error}</div>}
        {success && <div style={{ background: '#ecfccb', color: '#365314', padding: '8px 10px', borderRadius: 8, marginBottom: 12 }}>{success}</div>}

        <form onSubmit={submit} style={{ display: 'grid', gap: 12 }}>
          <input required placeholder="Nama lengkap" value={nama} onChange={e=>setNama(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }} />
          <input required type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }} />
          <input required type="password" placeholder="Password (min 6 karakter)" value={password} onChange={e=>setPassword(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }} />
          <input required type="password" placeholder="Konfirmasi Password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0' }} />
          <button type="submit" disabled={loading || password.length < 6 || password !== confirmPassword} style={{ padding: '10px 12px', borderRadius: 8, border: 'none', background: '#16a34a', color: '#fff', fontWeight: 600 }}>{loading? 'Memproses...':'Daftar'}</button>
          <div style={{ textAlign: 'center' }}>
            <a href="/login" style={{ color: '#2563eb', textDecoration: 'none' }}>Sudah punya akun? Login</a>
          </div>
        </form>

      </div>
    </div>
  );
}

