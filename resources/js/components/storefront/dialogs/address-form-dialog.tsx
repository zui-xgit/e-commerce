import type { FormEvent } from 'react';
import { DeliveryAddressFields } from '@/components/storefront/delivery-address-fields';
import { Heading } from '@/components/storefront/heading';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type {
    DeliveryAddressErrors,
    DeliveryAddressValues,
} from '@/lib/storefront/delivery-address';

type AddressFormDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    submitLabel: string;
    values: DeliveryAddressValues;
    errors: DeliveryAddressErrors;
    processing: boolean;
    onChange: (field: keyof DeliveryAddressValues, value: string) => void;
    onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function AddressFormDialog({
    open,
    onOpenChange,
    title,
    submitLabel,
    values,
    errors,
    processing,
    onChange,
    onSubmit,
}: AddressFormDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="storefront max-h-[90dvh] overflow-y-auto rounded-2xl border-line bg-surface p-0 text-ink sm:max-w-3xl">
                <DialogHeader className="border-b border-line px-5 py-5 text-left sm:px-6">
                    <DialogTitle asChild>
                        <Heading level={2} size="card">
                            {title}
                        </Heading>
                    </DialogTitle>
                    <DialogDescription className="text-sm leading-relaxed text-ink-muted">
                        These are the same details used at checkout. Past orders
                        keep the information they were placed with.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={onSubmit}>
                    <div className="px-5 py-5 sm:px-6">
                        <DeliveryAddressFields
                            values={values}
                            errors={errors}
                            onChange={onChange}
                        />
                    </div>

                    <DialogFooter className="border-t border-line px-5 py-4 sm:px-6">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="h-11 rounded-xl border-line bg-surface px-4 text-sm font-bold text-ink-muted hover:bg-surface-alt hover:text-ink"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing}
                            className="h-11 rounded-xl bg-brand px-5 text-sm font-extrabold text-surface hover:bg-brand-deep disabled:opacity-70"
                        >
                            {submitLabel}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
