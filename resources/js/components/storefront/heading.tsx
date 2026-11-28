import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export type HeadingLevel = 1 | 2 | 3 | 4;
export type HeadingSize = 'display' | 'page' | 'section' | 'card' | 'compact';
export type HeadingTone = 'ink' | 'surface';

const sizeClassName: Record<HeadingSize, string> = {
    display: 'text-[clamp(2.5rem,5.5vw,4.5rem)] leading-[0.95]',
    page: 'text-[clamp(2.25rem,5vw,3.75rem)] leading-[0.98]',
    section: 'text-2xl leading-tight sm:text-3xl',
    card: 'text-xl leading-snug',
    compact: 'text-lg leading-snug',
};

type HeadingProps = {
    level?: HeadingLevel;
    size?: HeadingSize;
    tone?: HeadingTone;
    id?: string;
    className?: string;
    children: ReactNode;
};

export function Heading({
    level = 2,
    size = 'section',
    tone = 'ink',
    id,
    className,
    children,
}: HeadingProps) {
    const Element = `h${level}` as const;

    return (
        <Element
            id={id}
            className={cn(
                'font-display font-extrabold tracking-tight text-balance',
                sizeClassName[size],
                tone === 'surface' ? 'text-surface' : 'text-ink',
                className,
            )}
        >
            {children}
        </Element>
    );
}
