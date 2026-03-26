'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Mail, Lock, User, AlertCircle, LogIn } from 'lucide-react';

const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'First name can only contain letters'),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s]+$/, 'Last name can only contain letters'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
  onLoginClick?: () => void;
}

export function RegisterForm({ onSuccess, onLoginClick }: RegisterFormProps) {
  const { register, isRegistering, registerError } = useAuth();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await register({ ...data, role: 'USER' });
      if (!registerError) {
        onSuccess?.();
      }
    } catch (err) {
      // Error handled by hook
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left mb-2">
        <h3 className="text-2xl font-bold text-[#101313] tracking-tight">
          Join Lumora
        </h3>
        <p className="text-[#848785] text-sm mt-1">
          Create an account to start your journey
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {registerError && (
            <div className="flex items-start space-x-2 p-3 text-xs text-[#FF4E3E] bg-[#FFECEB] rounded-lg border border-[#FF4E3E]/20">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                {(registerError as any).response?.status === 409
                  ? 'User with this email already exists.'
                  : (registerError as any).response?.data?.message || 'Registration failed. Please try again.'}
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-gray-900">
                    First Name
                  </FormLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                    <FormControl>
                      <Input
                        placeholder="John"
                        className="pl-10 h-11 rounded-xl text-xs"
                        error={!!fieldState.error}
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-gray-900">
                    Last Name
                  </FormLabel>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                    <FormControl>
                      <Input
                        placeholder="Doe"
                        className="pl-10 h-11 rounded-xl text-xs"
                        error={!!fieldState.error}
                        {...field}
                      />
                    </FormControl>
                  </div>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-gray-900">
                  Email Address
                </FormLabel>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      className="pl-10 h-11 rounded-xl text-xs"
                      error={!!fieldState.error}
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-gray-900">
                  Password
                </FormLabel>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Min. 8 characters (A-Z, a-z, 0-9)"
                      className="pl-10 h-11 rounded-xl text-xs"
                      error={!!fieldState.error}
                      {...field}
                    />
                  </FormControl>
                </div>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-12 text-sm rounded-2xl bg-black hover:bg-gray-800 transition-all shadow-xl shadow-black/10 font-bold tracking-tight"
            disabled={isRegistering}
          >
            {isRegistering ? (
              <div className="flex items-center space-x-2">
                <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
              className="inline-flex items-center gap-2 text-[10px] font-bold text-gray-400 hover:text-black transition-colors group"
            >
              <div className="p-1 bg-gray-50 rounded-lg group-hover:bg-black group-hover:text-white transition-all">
                <LogIn className="h-3 w-3" />
              </div>
              <span>Joined already? Sign in</span>
            </button>
          </div>

          <p className="text-[10px] text-center text-gray-400 font-medium">
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
      </Form>
    </div>
  );
}
