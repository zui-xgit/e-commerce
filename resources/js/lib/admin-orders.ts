import type { AdminOrderStatus } from '@/types/admin-orders';

export function formatOrderDate(value: string): string {
    if (!value) {
        return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    return new Intl.DateTimeFormat('en-TZ', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(date);
}

export function orderStatusLabel(status: AdminOrderStatus): string {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

export function unitsLabel(count: number): string {
    return `${count} ${count === 1 ? 'unit' : 'units'}`;
}
