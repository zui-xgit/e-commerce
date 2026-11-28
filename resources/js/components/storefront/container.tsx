import type { PropsWithChildren } from 'react';
import { cn } from '@/lib/utils';

export function Container({
    children,
    className,
}: PropsWithChildren<{ className?: string }>) {
    return (
        <div
            className={cn(
                // CHANGED: max-w-7xl (80rem) -> max-w-[90rem] (1440px) for wider screens
                'mx-auto w-full max-w-[90rem] min-w-0 px-4 sm:px-6 lg:px-8',
                className,
            )}
        >
            {children}
        </div>
    );
}
