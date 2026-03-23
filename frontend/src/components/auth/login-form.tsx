'use client';

import { useState } from 'react';
import { Mail, Lock, AlertCircle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/hooks/use-auth';
import Link from 'next/link';

interface LoginFormProps {
  onSuccess?: () => void;
  onRegisterClick?: () => void;
}

export function LoginForm({ onSuccess, onRegisterClick }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoggingIn, loginError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login({ email, password });
      onSuccess?.();
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {loginError && (
          <div className="flex items-start space-x-3 p-4 text-sm text-[#FF4E3E] bg-[#FFECEB] rounded-lg border border-[#FF4E3E]/20">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <span>{loginError.message || 'Invalid email or password'}</span>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-900">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="Email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="pl-11 h-12 rounded-xl text-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-sm font-medium text-gray-900">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="text-sm text-black hover:underline underline-offset-4 font-medium"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="pl-11 h-12 rounded-xl text-sm"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-14 text-base rounded-2xl bg-black hover:bg-gray-800 transition-all shadow-xl shadow-black/10 font-bold tracking-tight"
          disabled={isLoggingIn}
        >
          {isLoggingIn ? 'Verifying...' : 'Continue'}
        </Button>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onRegisterClick}
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-black transition-colors group"
          >
            <div className="p-1.5 bg-gray-50 rounded-lg group-hover:bg-black group-hover:text-white transition-all">
              <UserPlus className="h-3.5 w-3.5" />
            </div>
            <span>No account? Join Lumora</span>
          </button>
        </div>
      </form>
    </div>
  );
}
