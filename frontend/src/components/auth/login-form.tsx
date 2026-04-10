'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, AlertCircle, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Form, FormField } from '@/components/ui/form';
import { useAuth } from '@/lib/hooks/use-auth';
import { FloatingAuthInput } from '@/components/auth/floating-auth-input';
import { getApiErrorMessage, getApiErrorStatus } from '@/lib/api/error-utils';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  onRegisterClick?: () => void;
}

export function LoginForm({ onSuccess, onRegisterClick }: LoginFormProps) {
  const { login, isLoggingIn, loginError } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data);
      onSuccess?.();
    } catch {
      // Error handled by hook
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center sm:text-left mb-2">
        <h3 className="text-2xl font-bold text-[#101313] tracking-tight mb-5">
          Welcome Back
        </h3>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {loginError && (
            <div className="flex items-start space-x-2 p-3 text-xs text-[#FF4E3E] bg-[#FFECEB] rounded-lg border border-[#FF4E3E]/20">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                {getApiErrorStatus(loginError) === 401
                  ? 'Invalid email or password. Please try again.'
                  : getApiErrorMessage(
                      loginError,
                      'Login failed. Please check your credentials.'
                    )}
              </span>
            </div>
          )}

          <FormField
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <FloatingAuthInput
                {...field}
                type="email"
                autoComplete="email"
                icon={Mail}
                label="Email Address"
                error={!!fieldState.error}
              />
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="pl-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#66726F]">
                    Password
                  </span>
                  <button
                    type="button"
                    className="text-xs text-black hover:underline underline-offset-4 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
                <FloatingAuthInput
                  {...field}
                  type="password"
                  autoComplete="current-password"
                  icon={Lock}
                  label="Enter your password"
                  error={!!fieldState.error}
                />
              </div>
            )}
          />

          <Button
            type="submit"
            className="w-full h-12 text-sm rounded-2xl bg-black hover:bg-gray-800 transition-all shadow-xl shadow-black/10 font-bold tracking-tight"
            disabled={isLoggingIn}
          >
            {isLoggingIn ? 'Verifying...' : 'Continue'}
          </Button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onRegisterClick}
              className="inline-flex items-center gap-2 text-[10px] font-bold text-gray-400 hover:text-black transition-colors group"
            >
              <div className="p-1 bg-gray-50 rounded-lg group-hover:bg-black group-hover:text-white transition-all">
                <UserPlus className="h-3 w-3" />
              </div>
              <span>No account? Join Lumora</span>
            </button>
          </div>
        </form>
      </Form>
    </div>
  );
}
