'use client';

import Link from 'next/link';
import { ShoppingCart, User, LogOut, BookOpen, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/hooks/use-auth';
import { useCartStore } from '@/lib/stores/cart-store';
import { useState } from 'react';

export function Header() {
    const { user, isAuthenticated, logout } = useAuth();
    const { itemCount } = useCartStore();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-[#E4E9E8] shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2 group">
                        <div className="p-2 bg-linear-to-br from-[#0B7C6B] to-[#17BD8D] rounded-lg group-hover:scale-110 transition-transform">
                            <BookOpen className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-bold text-xl bg-linear-to-r from-[#0B7C6B] to-[#17BD8D] bg-clip-text text-transparent">
                            Bookstore
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-8">
                        <Link
                            href="/books"
                            className="text-sm font-medium text-[#848785] hover:text-[#0B7C6B] transition-colors relative group"
                        >
                            Books
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0B7C6B] group-hover:w-full transition-all" />
                        </Link>

                        {isAuthenticated && (
                            <>
                                <Link
                                    href="/orders"
                                    className="text-sm font-medium text-[#848785] hover:text-[#0B7C6B] transition-colors relative group"
                                >
                                    My Orders
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0B7C6B] group-hover:w-full transition-all" />
                                </Link>

                                {user?.role === 'ADMIN' && (
                                    <Link
                                        href="/admin"
                                        className="text-sm font-medium text-[#848785] hover:text-[#0B7C6B] transition-colors relative group"
                                    >
                                        Admin
                                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#0B7C6B] group-hover:w-full transition-all" />
                                    </Link>
                                )}
                            </>
                        )}
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center space-x-4">
                        {isAuthenticated ? (
                            <>
                                <Link href="/cart">
                                    <Button variant="ghost" size="icon" className="relative">
                                        <ShoppingCart className="h-5 w-5" />
                                        {itemCount > 0 && (
                                            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-linear-to-br from-[#FF6320] to-[#FFA118] text-xs text-white flex items-center justify-center font-semibold shadow-lg">
                                                {itemCount}
                                            </span>
                                        )}
                                    </Button>
                                </Link>

                                <Link href="/profile">
                                    <Button variant="ghost" size="icon">
                                        <User className="h-5 w-5" />
                                    </Button>
                                </Link>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => logout()}
                                    className="hover:bg-[#FFECEB] hover:text-[#FF4E3E]"
                                >
                                    <LogOut className="h-5 w-5" />
                                </Button>
                            </>
                        ) : (
                            <>
                                <Link href="/login">
                                    <Button variant="ghost" className="font-medium">
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/register">
                                    <Button className="shadow-md">
                                        Sign Up
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 hover:bg-[#F4F8F8] rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 border-t border-[#E4E9E8] animate-in slide-in-from-top">
                        <nav className="flex flex-col space-y-4">
                            <Link
                                href="/books"
                                className="text-sm font-medium text-[#848785] hover:text-[#0B7C6B] transition-colors px-2 py-1"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Books
                            </Link>

                            {isAuthenticated && (
                                <>
                                    <Link
                                        href="/orders"
                                        className="text-sm font-medium text-[#848785] hover:text-[#0B7C6B] transition-colors px-2 py-1"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        My Orders
                                    </Link>

                                    {user?.role === 'ADMIN' && (
                                        <Link
                                            href="/admin"
                                            className="text-sm font-medium text-[#848785] hover:text-[#0B7C6B] transition-colors px-2 py-1"
                                            onClick={() => setMobileMenuOpen(false)}
                                        >
                                            Admin
                                        </Link>
                                    )}

                                    <Link
                                        href="/cart"
                                        className="text-sm font-medium text-[#848785] hover:text-[#0B7C6B] transition-colors px-2 py-1 flex items-center gap-2"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <ShoppingCart className="h-4 w-4" />
                                        Cart {itemCount > 0 && `(${itemCount})`}
                                    </Link>

                                    <Link
                                        href="/profile"
                                        className="text-sm font-medium text-[#848785] hover:text-[#0B7C6B] transition-colors px-2 py-1"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Profile
                                    </Link>

                                    <button
                                        onClick={() => {
                                            logout();
                                            setMobileMenuOpen(false);
                                        }}
                                        className="text-sm font-medium text-[#FF4E3E] hover:text-[#E6463A] transition-colors px-2 py-1 text-left"
                                    >
                                        Logout
                                    </button>
                                </>
                            )}

                            {!isAuthenticated && (
                                <div className="flex flex-col gap-2 pt-2">
                                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                                        <Button variant="outline" className="w-full">
                                            Login
                                        </Button>
                                    </Link>
                                    <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                                        <Button className="w-full">
                                            Sign Up
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </nav>
                    </div>
                )}
            </div>
        </header>
    );
}
