'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  Menu,
  X,
  User,
  LogOut,
  Heart,
  Package,
  ChevronDown,
  LayoutDashboard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/stores/cart-store';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Modal } from '@/components/ui/modal';
import { RegisterForm } from '@/components/auth/register-form';
import { LoginForm } from '@/components/auth/login-form';
import { useAuth } from '@/lib/hooks/use-auth';
import { useAuthModalStore } from '@/lib/stores/auth-modal-store';

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const { itemCount } = useCartStore();
  const { isAuthenticated, user, logout } = useAuth();
  const {
    isOpen: isAuthModalOpen,
    view: authView,
    message: authMessage,
    openModal,
    closeModal,
    setView: setAuthView,
  } = useAuthModalStore();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const isAdmin = user?.role === 'ADMIN';

  const hiddenRoutes = ['/admin'];
  const isHiddenRoute = hiddenRoutes.some(route => pathname?.startsWith(route));

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousedown', handleClickOutside);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (isHiddenRoute) return null;

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 w-full bg-transparent h-16 sm:h-20" />
    );
  }

  const navLinks = [
    { name: 'Books', href: '/books', protected: false },
    { name: 'Blogs', href: '/blogs', protected: false },
    { name: 'Authors', href: '/authors', protected: false },
  ];

  const handleProtectedClick = (e: React.MouseEvent, isProtected: boolean) => {
    if (isProtected && !isAuthenticated) {
      e.preventDefault();
      openModal('login', 'Please sign in to access the bookstore');
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-500 ${
          scrolled
            ? 'bg-white/85 backdrop-blur-2xl border-b border-border shadow-[0_12px_30px_rgba(17,17,17,0.08)] py-2'
            : 'bg-transparent border-transparent py-4'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 relative">
            {/* Left: Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-muted-foreground hover:text-primary transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>

            {/* Left/Desktop: Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => {
                const isActive = pathname?.startsWith(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={e => handleProtectedClick(e, !!link.protected)}
                    className={`group relative inline-flex h-9 w-max items-center justify-center bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:text-primary focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                      isActive
                        ? 'text-primary font-semibold'
                        : 'text-muted-foreground'
                    }`}
                  >
                    {link.name}
                    {/* Animated Underline */}
                    <span
                      className={`absolute bottom-0 left-4 right-4 h-0.5 bg-primary transform origin-left transition-transform duration-300 ${
                        isActive
                          ? 'scale-x-100'
                          : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Center: Brand Name (absolute centered) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Link href="/" className="flex items-center group">
                <span className="font-bold tracking-tight text-xl text-primary">
                  Lumora
                </span>
              </Link>
            </div>

            {/* Right: Authenticated Actions / Auth CTAs */}
            <div className="flex items-center gap-2 sm:gap-4">
              {isAuthenticated && !isAdmin && (
                <Link href="/cart">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="group relative h-10 w-10 shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full transition-all duration-300"
                  >
                    <ShoppingBag className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                    {itemCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] text-primary-foreground flex items-center justify-center font-black ring-2 ring-white shadow-md transform group-hover:scale-110 transition-transform duration-300">
                        {itemCount}
                      </span>
                    )}
                  </Button>
                </Link>
              )}
              {isAuthenticated && isAdmin ? (
                <div className="flex items-center gap-2">
                  <Link href="/admin">
                    <Button className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-[13px] font-bold px-5 py-2.5 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 h-10">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => logout()}
                    title="Logout"
                    className="rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-50 h-10 w-10 transition-all duration-300"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              ) : isAuthenticated ? (
                <div className="flex items-center gap-2 pl-2">
                  <div
                    className="hidden sm:block relative"
                    ref={profileDropdownRef}
                  >
                    <Button
                      variant="ghost"
                      onClick={() =>
                        setIsProfileDropdownOpen(!isProfileDropdownOpen)
                      }
                      className="flex items-center gap-2 rounded-full px-3 hover:bg-primary/10 transition-all duration-300 h-10 group"
                    >
                      {user?.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.firstName}
                          className="h-7 w-7 rounded-full object-cover ring-2 ring-primary/10 group-hover:ring-primary/20 transition-all"
                        />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold uppercase ring-2 ring-primary/10 group-hover:ring-primary/20 transition-all">
                          {user?.firstName?.[0] || 'U'}
                        </div>
                      )}
                      <span className="text-sm font-semibold text-foreground tracking-tight">
                        {user?.firstName}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </Button>

                    <AnimatePresence>
                      {isProfileDropdownOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                          className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 overflow-hidden"
                        >
                          <Link
                            href="/profile"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors group"
                          >
                            <User className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="text-sm font-semibold text-slate-700 group-hover:text-primary transition-colors">
                              Profile
                            </span>
                          </Link>

                          <Link
                            href="/orders"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors group"
                          >
                            <Package className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="text-sm font-semibold text-slate-700 group-hover:text-primary transition-colors">
                              My Orders
                            </span>
                          </Link>

                          <Link
                            href="/favorites"
                            onClick={() => setIsProfileDropdownOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-accent transition-colors group"
                          >
                            <Heart className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="text-sm font-semibold text-slate-700 group-hover:text-primary transition-colors">
                              Favourites
                            </span>
                          </Link>

                          <div className="border-t border-gray-100 my-2"></div>

                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              logout();
                            }}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors group w-full text-left"
                          >
                            <LogOut className="h-5 w-5 text-gray-500 group-hover:text-red-500 transition-colors" />
                            <span className="text-sm font-semibold text-gray-700 group-hover:text-red-500 transition-colors">
                              Logout
                            </span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Mobile: Show only logout icon */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => logout()}
                    title="Logout"
                    className="sm:hidden rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-50 h-10 w-10 transition-all duration-300"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={() => openModal('login')}
                    className="hidden sm:block text-sm font-semibold text-muted-foreground hover:text-primary px-4 py-2 transition-colors"
                  >
                    Sign in
                  </button>
                  <Button
                    onClick={() => openModal('register')}
                    className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground text-[13px] font-bold px-6 py-2.5 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 h-10"
                  >
                    Join
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <Modal isOpen={isAuthModalOpen} onClose={closeModal}>
        <div className="flex flex-col gap-6">
          {authMessage && (
            <div className="bg-orange-50 text-orange-600 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-center border border-orange-100 animate-in fade-in slide-in-from-top-1 duration-300">
              {authMessage}
            </div>
          )}
          {/* Auth Tabs Switch */}
          <div className="flex p-1 bg-gray-50 rounded-2xl w-full max-w-[280px] mx-auto relative border border-gray-100 h-11">
            <motion.div
              className="absolute inset-y-1 bg-white rounded-xl shadow-sm border border-gray-100"
              initial={false}
              animate={{
                left: authView === 'login' ? '4px' : '50%',
                right: authView === 'login' ? '50%' : '4px',
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
            />
            <button
              onClick={() => setAuthView('login')}
              className={`relative z-10 flex-1 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${
                authView === 'login' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthView('register')}
              className={`relative z-10 flex-1 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${
                authView === 'register'
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              Sign Up
            </button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={authView}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
            >
              {authView === 'register' ? (
                <RegisterForm
                  onSuccess={() => closeModal()}
                  onLoginClick={() => setAuthView('login')}
                />
              ) : (
                <LoginForm
                  onSuccess={() => closeModal()}
                  onRegisterClick={() => setAuthView('register')}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </Modal>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-16 sm:top-20 z-40 bg-white shadow-2xl md:hidden border-b border-border overflow-hidden"
            ref={menuRef}
          >
            <div className="container mx-auto px-4 py-8 flex flex-col gap-6">
              <div className="space-y-4">
                <nav className="flex flex-col">
                  {navLinks.map(link => {
                    const isActive = pathname?.startsWith(link.href);
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={e => handleProtectedClick(e, !!link.protected)}
                        className={`px-4 py-4 text-xl font-bold transition-all flex items-center justify-between group ${
                          isActive
                            ? 'text-primary'
                            : 'text-muted-foreground hover:text-primary'
                        }`}
                      >
                        {link.name}
                        <div
                          className={`h-1.5 w-1.5 rounded-full bg-primary ${isActive ? 'opacity-100' : 'opacity-0'}`}
                        />
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-6 border-t border-gray-100 space-y-4">
                {isAuthenticated && !isAdmin && (
                  <Link
                    href="/cart"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between px-4 py-3 bg-muted rounded-2xl group hover:bg-primary transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="h-5 w-5 text-muted-foreground group-hover:text-primary-foreground" />
                      <span className="font-bold text-foreground group-hover:text-primary-foreground">
                        Shopping Cart
                      </span>
                    </div>
                    {itemCount > 0 && (
                      <span className="bg-primary text-primary-foreground group-hover:bg-white group-hover:text-primary text-xs font-black h-6 w-6 rounded-full flex items-center justify-center">
                        {itemCount}
                      </span>
                    )}
                  </Link>
                )}
                {isAuthenticated ? (
                  isAdmin ? (
                    <>
                      <Link
                        href="/admin"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 bg-muted rounded-2xl group hover:bg-primary transition-all"
                      >
                        <LayoutDashboard className="h-5 w-5 text-muted-foreground group-hover:text-primary-foreground" />
                        <span className="font-bold text-foreground group-hover:text-primary-foreground">
                          Dashboard
                        </span>
                      </Link>
                      <Button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          logout();
                        }}
                        className="w-full rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 h-14 font-bold text-lg transition-colors"
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/profile"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 bg-muted rounded-2xl group hover:bg-primary transition-all"
                      >
                        <User className="h-5 w-5 text-muted-foreground group-hover:text-primary-foreground" />
                        <span className="font-bold text-foreground group-hover:text-primary-foreground">
                          Profile
                        </span>
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 bg-muted rounded-2xl group hover:bg-primary transition-all"
                      >
                        <Package className="h-5 w-5 text-muted-foreground group-hover:text-primary-foreground" />
                        <span className="font-bold text-foreground group-hover:text-primary-foreground">
                          My Orders
                        </span>
                      </Link>
                      <Link
                        href="/favorites"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 bg-muted rounded-2xl group hover:bg-primary transition-all"
                      >
                        <Heart className="h-5 w-5 text-muted-foreground group-hover:text-primary-foreground" />
                        <span className="font-bold text-foreground group-hover:text-primary-foreground">
                          Favourites
                        </span>
                      </Link>
                      <Button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          logout();
                        }}
                        className="w-full rounded-2xl bg-red-50 text-red-600 hover:bg-red-100 h-14 font-bold text-lg transition-colors"
                      >
                        Logout
                      </Button>
                    </>
                  )
                ) : (
                  <Button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      openModal('register');
                    }}
                    className="w-full rounded-2xl bg-primary text-primary-foreground h-14 font-bold text-lg shadow-xl shadow-primary/20 transition-transform active:scale-95"
                  >
                    Get Started
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
