'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

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
        register(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#F9FCFB]">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Create an Account</CardTitle>
                    <CardDescription>Sign up to start shopping for books</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {registerError && (
                            <div className="p-3 text-sm text-[#FF4E3E] bg-[#FFECEB] rounded-md border border-[#FF4E3E]">
                                {registerError.message || 'Registration failed'}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label htmlFor="firstName" className="text-sm font-medium text-[#101313]">
                                    First Name
                                </label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="lastName" className="text-sm font-medium text-[#101313]">
                                    Last Name
                                </label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-[#101313]">
                                Email
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-[#101313]">
                                Password
                            </label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full" disabled={isRegistering}>
                            {isRegistering ? 'Creating account...' : 'Sign Up'}
                        </Button>

                        <p className="text-sm text-center text-[#848785]">
                            Already have an account?{' '}
                            <Link href="/login" className="text-[#0B7C6B] hover:underline font-medium">
                                Login
                            </Link>
                        </p>

                        <Link href="/" className="text-sm text-center text-[#848785] hover:text-[#0B7C6B]">
                            ← Back to Home
                        </Link>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
