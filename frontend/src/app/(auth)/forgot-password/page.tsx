'use client';

import { useState } from 'react';
import Link from 'next/link';
import { authApi } from '@/lib/api/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthLayout } from '@/components/auth/auth-layout';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            await authApi.forgotPassword(email);
            setIsSubmitted(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <AuthLayout>
                <div className="space-y-6">
                    <div className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#DFFEF5]">
                            <CheckCircle2 className="h-8 w-8 text-[#17BD8D]" />
                        </div>
                        <h2 className="text-2xl font-bold text-[#101313]">Check Your Email</h2>
                        <p className="text-[#848785] mt-2">
                            If an account exists for <strong className="text-[#101313]">{email}</strong>,
                            you will receive a password reset link shortly.
                        </p>
                    </div>

                    <div className="rounded-lg bg-[#E4F4FF] p-5 text-sm">
                        <p className="font-semibold text-[#101313] mb-3">Didn't receive the email?</p>
                        <ul className="space-y-2 text-[#848785]">
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Check your spam or junk folder</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Verify the email address is correct</span>
                            </li>
                            <li className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>Wait a few minutes and check again</span>
                            </li>
                        </ul>
                    </div>

                    <div className="space-y-3">
                        <Button
                            variant="outline"
                            className="w-full h-12"
                            onClick={() => {
                                setIsSubmitted(false);
                                setEmail('');
                            }}
                        >
                            Try Another Email
                        </Button>
                        <Link href="/login" className="block">
                            <Button variant="ghost" className="w-full h-12">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Login
                            </Button>
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
                    <h2 className="text-2xl font-bold text-[#101313]">Forgot Password?</h2>
                    <p className="text-[#848785] mt-1">
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="flex items-start space-x-3 p-4 text-sm text-[#FF4E3E] bg-[#FFECEB] rounded-lg border border-[#FF4E3E]/20">
                            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-[#101313]">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#848785]" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-11 h-12"
                                required
                            />
                        </div>
                        <p className="text-xs text-[#848785]">
                            We'll send a password reset link to this email address
                        </p>
                    </div>

                    <Button type="submit" className="w-full h-12 text-base" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <div className="flex items-center space-x-2">
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Sending...</span>
                            </div>
                        ) : (
                            'Send Reset Link'
                        )}
                    </Button>
                </form>

                <div className="text-center">
                    <Link href="/login">
                        <Button variant="ghost" className="w-full h-12">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Login
                        </Button>
                    </Link>
                </div>

                <div className="text-center">
                    <Link
                        href="/"
                        className="text-sm text-[#848785] hover:text-[#0B7C6B] inline-flex items-center"
                    >
                        <svg
                            className="w-4 h-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                        Back to Home
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}
