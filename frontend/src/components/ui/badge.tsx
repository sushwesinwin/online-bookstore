import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#0B7C6B] focus:ring-offset-2',
    {
        variants: {
            variant: {
                default: 'border-transparent bg-[#0B7C6B] text-white hover:bg-[#096355]',
                secondary: 'border-transparent bg-[#FF6320] text-white hover:bg-[#E6591D]',
                destructive: 'border-transparent bg-[#FF4E3E] text-white hover:bg-[#E6463A]',
                success: 'border-transparent bg-[#17BD8D] text-white hover:bg-[#14A87E]',
                warning: 'border-transparent bg-[#FFA118] text-white hover:bg-[#E69116]',
                info: 'border-transparent bg-[#219FFF] text-white hover:bg-[#1E8FE6]',
                outline: 'text-[#101313] border-[#E4E9E8]',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
