import { gql, useMutation } from '@apollo/client';
import { useState } from 'react';

const LOGIN_MUTATION = gql`mutation($email:String!,$password:String!){login(email:$email,password:$password){token user{ id name }}}`;

export default function Login(){
  const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [login]=useMutation(LOGIN_MUTATION);
  async function submit(e:any){ e.preventDefault(); const {data}=await login({variables:{email,password}}); localStorage.setItem('token',data.login.token); alert('Login sukses'); }
  return <form onSubmit={submit}><input value={email} onChange={e=>setEmail(e.target.value)} placeholder="email"/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="password"/><button>Login</button></form>;
}