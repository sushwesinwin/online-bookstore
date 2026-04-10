'use client';

import { LucideIcon } from 'lucide-react';
import { Input, InputProps } from '@/components/ui/input';
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';

interface FloatingAuthInputProps extends InputProps {
  icon: LucideIcon;
  label: string;
}

export function FloatingAuthInput({
  className,
  error,
  icon: Icon,
  label,
  ...props
}: FloatingAuthInputProps) {
  return (
    <FormItem className="space-y-2">
      <div className="relative">
        <Icon
          className={cn(
            'pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#8B9794] transition-colors',
            error && 'text-[#FF4E3E]'
          )}
        />
        <FormControl>
          <Input
            {...props}
            error={error}
            placeholder=" "
            className={cn(
              'peer h-14 rounded-2xl border-[#E4E9E8] bg-white pl-11 pr-4 pb-3 pt-6 text-sm placeholder:text-transparent focus-visible:ring-[#0B7C6B]',
              className
            )}
          />
        </FormControl>
        <FormLabel
          className={cn(
            'pointer-events-none absolute left-10 top-0 z-10 -translate-y-1/2 rounded-full bg-white px-2 text-[11px] font-semibold text-[#66726F] transition-all duration-200',
            'peer-placeholder-shown:left-11 peer-placeholder-shown:top-1/2 peer-placeholder-shown:bg-transparent peer-placeholder-shown:px-0 peer-placeholder-shown:text-sm peer-placeholder-shown:font-medium peer-placeholder-shown:text-[#8B9794]',
            'peer-focus:left-10 peer-focus:top-0 peer-focus:bg-white peer-focus:px-2 peer-focus:text-[11px] peer-focus:font-semibold peer-focus:text-[#0B7C6B]',
            error &&
              'text-[#FF4E3E] peer-focus:text-[#FF4E3E] peer-placeholder-shown:text-[#FF4E3E]'
          )}
        >
          {label}
        </FormLabel>
      </div>
      <FormMessage className="pl-1 text-xs" />
    </FormItem>
  );
}
