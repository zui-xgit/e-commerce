import { Head, router, usePage } from '@inertiajs/react';
import { AlertTriangle, Phone, Trash2 } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { BackButton } from '@/components/admin/back-button';
import { ConfirmDialog } from '@/components/admin/confirm-dialog';
import {
    OrderDeleteDialog,
    type OrderDeleteTarget,
} from '@/components/admin/orders/order-delete-dialog';
import { OrderStatusBadge } from '@/components/admin/orders/order-status-badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { formatOrderDate, unitsLabel } from '@/lib/admin-orders';
import { formatProductPrice } from '@/lib/admin-products';
import admin from '@/routes/admin';
import type { AdminOrderDetail, AdminOrderItem } from '@/types/admin-orders';

function Detail({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="grid gap-1">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="min-w-0 text-sm font-medium break-words">{value}</dd>
        </div>
    );
}

function ItemLine({
    item,
    currency,
}: {
    item: AdminOrderItem;
    currency: ReturnType<typeof useSiteSettings>['currency'];
}) {
    return (
        <li className="space-y-2 border-b py-3 last:border-b-0">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                        {formatProductPrice(item.price, currency)} ×{' '}
                        {item.quantity} · {item.brand || 'No brand'}
                    </p>
                </div>
                <span className="shrink-0 text-sm font-medium tabular-nums">
                    {formatProductPrice(item.lineTotal, currency)}
                </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                <span className="tabular-nums">
                    Deducted:{' '}
                    <span className="font-medium text-foreground">
                        {item.confirmedQuantity}
                    </span>
                </span>
                <span className="tabular-nums">
                    In stock now:{' '}
                    <span className="font-medium text-foreground">
                        {item.availableStock ?? 'Product removed'}
                    </span>
                </span>
                {item.shortfall > 0 && (
                    <Badge variant="outline">
                        {unitsLabel(item.shortfall)} short
                    </Badge>
                )}
            </div>
        </li>
    );
}

export default function OrderShow({ order }: { order: AdminOrderDetail }) {
    const currency = useSiteSettings().currency;
    const errors =
        usePage<{ errors: Record<string, string> }>().props.errors ?? {};
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [cancelOpen, setCancelOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<OrderDeleteTarget | null>(
        null,
    );
    const [busy, setBusy] = useState(false);

    const isPending = order.status === 'pending';
    const isProcessed = order.status === 'processed';
    const isClear = isProcessed || order.status === 'cancelled';
    const shortItems = order.items.filter((item) => item.shortfall > 0);
    const hasRemovedProduct = order.items.some(
        (item) => item.availableStock === null,
    );
    const hasStockIssue = shortItems.length > 0 || hasRemovedProduct;

    const stockPlan = order.items.map((item) => {
        const remainingToConfirm = Math.max(
            0,
            item.quantity - item.confirmedQuantity,
        );
        const available = item.availableStock ?? 0;
        const willDeduct = Math.min(remainingToConfirm, available);

        return {
            ...item,
            available,
            willDeduct,
            stockAfter: available - willDeduct,
            stillShort: remainingToConfirm - willDeduct,
            removed: item.availableStock === null,
        };
    });

    const post = (url: string, data: { allowPartial?: boolean }) => {
        setBusy(true);
        router.post(url, data, {
            preserveScroll: true,
            onFinish: () => setBusy(false),
        });
    };

    return (
        <>
            <Head title={order.orderNumber} />

            <div className="w-full space-y-5">
                <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                        <BackButton className="mt-0.5" />
                        <div className="min-w-0 space-y-2">
                            <div className="space-y-1">
                                <h1 className="text-xl font-semibold tracking-tight">
                                    {order.orderNumber}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Placed {formatOrderDate(order.placedAt)}
                                </p>
                            </div>
                            <OrderStatusBadge status={order.status} />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:w-auto sm:flex-row">
                        {isPending && (
                            <>
                                <Button
                                    id="confirm-order"
                                    onClick={() => setConfirmOpen(true)}
                                    disabled={busy}
                                    className="w-full sm:w-auto"
                                >
                                    Confirm order
                                </Button>
                                <Button
                                    id="cancel-order"
                                    variant="outline"
                                    onClick={() => setCancelOpen(true)}
                                    disabled={busy}
                                    className="w-full sm:w-auto"
                                >
                                    Cancel order
                                </Button>
                            </>
                        )}
                        {isProcessed && (
                            <Button
                                id="cancel-processed-order"
                                variant="destructive"
                                onClick={() => setCancelOpen(true)}
                                disabled={busy}
                                className="w-full sm:w-auto"
                            >
                                Cancel &amp; Restore stock
                            </Button>
                        )}
                        <Button
                            id="delete-order"
                            variant="outline"
                            onClick={() =>
                                setDeleteTarget({ kind: 'single', order })
                            }
                            disabled={busy}
                            className="w-full text-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto"
                        >
                            <Trash2 />
                            {isClear ? 'Clear order' : 'Delete order'}
                        </Button>
                    </div>
                </header>

                {(errors.order || errors.confirmation) && (
                    <Alert variant="destructive">
                        <AlertTriangle />
                        <AlertTitle>
                            That action could not be completed
                        </AlertTitle>
                        <AlertDescription>
                            {errors.confirmation ?? errors.order}
                            <span className="mt-1 block">
                                Reload the order if stock may have changed since
                                this page opened.
                            </span>
                        </AlertDescription>
                    </Alert>
                )}

                {isPending && (shortItems.length > 0 || hasRemovedProduct) && (
                    <Alert>
                        <AlertTriangle />
                        <AlertTitle>Check stock before you call</AlertTitle>
                        <AlertDescription>
                            Confirmation will deduct only what is currently
                            available.
                            <ul className="mt-2 space-y-0.5">
                                {shortItems.map((item) => (
                                    <li
                                        key={item.uuid}
                                        className="tabular-nums"
                                    >
                                        {item.title}: need {item.quantity}, have{' '}
                                        {item.availableStock ?? 0}
                                    </li>
                                ))}
                                {hasRemovedProduct && (
                                    <li>
                                        One or more products are no longer in
                                        the catalogue.
                                    </li>
                                )}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="flex min-w-0 flex-col gap-5">
                        <Card className="gap-0 overflow-hidden py-0">
                            <CardHeader className="flex flex-row items-center justify-between gap-4 border-b px-5 py-4">
                                <div className="space-y-1">
                                    <CardTitle className="text-base">
                                        Ordered items
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground">
                                        Snapshot from checkout, checked against
                                        live stock
                                    </p>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className="tabular-nums"
                                >
                                    {order.items.length}
                                </Badge>
                            </CardHeader>
                            <CardContent className="px-5 py-2">
                                <ul className="sm:hidden">
                                    {order.items.map((item) => (
                                        <ItemLine
                                            key={item.uuid}
                                            item={item}
                                            currency={currency}
                                        />
                                    ))}
                                </ul>

                                <div className="hidden sm:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead className="pl-0">
                                                    Item
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Ordered
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Deducted
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    In stock
                                                </TableHead>
                                                <TableHead className="pr-0 text-right">
                                                    Line total
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {order.items.map((item) => (
                                                <TableRow
                                                    key={item.uuid}
                                                    className="hover:bg-transparent"
                                                >
                                                    <TableCell className="pl-0">
                                                        <p className="font-medium">
                                                            {item.title}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatProductPrice(
                                                                item.price,
                                                                currency,
                                                            )}
                                                            {item.brand &&
                                                                ` · ${item.brand}`}
                                                        </p>
                                                        {item.shortfall > 0 && (
                                                            <Badge
                                                                variant="outline"
                                                                className="mt-1"
                                                            >
                                                                {unitsLabel(
                                                                    item.shortfall,
                                                                )}{' '}
                                                                short
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right tabular-nums">
                                                        {item.quantity}
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium tabular-nums">
                                                        {item.confirmedQuantity}
                                                    </TableCell>
                                                    <TableCell className="text-right text-muted-foreground tabular-nums">
                                                        {item.availableStock ??
                                                            'Removed'}
                                                    </TableCell>
                                                    <TableCell className="pr-0 text-right font-medium tabular-nums">
                                                        {formatProductPrice(
                                                            item.lineTotal,
                                                            currency,
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="gap-0 py-0">
                            <CardHeader className="border-b px-5 py-4">
                                <CardTitle className="text-base">
                                    Customer &amp; delivery
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-5 p-5 sm:grid-cols-2">
                                <section className="space-y-3">
                                    <dl className="space-y-3">
                                        <Detail
                                            label="Name"
                                            value={order.customer.name}
                                        />
                                        <Detail
                                            label="Phone"
                                            value={
                                                order.customer.phone ? (
                                                    <a
                                                        href={`tel:${order.customer.phone}`}
                                                        className="inline-flex items-center gap-1.5 underline-offset-4 hover:underline"
                                                    >
                                                        <Phone className="size-3.5 text-muted-foreground" />
                                                        {order.customer.phone}
                                                    </a>
                                                ) : (
                                                    'Not provided'
                                                )
                                            }
                                        />
                                        <Detail
                                            label="Email"
                                            value={
                                                order.customer.email ||
                                                'Not provided'
                                            }
                                        />
                                        <Detail
                                            label="Account"
                                            value={
                                                order.customer.isGuest
                                                    ? 'Guest checkout'
                                                    : 'Registered customer'
                                            }
                                        />
                                    </dl>
                                </section>

                                <section className="space-y-3 sm:border-l sm:pl-5">
                                    {order.delivery ? (
                                        <dl className="space-y-3">
                                            <Detail
                                                label="Recipient"
                                                value={order.delivery.name}
                                            />
                                            {order.delivery.company && (
                                                <Detail
                                                    label="Company"
                                                    value={
                                                        order.delivery.company
                                                    }
                                                />
                                            )}
                                            <Detail
                                                label="Address"
                                                value={
                                                    <span className="whitespace-pre-line">
                                                        {[
                                                            order.delivery
                                                                .address,
                                                            order.delivery.city,
                                                            order.delivery
                                                                .postalCode,
                                                            order.delivery
                                                                .country,
                                                        ]
                                                            .filter(Boolean)
                                                            .join('\n')}
                                                    </span>
                                                }
                                            />
                                        </dl>
                                    ) : (
                                        <p className="text-sm text-muted-foreground">
                                            No delivery address was saved with
                                            this order.
                                        </p>
                                    )}
                                </section>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="flex flex-col gap-5">
                        <Card className="gap-0 py-0">
                            <CardHeader className="border-b px-5 py-4">
                                <CardTitle className="text-base">
                                    Order summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 p-5">
                                <dl className="space-y-3">
                                    <Detail
                                        label="Ordered value"
                                        value={
                                            <span className="tabular-nums">
                                                {formatProductPrice(
                                                    order.total,
                                                    currency,
                                                )}{' '}
                                                · {currency}
                                            </span>
                                        }
                                    />
                                    <Detail
                                        label="Fulfilled value"
                                        value={
                                            <span className="tabular-nums">
                                                {formatProductPrice(
                                                    order.fulfilledTotal,
                                                    currency,
                                                )}{' '}
                                                · {currency}
                                            </span>
                                        }
                                    />
                                    <Detail
                                        label="Shortfall"
                                        value={
                                            <span className="tabular-nums">
                                                {unitsLabel(
                                                    order.shortfallUnits,
                                                )}
                                            </span>
                                        }
                                    />
                                </dl>
                                <Separator />
                                <p className="text-xs leading-relaxed text-muted-foreground">
                                    Stock moves only when an order is confirmed.
                                    Cancelling a processed order returns exactly
                                    the units that were deducted.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="gap-0 py-0">
                            <CardHeader className="border-b px-5 py-4">
                                <CardTitle className="text-base">
                                    Status trail
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4 p-5">
                                <Detail
                                    label="Placed"
                                    value={formatOrderDate(order.placedAt)}
                                />
                                {order.confirmedAt && (
                                    <Detail
                                        label="Confirmed"
                                        value={`${formatOrderDate(order.confirmedAt)}${order.confirmedBy ? ` · ${order.confirmedBy}` : ''}`}
                                    />
                                )}
                                {order.cancelledAt && (
                                    <Detail
                                        label="Cancelled"
                                        value={`${formatOrderDate(order.cancelledAt)}${order.cancelledBy ? ` · ${order.cancelledBy}` : ''}`}
                                    />
                                )}
                                {order.cancellationReason && (
                                    <Detail
                                        label="Reason"
                                        value={order.cancellationReason}
                                    />
                                )}
                                {isPending && (
                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                        Call the customer, then confirm to
                                        deduct stock.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            <OrderDeleteDialog
                target={deleteTarget}
                onClose={() => setDeleteTarget(null)}
            />

            <ConfirmDialog
                open={confirmOpen}
                onOpenChange={setConfirmOpen}
                title="Confirm this order?"
                size="wide"
                description={
                    <>
                        <span className="block">
                            Review the stock position for every product in this
                            order. Confirming marks the order processed and
                            deducts only what is available:
                        </span>
                        <Table className="min-w-[640px] text-xs [&_td]:py-2 [&_th]:h-9">
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-right">
                                        Ordered
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Available
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Will deduct
                                    </TableHead>
                                    <TableHead className="text-right">
                                        After deduction
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {stockPlan.map((item) => (
                                    <TableRow
                                        key={item.uuid}
                                        className="hover:bg-transparent"
                                    >
                                        <TableCell className="max-w-64 whitespace-normal">
                                            <span className="block font-medium text-foreground">
                                                {item.title}
                                            </span>
                                            {item.removed && (
                                                <span className="mt-0.5 block text-red-500">
                                                    Removed from catalogue
                                                </span>
                                            )}
                                            {!item.removed &&
                                                item.available === 0 && (
                                                    <span className="mt-0.5 block text-red-500">
                                                        Stock is 0
                                                    </span>
                                                )}
                                            {item.stillShort > 0 && (
                                                <span className="mt-0.5 block text-red-500">
                                                    {item.stillShort} unit
                                                    {item.stillShort === 1
                                                        ? ''
                                                        : 's'}{' '}
                                                    unfulfilled
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {item.quantity}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {item.removed
                                                ? 'Removed'
                                                : item.available}
                                        </TableCell>
                                        <TableCell className="text-right font-medium tabular-nums">
                                            {item.willDeduct}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            {item.stockAfter}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {hasStockIssue && (
                            <span className="mt-2 block">
                                Even when 0 units are deducted, the order will
                                still be marked processed.
                            </span>
                        )}
                    </>
                }
                confirmLabel={
                    hasStockIssue ? 'Confirm anyway' : 'Confirm order'
                }
                onConfirm={() =>
                    post(admin.orders.confirm(order.uuid).url, {
                        allowPartial: hasStockIssue,
                    })
                }
            />

            <ConfirmDialog
                open={cancelOpen}
                onOpenChange={setCancelOpen}
                title="Cancel this order?"
                description={
                    isProcessed
                        ? 'The units deducted for this order will be returned to stock exactly once.'
                        : 'No stock was deducted, so nothing will be restored.'
                }
                confirmLabel="Cancel order"
                destructive
                onConfirm={() => post(admin.orders.cancel(order.uuid).url, {})}
            />
        </>
    );
}

OrderShow.layout = {
    breadcrumbs: [
        { title: 'Store', href: admin.dashboard().url },
        { title: 'Orders', href: admin.orders.index().url },
        { title: 'Order', href: '#' },
    ],
};
