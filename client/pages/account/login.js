'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from "../../utils/axios"
import { useUserStore } from '@/utils/store';

export default function Login() {
  const router = useRouter();
  const user = useUserStore(state => state.user)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (user) router.back()
    else setLoading(false)
  }, [user])

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/users/login', { email, password }, { withCredentials: true });
      alert("Login successful");
      router.push('/dashboard'); 
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  if (loading) return <div>Loading</div>

  return (
    <form onSubmit={handleLogin} className="p-4">
      <h2 className="text-xl font-bold">Login</h2>
      <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="block my-2 p-2 border" />
      <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="block my-2 p-2 border" />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2">Login</button>
    </form>
  );
}
