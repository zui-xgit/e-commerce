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
import type { AdminBanner } from "@/types/admin-banners";

export function BannerDeleteDialog({
    open,
    onOpenChange,
    banner,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    banner: AdminBanner | null;
}) {
    const { delete: destroy, processing, errors } = useForm<{ error: string }>({
        error: "",
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!banner) {
            return;
        }

        destroy(admin.bannersDestroy(banner.uuid).url, {
            preserveScroll: true,
            onSuccess: () => onOpenChange(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Remove banner?</DialogTitle>
                    <DialogDescription>
                        {banner
                            ? `"${banner.title}" will be permanently removed. This action cannot be undone.`
                            : "This banner will be removed."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} noValidate>
                    {errors.error && (
                        <p className="mb-4 text-sm text-destructive">{errors.error}</p>
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
                        <Button type="submit" variant="destructive" disabled={processing}>
                            {processing && <LoaderCircle className="animate-spin" />}
                            Remove banner
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
