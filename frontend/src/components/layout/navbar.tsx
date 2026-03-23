'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/lib/stores/cart-store';
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Modal } from '@/components/ui/modal';
import { RegisterForm } from '@/components/auth/register-form';
import { LoginForm } from '@/components/auth/login-form';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/use-auth';
import { useAuthModalStore } from '@/lib/stores/auth-modal-store';

export function Navbar() {
  const [mounted, setMounted] = useState(false);
  const { itemCount } = useCartStore();
  const { isAuthenticated } = useAuth();
  const { 
    isOpen: isAuthModalOpen, 
    view: authView, 
    message: authMessage,
    openModal,
    closeModal,
    setView: setAuthView
  } = useAuthModalStore();
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

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

  const handleProtectedClick = (e: React.MouseEvent, href: string, isProtected: boolean) => {
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
            ? 'bg-white/80 backdrop-blur-2xl border-b border-black/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] py-2'
            : 'bg-transparent border-transparent py-4'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12 relative">
            
            {/* Left: Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-500 hover:text-black transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* Left/Desktop: Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname?.startsWith(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleProtectedClick(e, link.href, !!link.protected)}
                    className={`group relative inline-flex h-9 w-max items-center justify-center bg-transparent px-4 py-2 text-sm font-medium transition-colors hover:text-black focus:outline-none disabled:pointer-events-none disabled:opacity-50 ${
                      isActive ? 'text-black font-semibold' : 'text-gray-500'
                    }`}
                  >
                    {link.name}
                    {/* Animated Underline */}
                    <span className={`absolute bottom-0 left-4 right-4 h-0.5 bg-black transform origin-left transition-transform duration-300 ${
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`} />
                  </Link>
                );
              })}
            </nav>

            {/* Center: Brand Name (absolute centered) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <Link href="/" className="flex items-center group">
                <span className="font-bold tracking-tight text-xl text-black">Lumora</span>
              </Link>
            </div>

            {/* Right: Cart & Sign Up */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link 
                href="/cart"
                onClick={(e) => {
                  if (!isAuthenticated) {
                    e.preventDefault();
                    openModal('login', 'Please sign in to view your cart');
                  }
                }}
              >
                <Button variant="ghost" size="icon" className="group relative h-10 w-10 shrink-0 text-gray-500 hover:text-black hover:bg-black/5 rounded-full transition-all duration-300">
                  <ShoppingBag className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                  {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-black text-[10px] text-white flex items-center justify-center font-black ring-2 ring-white shadow-md transform group-hover:scale-110 transition-transform duration-300">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </Link>
              <Button 
                onClick={() => openModal('register')}
                className="hidden sm:inline-flex rounded-full bg-black hover:bg-gray-800 text-white text-[13px] font-medium px-6 py-2.5 shadow-lg shadow-black/10 hover:shadow-black/20 hover:-translate-y-0.5 transition-all duration-300 h-10"
              >
                Sign up
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <Modal 
        isOpen={isAuthModalOpen} 
        onClose={closeModal} 
        title={authView === 'register' ? 'Join Lumora' : 'Welcome Back'}
      >
        <div className="flex flex-col gap-8">
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
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
            />
            <button
              onClick={() => setAuthView('login')}
              className={`relative z-10 flex-1 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${
                authView === 'login' ? 'text-black' : 'text-gray-400'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthView('register')}
              className={`relative z-10 flex-1 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-colors duration-300 ${
                authView === 'register' ? 'text-black' : 'text-gray-400'
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
              transition={{ duration: 0.22, ease: "easeOut" }}
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
            className="fixed inset-x-0 top-16 sm:top-20 z-40 bg-white shadow-2xl md:hidden border-b border-gray-100 overflow-hidden"
            ref={menuRef}
          >
            <div className="container mx-auto px-4 py-8 flex flex-col gap-6">
              <div className="space-y-4">
                <nav className="flex flex-col">
                  {navLinks.map((link) => {
                    const isActive = pathname?.startsWith(link.href);
                    return (
                        <Link
                          key={link.name}
                          href={link.href}
                          onClick={(e) => handleProtectedClick(e, link.href, !!link.protected)}
                          className={`px-4 py-4 text-xl font-bold transition-all flex items-center justify-between group ${
                            isActive ? 'text-black' : 'text-gray-500 hover:text-black'
                          }`}
                        >
                        {link.name}
                        <div className={`h-1.5 w-1.5 rounded-full bg-black ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                      </Link>
                    );
                  })}
                </nav>
              </div>
              
              <div className="pt-6 border-t border-gray-100 space-y-4">
                <Link 
                  href="/cart" 
                  onClick={(e) => {
                    if (!isAuthenticated) {
                      e.preventDefault();
                      setIsMobileMenuOpen(false);
                      openModal('login', 'Please sign in to view your cart');
                    }
                  }}
                  className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-2xl group hover:bg-black transition-all"
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="h-5 w-5 text-gray-500 group-hover:text-white" />
                    <span className="font-bold text-gray-900 group-hover:text-white">Shopping Cart</span>
                  </div>
                  {itemCount > 0 && (
                    <span className="bg-black text-white group-hover:bg-white group-hover:text-black text-xs font-black h-6 w-6 rounded-full flex items-center justify-center">
                      {itemCount}
                    </span>
                  )}
                </Link>
                <Button 
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openModal('register');
                  }}
                  className="w-full rounded-2xl bg-black text-white h-14 font-bold text-lg shadow-xl shadow-black/10"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
