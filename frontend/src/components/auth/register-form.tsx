'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';

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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="firstName"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              className="pl-9 h-11 rounded-xl bg-gray-50 border-transparent focus:bg-white transition-all"
              required
            />
          </div>
          <div className="relative flex-1">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              id="lastName"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              className="pl-9 h-11 rounded-xl bg-gray-50 border-transparent focus:bg-white transition-all"
              required
            />
          </div>
        </div>

        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            className="pl-9 h-11 rounded-xl bg-gray-50 border-transparent focus:bg-white transition-all"
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Password (min. 8 chars)"
            value={formData.password}
            onChange={handleChange}
            className="pl-9 h-11 rounded-xl bg-gray-50 border-transparent focus:bg-white transition-all"
            required
            minLength={8}
          />
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-sm rounded-xl bg-black hover:bg-gray-800 transition-all shadow-md"
          disabled={isRegistering}
        >
          {isRegistering ? 'Creating...' : 'Create Account'}
        </Button>

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

        <div className="text-center pt-4 border-t border-gray-50 mt-6">
          <p className="text-sm text-gray-500 font-medium">
            Already have an account?{' '}
            <button 
              type="button" 
              onClick={onLoginClick}
              className="text-black font-bold hover:underline underline-offset-4 ml-1"
            >
              Sign in
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}
