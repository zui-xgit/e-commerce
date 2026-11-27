import { useForm } from "@inertiajs/react";
import { LoaderCircle } from "lucide-react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import admin from "@/routes/admin";
import type { AdminProduct } from "@/types/admin-products";

export function ProductDeleteDialog({
    open,
    onOpenChange,
    product,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: AdminProduct | null;
}) {
    const {
        delete: destroy,
        processing,
        errors,
    } = useForm<{ error: string }>({ error: "" });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!product) {
            return;
        }

        destroy(admin.products.destroy(product.uuid).url, {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Remove product?</DialogTitle>
                    <DialogDescription>
                        {product
                            ? `"${product.title}" will be permanently removed from the catalogue, along with its thumbnail and gallery images.`
                            : "This product will be permanently removed from the catalogue."}
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
                            Remove product
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
