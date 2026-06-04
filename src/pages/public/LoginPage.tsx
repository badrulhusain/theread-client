import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiMessage } from '@/lib/api';
import { roleHome, useAuth } from '@/store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const user = await login({ email, password });
      if (user.isBlocked || user.status === 'BLOCKED') throw new Error('This account is blocked. Please contact an admin.');
      toast.success('Welcome back.');
      const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname;
      navigate(from || roleHome(user.role), { replace: true });
    } catch (error) {
      toast.error(apiMessage(error, 'Invalid email or password.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-[calc(100vh-57px)] place-items-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader><h1 className="text-2xl font-semibold">Login</h1><p className="text-sm text-slate-500">Use your The Read account.</p></CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
            <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
            <Button className="w-full" disabled={submitting}>{submitting ? 'Logging in...' : 'Login'}</Button>
          </form>
          <p className="mt-4 text-sm text-slate-600">New here? <Link className="font-medium underline" to="/register">Register</Link></p>
        </CardContent>
      </Card>
    </main>
  );
}
