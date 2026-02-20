'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AuthLayout } from '@/components/auth/auth-layout';
import { Mail, Lock, User, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
    const router = useRouter();
    const { register, isRegistering, registerError, isAuthenticated } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
    });

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push('/');
        }
    }, [isAuthenticated, router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        register({ ...formData, role: 'USER' });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <AuthLayout>
            <div className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-[#101313]">Create an account</h2>
                    <p className="text-[#848785] mt-1">Sign up to start your reading journey</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {registerError && (
                        <div className="flex items-start space-x-3 p-4 text-sm text-[#FF4E3E] bg-[#FFECEB] rounded-lg border border-[#FF4E3E]/20">
                            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                            <span>{registerError.message || 'Registration failed. Please try again.'}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="firstName" className="text-sm font-medium text-[#101313]">
                                First Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#848785]" />
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="pl-11 h-12"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="lastName" className="text-sm font-medium text-[#101313]">
                                Last Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#848785]" />
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="pl-11 h-12"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium text-[#101313]">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#848785]" />
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                className="pl-11 h-12"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="text-sm font-medium text-[#101313]">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#848785]" />
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="Create a password (min. 6 characters)"
                                value={formData.password}
                                onChange={handleChange}
                                className="pl-11 h-12"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>


                    <Button type="submit" className="w-full h-12 text-base" disabled={isRegistering}>
                        {isRegistering ? (
                            <div className="flex items-center space-x-2">
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Creating account...</span>
                            </div>
                        ) : (
                            'Create Account'
                        )}
                    </Button>

                    <p className="text-xs text-center text-[#848785]">
                        By signing up, you agree to our{' '}
                        <Link href="/terms" className="text-[#0B7C6B] hover:underline">
                            Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="text-[#0B7C6B] hover:underline">
                            Privacy Policy
                        </Link>
                    </p>
                </form>

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#E4E9E8]"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-[#848785]">Already have an account?</span>
                    </div>
                </div>

                <div className="text-center">
                    <Link href="/login">
                        <Button variant="outline" className="w-full h-12 text-base">
                            Login
                        </Button>
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}
