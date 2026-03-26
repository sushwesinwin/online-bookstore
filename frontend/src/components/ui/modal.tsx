'use client';

import { X } from 'lucide-react';
import { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={e => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="w-full max-w-full sm:max-w-md lg:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-200 max-h-[90vh] sm:max-h-[85vh] relative">
        {title ? (
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-[#E4E9E8]">
            <h2 className="text-base sm:text-lg font-bold text-[#101313]">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-[#F3F5F5] transition-colors"
            >
              <X className="h-5 w-5 text-[#848785]" />
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 p-2 rounded-xl hover:bg-[#F3F5F5] transition-colors bg-white/50 backdrop-blur-sm"
          >
            <X className="h-5 w-5 text-[#848785]" />
          </button>
        )}
        <div className={`p-4 sm:p-6 lg:p-8 max-h-[calc(90vh-${title ? '80px' : '40px'})] sm:max-h-[calc(85vh-${title ? '80px' : '40px'})] overflow-y-auto ${!title ? 'pt-10' : ''}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
