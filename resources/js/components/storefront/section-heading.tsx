import type { ReactNode } from 'react';
import {
    Heading,
    type HeadingLevel,
    type HeadingSize,
    type HeadingTone,
} from '@/components/storefront/heading';
import { cn } from '@/lib/utils';

type SectionHeadingProps = {
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    level?: HeadingLevel;
    size?: HeadingSize;
    tone?: HeadingTone;
    align?: 'start' | 'center';
    id?: string;
    className?: string;
};

export function SectionHeading({
    title,
    description,
    action,
    level = 2,
    size = 'section',
    tone = 'ink',
    align = 'start',
    id,
    className,
}: SectionHeadingProps) {
    return (
        <div
            className={cn(
                'flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between',
                align === 'center' &&
                    'sm:flex-col sm:items-center sm:text-center',
                className,
            )}
        >
            <div className="min-w-0">
                <Heading level={level} size={size} tone={tone} id={id}>
                    {title}
                </Heading>
                {description && (
                    <p
                        className={cn(
                            'mt-2 max-w-xl text-sm leading-relaxed',
                            tone === 'surface'
                                ? 'text-surface/80'
                                : 'text-ink-muted',
                        )}
                    >
                        {description}
                    </p>
                )}
            </div>
            {action}
        </div>
    );
}
