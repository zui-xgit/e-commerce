import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { AdminOrderStatus } from '@/types/admin-orders';

const VARIANTS: Record<
    AdminOrderStatus,
    'secondary' | 'default' | 'destructive'
> = {
    pending: 'secondary',
    processed: 'default',
    cancelled: 'destructive',
};

export function OrderStatusBadge({
    status,
    className,
}: {
    status: AdminOrderStatus;
    className?: string;
}) {
    return (
        <Badge variant={VARIANTS[status]} className={cn('gap-1', className)}>
            <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-current"
            />
            {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
    );
}
