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

type DeleteAddressDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    processing: boolean;
    onConfirm: () => void;
};

export function DeleteAddressDialog({
    open,
    onOpenChange,
    processing,
    onConfirm,
}: DeleteAddressDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="storefront rounded-2xl border-line bg-surface p-0 text-ink sm:max-w-md">
                <DialogHeader className="border-b border-line px-5 py-5 text-left sm:px-6">
                    <DialogTitle asChild>
                        <Heading level={2} size="card">
                            Delete saved address?
                        </Heading>
                    </DialogTitle>
                    <DialogDescription className="text-sm leading-relaxed text-ink-muted">
                        Checkout will start empty next time. Orders already
                        placed keep their delivery details.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="px-5 py-4 sm:px-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="h-11 rounded-xl border-line bg-surface px-4 text-sm font-bold text-ink-muted hover:bg-surface-alt hover:text-ink"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="button"
                        disabled={processing}
                        onClick={onConfirm}
                        className="h-11 rounded-xl bg-error px-5 text-sm font-extrabold text-surface hover:bg-error/90 disabled:opacity-70"
                    >
                        Delete address
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
