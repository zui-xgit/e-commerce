import { Head, router } from '@inertiajs/react';
import { Eye, MoreHorizontal, PackageOpen, Trash2 } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import {
    OrderDeleteDialog,
    type OrderDeleteTarget,
} from '@/components/admin/orders/order-delete-dialog';
import { OrderFiltersBar } from '@/components/admin/orders/order-filters';
import { OrderStatusBadge } from '@/components/admin/orders/order-status-badge';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { formatOrderDate } from '@/lib/admin-orders';
import { formatProductPrice } from '@/lib/admin-products';
import admin from '@/routes/admin';
import type {
    AdminOrderFilters,
    AdminOrderListItem,
    AdminOrdersIndexProps,
} from '@/types/admin-orders';

const EMPTY_FILTERS: AdminOrderFilters = {
    search: '',
    status: 'all',
    customer: '',
    sort: 'newest',
};

function OrderActionsMenu({
    order,
    onView,
    onDelete,
}: {
    order: AdminOrderListItem;
    onView: () => void;
    onDelete: () => void;
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 shrink-0"
                    aria-label={`Actions for ${order.orderNumber}`}
                >
                    <MoreHorizontal />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onView}>
                    <Eye />
                    View details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={onDelete}
                >
                    <Trash2 />
                    {order.status === 'processed' ||
                    order.status === 'cancelled'
                        ? 'Clear order'
                        : 'Delete order'}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default function OrdersIndex({
    orders,
    customers,
    filters,
    counts,
}: AdminOrdersIndexProps) {
    const currency = useSiteSettings().currency;
    const [filtering, setFiltering] = useState(false);
    const [deleting, setDeleting] = useState<OrderDeleteTarget | null>(null);
    const filtersRef = useRef(filters);
    filtersRef.current = filters;

    const visitFilters = useCallback((next: AdminOrderFilters) => {
        setFiltering(true);
        router.get(admin.orders.index().url, next, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setFiltering(false),
        });
    }, []);

    const applyFilters = useCallback(
        (next: Partial<AdminOrderFilters>) =>
            visitFilters({ ...filtersRef.current, ...next }),
        [visitFilters],
    );

    const resetFilters = useCallback(
        () => visitFilters(EMPTY_FILTERS),
        [visitFilters],
    );

    const goToPage = (url: string | null) => {
        if (!url) {
            return;
        }

        setFiltering(true);
        router.visit(url, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setFiltering(false),
        });
    };

    const openOrder = (uuid: string) =>
        router.visit(admin.orders.show(uuid).url);

    const hasFilters = Boolean(
        filters.search ||
        filters.customer ||
        filters.status !== 'all' ||
        filters.sort !== 'newest',
    );

    const bulkStatus =
        filters.status === 'processed' || filters.status === 'cancelled'
            ? filters.status
            : null;

    const from =
        orders.total === 0
            ? 0
            : (orders.current_page - 1) * orders.per_page + 1;
    const to = Math.min(orders.current_page * orders.per_page, orders.total);

    return (
        <>
            <Head title="Orders" />

            <div className="w-full space-y-4">
                <div className="flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-end sm:justify-between">
                    <Heading
                        title="Orders"
                        description="Work the phone-confirmation queue: call, confirm, and keep stock honest."
                    />
                    <p className="text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground tabular-nums">
                            {counts.pending}
                        </span>{' '}
                        awaiting confirmation
                    </p>
                </div>

                <OrderFiltersBar
                    filters={filters}
                    customers={customers}
                    counts={counts}
                    total={orders.total}
                    filtering={filtering}
                    onChange={applyFilters}
                    onReset={resetFilters}
                />

                {bulkStatus && counts[bulkStatus] > 0 && (
                    <div className="flex flex-col gap-3 rounded-lg border border-destructive/25 bg-destructive/5 px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                            <p className="text-sm font-medium">
                                Clean up {bulkStatus} orders
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Orders and their details will be removed
                                permanently. No stock will be changed. This
                                cannot be undone.
                            </p>
                        </div>
                        <Button
                            id={`clear-all-${bulkStatus}-orders`}
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="w-full shrink-0 sm:w-auto"
                            onClick={() =>
                                setDeleting({
                                    kind: 'bulk',
                                    status: bulkStatus,
                                    count: counts[bulkStatus],
                                })
                            }
                        >
                            <Trash2 />
                            Clear All
                        </Button>
                    </div>
                )}

                {orders.total === 0 && (
                    <Card className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                            <PackageOpen className="size-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-base font-semibold">
                                {hasFilters
                                    ? 'No orders match those filters'
                                    : 'No orders yet'}
                            </h2>
                            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                                {hasFilters
                                    ? 'Try another customer, status or search term.'
                                    : 'New checkout orders will appear here, ready for a confirmation call.'}
                            </p>
                        </div>
                        {hasFilters && (
                            <Button variant="outline" onClick={resetFilters}>
                                Clear filters
                            </Button>
                        )}
                    </Card>
                )}

                {orders.total > 0 && (
                    <>
                        {/* The same dense queue at every width; scroll sideways on phones. */}
                        <Card className="gap-0 overflow-hidden py-0">
                            <Table className="min-w-[960px] [&_td]:py-3 [&_th]:h-12">
                                <TableHeader>
                                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                                        <TableHead className="min-w-48 pl-4">
                                            Order
                                        </TableHead>
                                        <TableHead className="min-w-48">
                                            Customer
                                        </TableHead>
                                        <TableHead>Items</TableHead>
                                        <TableHead className="text-right">
                                            Total
                                        </TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Placed</TableHead>
                                        <TableHead className="w-12 pr-4">
                                            <span>Actions</span>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {orders.data.map((order) => (
                                        <TableRow
                                            key={order.uuid}
                                            onClick={() =>
                                                openOrder(order.uuid)
                                            }
                                            className="cursor-pointer"
                                        >
                                            <TableCell className="pl-4">
                                                <p className="font-medium">
                                                    {order.orderNumber}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {order.isGuest
                                                        ? 'Guest'
                                                        : 'Account'}
                                                </p>
                                            </TableCell>
                                            <TableCell>
                                                <p className="truncate font-medium">
                                                    {order.customerName}
                                                </p>
                                                <p className="truncate text-xs text-muted-foreground">
                                                    {order.phone ||
                                                        order.customerEmail ||
                                                        '—'}
                                                </p>
                                            </TableCell>
                                            <TableCell className="flex items-center gap-3 text-sm text-muted-foreground tabular-nums">
                                                <span>
                                                    {order.itemCount} items
                                                </span>
                                                |
                                                <span>
                                                    {order.totalQuantity} units
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right font-medium tabular-nums">
                                                {formatProductPrice(
                                                    order.total,
                                                    currency,
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <OrderStatusBadge
                                                        status={order.status}
                                                    />
                                                    {order.shortfallUnits >
                                                        0 && (
                                                        <Badge variant="outline">
                                                            {
                                                                order.shortfallUnits
                                                            }{' '}
                                                            short
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">
                                                {formatOrderDate(
                                                    order.placedAt,
                                                )}
                                            </TableCell>
                                            <TableCell
                                                className="pr-4 text-right"
                                                onClick={(event) =>
                                                    event.stopPropagation()
                                                }
                                            >
                                                <OrderActionsMenu
                                                    order={order}
                                                    onView={() =>
                                                        openOrder(order.uuid)
                                                    }
                                                    onDelete={() =>
                                                        setDeleting({
                                                            kind: 'single',
                                                            order,
                                                        })
                                                    }
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs text-muted-foreground tabular-nums">
                                    Showing {from}–{to} of {orders.total}
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={
                                            orders.current_page <= 1 ||
                                            filtering
                                        }
                                        onClick={() =>
                                            goToPage(
                                                orders.links[0]?.url ?? null,
                                            )
                                        }
                                    >
                                        Previous
                                    </Button>
                                    <span className="px-1 text-xs text-muted-foreground tabular-nums">
                                        {orders.current_page} /{' '}
                                        {orders.last_page}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={
                                            orders.current_page >=
                                                orders.last_page || filtering
                                        }
                                        onClick={() =>
                                            goToPage(
                                                orders.links[
                                                    orders.links.length - 1
                                                ]?.url ?? null,
                                            )
                                        }
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </>
                )}
            </div>

            <OrderDeleteDialog
                target={deleting}
                onClose={() => setDeleting(null)}
            />
        </>
    );
}

OrdersIndex.layout = {
    breadcrumbs: [
        { title: 'Store', href: admin.dashboard().url },
        { title: 'Orders', href: admin.orders.index().url },
    ],
};
