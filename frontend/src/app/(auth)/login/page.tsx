'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

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
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#F9FCFB]">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>Enter your credentials to access your account</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        {loginError && (
                            <div className="p-3 text-sm text-[#FF4E3E] bg-[#FFECEB] rounded-md border border-[#FF4E3E]">
                                {loginError.message || 'Invalid email or password'}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-[#101313]">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-[#101313]">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        <div className="text-sm">
                            <Link href="/forgot-password" className="text-[#0B7C6B] hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col space-y-4">
                        <Button type="submit" className="w-full" disabled={isLoggingIn}>
                            {isLoggingIn ? 'Logging in...' : 'Login'}
                        </Button>

                        <p className="text-sm text-center text-[#848785]">
                            Don't have an account?{' '}
                            <Link href="/register" className="text-[#0B7C6B] hover:underline font-medium">
                                Sign up
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
