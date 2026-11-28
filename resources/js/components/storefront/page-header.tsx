import type { ReactNode } from 'react';
import {
    Heading,
    type HeadingSize,
    type HeadingTone,
} from '@/components/storefront/heading';
import { cn } from '@/lib/utils';

export type PageHeaderVariant = 'standard' | 'compact';

type PageHeaderProps = {
    title: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    variant?: PageHeaderVariant;
    id?: string;
    className?: string;
    descriptionClassName?: string;
};

const variantStyles: Record<
    PageHeaderVariant,
    { headingSize: HeadingSize; headingTone: HeadingTone; description: string }
> = {
    standard: {
        headingSize: 'page',
        headingTone: 'ink',
        description:
            'mt-4 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg',
    },
    compact: {
        headingSize: 'compact',
        headingTone: 'ink',
        description:
            'mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted sm:text-base',
    },
};

export function PageHeader({
    title,
    description,
    action,
    variant = 'standard',
    id,
    className,
    descriptionClassName,
}: PageHeaderProps) {
    const styles = variantStyles[variant];

    return (
        <div
            className={cn(
                'flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-6',
                className,
            )}
        >
            <div className="min-w-0">
                <Heading
                    level={1}
                    size={styles.headingSize}
                    tone={styles.headingTone}
                    id={id}
                >
                    {title}
                </Heading>
                {description && (
                    <p className={cn(styles.description, descriptionClassName)}>
                        {description}
                    </p>
                )}
            </div>
            {action && (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {action}
                </div>
            )}
        </div>
    );
}
