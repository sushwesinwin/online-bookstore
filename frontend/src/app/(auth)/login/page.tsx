'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthLayout } from '@/components/auth/auth-layout';
import { Mail, Lock, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggingIn, loginError, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <AuthLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-[#101313]">Welcome back</h2>
          <p className="text-[#848785] mt-1">Login to access your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {loginError && (
            <div className="flex items-start space-x-3 p-4 text-sm text-[#FF4E3E] bg-[#FFECEB] rounded-lg border border-[#FF4E3E]/20">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{loginError.message || 'Invalid email or password'}</span>
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="text-sm font-medium text-[#101313]"
            >
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#848785]" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="pl-11 h-12"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium text-[#101313]"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-[#0B7C6B] hover:text-[#096355] font-medium"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#848785]" />
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="pl-11 h-12"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-base"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? (
              <div className="flex items-center space-x-2">
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Logging in...</span>
              </div>
            ) : (
              'Login'
            )}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E4E9E8]"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-[#848785]">
              New to Bookstore?
            </span>
          </div>
        </div>

        <div className="text-center">
          <Link href="/register">
            <Button variant="outline" className="w-full h-12 text-base">
              Create an Account
            </Button>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
}
