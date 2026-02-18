'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthLayout } from '@/components/auth/auth-layout';
import { Lock, CheckCircle2, XCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        if (!token) {
            setError('Invalid or missing reset token');
        }
    }, [token]);

    const validatePassword = (password: string) => {
        if (password.length < 8) {
            return 'Password must be at least 8 characters long';
        }
        if (!/(?=.*[a-z])/.test(password)) {
            return 'Password must contain at least one lowercase letter';
        }
        if (!/(?=.*[A-Z])/.test(password)) {
            return 'Password must contain at least one uppercase letter';
        }
        if (!/(?=.*\d)/.test(password)) {
            return 'Password must contain at least one number';
        }
        return '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setPasswordError('');

        // Validate password
        const validationError = validatePassword(newPassword);
        if (validationError) {
            setPasswordError(validationError);
            return;
        }

        // Check if passwords match
        if (newPassword !== confirmPassword) {
            setPasswordError('Passwords do not match');
            return;
        }

        if (!token) {
            setError('Invalid or missing reset token');
            return;
        }

        setIsSubmitting(true);

        try {
            await authApi.resetPassword(token, newPassword);
            setIsSuccess(true);
            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err: any) {
            setError(
                err.response?.data?.message || 'Failed to reset password. The link may have expired.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!token) {
        return (
            <AuthLayout>
                <div className="space-y-6">
                    <div className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#FFECEB]">
                            <XCircle className="h-8 w-8 text-[#FF4E3E]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#101313]">Invalid Reset Link</h2>
                        <p className="text-[#848785] mt-2">
                            This password reset link is invalid or has expired.
                        </p>
                    </div>
                    <div className="text-center">
                        <Link href="/forgot-password">
                            <Button className="w-full h-12">Request New Link</Button>
                        </Link>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    if (isSuccess) {
        return (
            <AuthLayout>
                <div className="space-y-6">
                    <div className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#DFFEF5]">
                            <CheckCircle2 className="h-8 w-8 text-[#17BD8D]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#101313]">Password Reset Successful!</h2>
                        <p className="text-[#848785] mt-2">
                            Your password has been successfully reset. You can now log in with your new
                            password.
                        </p>
                        <p className="text-sm text-[#848785] mt-4">
                            Redirecting to login in 3 seconds...
                        </p>
                    </div>
                    <div className="text-center">
                        <Link href="/login">
                            <Button className="w-full h-12">Continue to Login</Button>
                        </Link>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-[#101313]">Reset Password</h2>
                    <p className="text-[#848785] mt-1">Enter your new password below</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="flex items-start space-x-3 p-4 text-sm text-[#FF4E3E] bg-[#FFECEB] rounded-lg border border-[#FF4E3E]/20">
                            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {passwordError && (
                        <div className="flex items-start space-x-3 p-4 text-sm text-[#FF4E3E] bg-[#FFECEB] rounded-lg border border-[#FF4E3E]/20">
                            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                            <span>{passwordError}</span>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="newPassword" className="text-sm font-medium text-[#101313]">
                            New Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#848785] z-10" />
                            <Input
                                id="newPassword"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter new password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="pl-11 pr-11 h-12"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#848785] hover:text-[#101313]"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="confirmPassword" className="text-sm font-medium text-[#101313]">
                            Confirm Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#848785] z-10" />
                            <Input
                                id="confirmPassword"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="pl-11 pr-11 h-12"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#848785] hover:text-[#101313]"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-5 w-5" />
                                ) : (
                                    <Eye className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="rounded-lg bg-[#E4F4FF] p-4 text-xs">
                        <p className="font-semibold text-[#101313] mb-2">Password requirements:</p>
                        <ul className="space-y-1 text-[#848785]">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>At least 8 characters long</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Contains uppercase and lowercase letters</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Contains at least one number</span>
                            </li>
                        </ul>
                    </div>

                    <Button type="submit" className="w-full h-12 text-base" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <div className="flex items-center space-x-2">
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Resetting Password...</span>
                            </div>
                        ) : (
                            'Reset Password'
                        )}
                    </Button>
                </form>

                <div className="text-center">
                    <Link href="/login" className="text-sm text-[#848785] hover:text-[#0B7C6B] font-medium">
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense
            fallback={
                <AuthLayout>
                    <div className="flex justify-center py-12">
                        <div className="h-8 w-8 border-4 border-[#E4E9E8] border-t-[#0B7C6B] rounded-full animate-spin" />
                    </div>
                </AuthLayout>
            }
        >
            <ResetPasswordForm />
        </Suspense>
    );
}
