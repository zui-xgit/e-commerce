import type { StorefrontOrderStatus } from '@/types/storefront-orders';
import { cn } from '@/lib/utils';

const STATUS: Record<
    StorefrontOrderStatus,
    { label: string; className: string; dotClassName: string }
> = {
    pending: {
        label: 'Pending',
        className: 'bg-warning/15 text-ink',
        dotClassName: 'bg-warning',
    },
    processed: {
        label: 'Processed',
        className: 'bg-success/10 text-ink',
        dotClassName: 'bg-success',
    },
    cancelled: {
        label: 'Cancelled',
        className: 'bg-error/10 text-ink',
        dotClassName: 'bg-error',
    },
};

export function OrderStatusBadge({
    status,
    className,
}: {
    status: StorefrontOrderStatus;
    className?: string;
}) {
    const { label, className: tone, dotClassName } = STATUS[status];

    return (
        <span
            className={cn(
                'inline-flex min-h-7 items-center gap-2 rounded-full px-3 text-xs font-extrabold',
                tone,
                className,
            )}
        >
            <span
                aria-hidden="true"
                className={cn('size-1.5 shrink-0 rounded-full', dotClassName)}
            />
            {label}
        </span>
    );
}
