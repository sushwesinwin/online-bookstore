import { ReactNode } from 'react';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';

interface AuthLayoutProps {
    children: ReactNode;
    title?: string;
    subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
    return (
        <div className="min-h-screen flex">
            {/* Left side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white relative z-10">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 mb-8 group">
                        <div className="p-2 bg-gradient-to-br from-[#0B7C6B] to-[#17BD8D] rounded-lg group-hover:scale-110 transition-transform">
                            <BookOpen className="h-6 w-6 text-white" />
                        </div>
                        <span className="font-bold text-2xl bg-gradient-to-r from-[#0B7C6B] to-[#17BD8D] bg-clip-text text-transparent">
                            Bookstore
                        </span>
                    </Link>

                    {/* Optional Title */}
                    {title && (
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-[#101313] mb-2">{title}</h1>
                            {subtitle && <p className="text-[#848785]">{subtitle}</p>}
                        </div>
                    )}

                    {/* Form Content */}
                    {children}
                </div>
            </div>

            {/* Right side - Image/Background */}
            <div className="hidden lg:block lg:w-1/2 relative bg-gradient-to-br from-[#0B7C6B] to-[#17BD8D]">
                {/* Overlay pattern */}
                <div className="absolute inset-0 opacity-10">
                    <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <pattern
                                id="book-pattern"
                                x="0"
                                y="0"
                                width="100"
                                height="100"
                                patternUnits="userSpaceOnUse"
                            >
                                <rect width="2" height="80" x="20" y="10" fill="currentColor" />
                                <rect width="2" height="80" x="40" y="10" fill="currentColor" />
                                <rect width="2" height="80" x="60" y="10" fill="currentColor" />
                                <rect width="2" height="80" x="80" y="10" fill="currentColor" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#book-pattern)" />
                    </svg>
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex flex-col items-center justify-center p-12 text-white">
                    <div className="max-w-lg text-center">
                        {/* Decorative book icon */}
                        <div className="mb-8 inline-flex items-center justify-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-white/20 rounded-full blur-3xl"></div>
                                <div className="relative bg-white/10 backdrop-blur-sm p-8 rounded-full border-2 border-white/30">
                                    <BookOpen className="h-24 w-24" strokeWidth={1.5} />
                                </div>
                            </div>
                        </div>

                        {/* Quote/Message */}
                        <blockquote className="space-y-4">
                            <p className="text-2xl font-semibold leading-relaxed">
                                "A room without books is like a body without a soul."
                            </p>
                            <footer className="text-lg text-white/80">— Marcus Tullius Cicero</footer>
                        </blockquote>

                        {/* Feature highlights */}
                        <div className="mt-12 space-y-4 text-left">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mt-0.5">
                                    <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={3}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold">Thousands of Books</h3>
                                    <p className="text-sm text-white/70">
                                        Explore our vast collection across all genres
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mt-0.5">
                                    <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={3}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold">Fast & Secure</h3>
                                    <p className="text-sm text-white/70">
                                        Safe checkout with industry-standard encryption
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-white/20 flex items-center justify-center mt-0.5">
                                    <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={3}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="font-semibold">Quick Delivery</h3>
                                    <p className="text-sm text-white/70">
                                        Get your books delivered right to your doorstep
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Decorative elements */}
                <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
        </div>
    );
}
