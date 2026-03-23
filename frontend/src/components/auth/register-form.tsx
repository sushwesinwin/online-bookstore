'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, User, AlertCircle, LogIn } from 'lucide-react';

interface RegisterFormProps {
  onSuccess?: () => void;
  onLoginClick?: () => void;
}

export function RegisterForm({ onSuccess, onLoginClick }: RegisterFormProps) {
  const { register, isRegistering, registerError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register({ ...formData, role: 'USER' });
    if (onSuccess) onSuccess();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        {registerError && (
          <div className="flex items-start space-x-3 p-4 text-sm text-[#FF4E3E] bg-[#FFECEB] rounded-lg border border-[#FF4E3E]/20">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <span>
              {registerError.message || 'Registration failed. Please try again.'}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-sm font-medium text-gray-900">
              First Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="firstName"
                name="firstName"
                placeholder="John"
                value={formData.firstName}
                onChange={handleChange}
                className="pl-11 h-12 rounded-xl"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="lastName" className="text-sm font-medium text-gray-900">
              Last Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                id="lastName"
                name="lastName"
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                className="pl-11 h-12 rounded-xl"
                required
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-gray-900">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              className="pl-11 h-12 rounded-xl text-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-gray-900">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Min. 8 characters"
              value={formData.password}
              onChange={handleChange}
              className="pl-11 h-12 rounded-xl text-sm"
              required
              minLength={8}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full h-14 text-base rounded-2xl bg-black hover:bg-gray-800 transition-all shadow-xl shadow-black/10 font-bold tracking-tight"
          disabled={isRegistering}
        >
          {isRegistering ? (
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Joining...</span>
            </div>
          ) : (
            'Create Account'
          )}
        </Button>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onLoginClick}
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-black transition-colors group"
          >
            <div className="p-1.5 bg-gray-50 rounded-lg group-hover:bg-black group-hover:text-white transition-all">
              <LogIn className="h-3.5 w-3.5" />
            </div>
            <span>Joined already? Sign in</span>
          </button>
        </div>

        <p className="text-xs text-center text-gray-400 font-medium">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="text-black hover:underline underline-offset-4">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-black hover:underline underline-offset-4">
            Privacy Policy
          </Link>
        </p>

      </form>
    </div>
  );
}
