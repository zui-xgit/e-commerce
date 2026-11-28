import { router, usePage } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import admin from '@/routes/admin';
import type {
    AdminOrderListItem,
    AdminOrderStatus,
} from '@/types/admin-orders';

type DeletableOrder = Pick<
    AdminOrderListItem,
    'uuid' | 'orderNumber' | 'status'
>;

export type OrderDeleteTarget =
    | { kind: 'single'; order: DeletableOrder }
    | {
          kind: 'bulk';
          status: Extract<AdminOrderStatus, 'processed' | 'cancelled'>;
          count: number;
      };

export function OrderDeleteDialog({
    target,
    onClose,
}: {
    target: OrderDeleteTarget | null;
    onClose: () => void;
}) {
    const [processing, setProcessing] = useState(false);
    const errors =
        usePage<{ errors: Record<string, string> }>().props.errors ?? {};

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!target || processing) {
            return;
        }

        setProcessing(true);

        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setProcessing(false);
                onClose();
            },
            onFinish: () => setProcessing(false),
        };

        if (target.kind === 'single') {
            router.delete(admin.orders.destroy(target.order.uuid).url, options);

            return;
        }

        router.post(
            admin.orders.bulkDestroy().url,
            { status: target.status },
            options,
        );
    };

    const isBulk = target?.kind === 'bulk';
    const status = target?.kind === 'bulk' ? target.status : null;
    const count = target?.kind === 'bulk' ? target.count : 0;
    const orderWord = count === 1 ? 'order' : 'orders';
    const isClear = target
        ? target.kind === 'bulk' ||
          target.order.status === 'processed' ||
          target.order.status === 'cancelled'
        : false;

    return (
        <Dialog
            open={target !== null}
            onOpenChange={(open) => {
                if (!open && !processing) {
                    onClose();
                }
            }}
        >
            <DialogContent className="sm:max-w-md" showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>
                        {isBulk
                            ? `Clear all ${status} orders?`
                            : isClear
                              ? 'Clear order?'
                              : 'Delete order?'}
                    </DialogTitle>
                    <DialogDescription>
                        {target?.kind === 'single' ? (
                            <>
                                <span className="font-medium">
                                    {target.order.orderNumber}
                                </span>{' '}
                                {isClear
                                    ? 'will be permanently cleared. No stock will be changed. '
                                    : 'will be permanently deleted. '}
                                This cannot be undone.
                            </>
                        ) : target?.kind === 'bulk' ? (
                            <>
                                All{' '}
                                <span className="font-medium tabular-nums">
                                    {target.count} {status} {orderWord}
                                </span>{' '}
                                will be permanently cleared. No stock will be
                                changed. This cannot be undone.
                            </>
                        ) : null}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} noValidate>
                    {errors.error && (
                        <p className="mb-4 text-sm text-destructive">
                            {errors.error}
                        </p>
                    )}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={processing}
                            onClick={onClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={processing}
                        >
                            {processing && (
                                <LoaderCircle className="animate-spin" />
                            )}
                            {isBulk
                                ? `Clear ${count} ${orderWord}`
                                : isClear
                                  ? 'Clear order'
                                  : 'Delete order'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
