import { useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import type { FormEvent } from 'react';
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
import type { AdminCategory } from '@/types/admin-categories';

export function CategoryDeleteDialog({
    open,
    onOpenChange,
    category,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: AdminCategory | null;
}) {
    const {
        delete: destroy,
        processing,
        errors,
    } = useForm<{ error: string }>({
        error: '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!category) {
            return;
        }

        destroy(admin.categories.destroy(category.uuid).url, {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Remove category?</DialogTitle>
                    <DialogDescription>
                        {category
                            ? `"${category.name}" will be permanently removed. Categories with products cannot be removed.`
                            : 'This category will be removed.'}
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
                            onClick={() => onOpenChange(false)}
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
                            Remove category
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
