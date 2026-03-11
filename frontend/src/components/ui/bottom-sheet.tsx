'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  className,
}: BottomSheetProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'max-h-[85vh] overflow-hidden',
          'bg-white rounded-t-3xl shadow-2xl',
          'animate-in slide-in-from-bottom duration-300',
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-[#E4E9E8]">
            <h3 className="text-lg font-bold text-[#101313]">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#848785] hover:bg-[#F3F5F5] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto max-h-[calc(85vh-64px)]">
          {children}
        </div>
      </div>
    </>
  );
}
