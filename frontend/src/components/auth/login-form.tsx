'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
  onRegisterClick?: () => void;
}

export function LoginForm({ onSuccess, onRegisterClick }: LoginFormProps) {
  const { login, isLoggingIn, loginError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
    if (onSuccess) onSuccess();
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="pl-9 h-11 rounded-xl bg-gray-50 border-transparent focus:bg-white transition-all text-sm"
            required
          />
        </div>

        <div className="space-y-1">
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="pl-9 h-11 rounded-xl bg-gray-50 border-transparent focus:bg-white transition-all text-sm"
              required
            />
          </div>
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-[11px] text-gray-400 hover:text-black hover:underline transition-colors font-medium"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-sm rounded-xl bg-black hover:bg-gray-800 transition-all shadow-md"
          disabled={isLoggingIn}
        >
          {isLoggingIn ? 'Logging in...' : 'Login'}
        </Button>

        <div className="text-center pt-4 border-t border-gray-50 mt-6">
          <p className="text-sm text-gray-500 font-medium">
            New to Lumora?{' '}
            <button 
              type="button" 
              onClick={onRegisterClick}
              className="text-black font-bold hover:underline underline-offset-4 ml-1"
            >
              Sign up for free
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
