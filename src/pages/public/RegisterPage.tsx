import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { apiMessage } from '@/lib/api';
import { useAuth } from '@/store/authStore';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (form.name.trim().length < 2) return toast.error('Name must be at least 2 characters.');
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters.');
    setSubmitting(true);
    try {
      await register(form);
      toast.success('Account created.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(apiMessage(error, 'Could not register. Please check your details.'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-[calc(100vh-57px)] place-items-center px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader><h1 className="text-2xl font-semibold">Register</h1><p className="text-sm text-slate-500">Create a normal reader/writer account.</p></CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" />
            <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" />
            <Input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" />
            <Button className="w-full" disabled={submitting}>{submitting ? 'Creating...' : 'Create account'}</Button>
          </form>
          <p className="mt-4 text-sm text-slate-600">Already registered? <Link className="font-medium underline" to="/login">Login</Link></p>
        </CardContent>
      </Card>
    </main>
  );
}
