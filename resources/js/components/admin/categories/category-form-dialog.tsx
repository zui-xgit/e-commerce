import { useForm } from "@inertiajs/react";
import { ImagePlus, LoaderCircle, X } from "lucide-react";
import {
    useEffect,
    useRef,
    useState,
    type ChangeEvent,
    type FormEvent,
    type ReactNode,
} from "react";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import admin from "@/routes/admin";
import type { AdminCategory } from "@/types/admin-categories";

type CategoryFormValues = {
    name: string;
    sort_order: string;
    is_active: boolean;
    thumbnail: File | null;
    clear_thumbnail: boolean;
};

function emptyForm(): CategoryFormValues {
    return {
        name: "",
        sort_order: "0",
        is_active: true,
        thumbnail: null,
        clear_thumbnail: false,
    };
}

function formFromCategory(category: AdminCategory | null): CategoryFormValues {
    if (!category) {
        return emptyForm();
    }

    return {
        name: category.name,
        sort_order: String(category.sort_order),
        is_active: category.is_active,
        thumbnail: null,
        clear_thumbnail: false,
    };
}

function Field({
    label,
    htmlFor,
    error,
    hint,
    children,
    className,
}: {
    label: string;
    htmlFor: string;
    error?: string;
    hint?: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={cn("grid gap-2", className)}>
            <Label htmlFor={htmlFor}>{label}</Label>
            {children}
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
            <InputError message={error} />
        </div>
    );
}

export function CategoryFormDialog({
    open,
    onOpenChange,
    category,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: AdminCategory | null;
}) {
    const form = useForm<CategoryFormValues>(emptyForm());
    const { data, setData, errors, post, processing, reset } = form;
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
        null,
    );
    const previewUrl = useRef<string | null>(null);

    useEffect(() => {
        if (!open) {
            return;
        }

        reset();
        setData(formFromCategory(category));
        setThumbnailPreview(null);
    }, [category, open, reset, setData]);

    useEffect(
        () => () => {
            if (previewUrl.current) {
                URL.revokeObjectURL(previewUrl.current);
            }
        },
        [],
    );

    const close = (nextOpen: boolean) => {
        if (!nextOpen && previewUrl.current) {
            URL.revokeObjectURL(previewUrl.current);
            previewUrl.current = null;
            setThumbnailPreview(null);
        }

        onOpenChange(nextOpen);
    };

    const handleThumbnail = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;

        if (previewUrl.current) {
            URL.revokeObjectURL(previewUrl.current);
            previewUrl.current = null;
        }

        if (file) {
            const url = URL.createObjectURL(file);
            previewUrl.current = url;
            setThumbnailPreview(url);
        } else {
            setThumbnailPreview(null);
        }

        setData((current) => ({
            ...current,
            thumbnail: file,
            clear_thumbnail: false,
        }));
        event.target.value = "";
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const options = {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                form.transform((current) => current);
                close(false);
            },
            onFinish: () => form.transform((current) => current),
        };

        if (category) {
            form.transform((current) => ({ ...current, _method: "put" }));
            post(admin.categoriesUpdate(category.uuid).url, options);
            return;
        }

        post(admin.categoriesStore().url, options);
    };

    const thumbnailSource =
        thumbnailPreview ??
        (data.clear_thumbnail ? null : (category?.thumbnail_url ?? null));

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="sm:max-w-xl" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle>
                        {category ? "Edit category" : "Add category"}
                    </DialogTitle>
                    <DialogDescription>
                        {category
                            ? "Update how this category appears in the catalogue."
                            : "Create a category to organize products in the storefront."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4" noValidate>
                    <Field
                        label="Name"
                        htmlFor="category-name"
                        error={errors.name}
                    >
                        <Input
                            id="category-name"
                            value={data.name}
                            placeholder="e.g. Home accessories"
                            onChange={(event) =>
                                setData("name", event.target.value)
                            }
                            aria-invalid={Boolean(errors.name)}
                        />
                    </Field>

                    <div className="grid gap-4">
                        <Field
                            label="Sort order"
                            htmlFor="category-sort-order"
                            error={errors.sort_order}
                            hint="Lower numbers appear first."
                        >
                            <Input
                                id="category-sort-order"
                                inputMode="numeric"
                                value={data.sort_order}
                                onChange={(event) =>
                                    setData("sort_order", event.target.value)
                                }
                                aria-invalid={Boolean(errors.sort_order)}
                            />
                        </Field>
                    </div>

                    <Field
                        label="Thumbnail"
                        htmlFor="category-thumbnail"
                        error={errors.thumbnail}
                        hint="Optional image used where categories are displayed."
                    >
                        <div className="flex flex-col gap-3 rounded-md border border-dashed p-3 sm:flex-row sm:items-center">
                            <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/50">
                                {thumbnailSource ? (
                                    <img
                                        src={thumbnailSource}
                                        alt=""
                                        width={80}
                                        height={80}
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <ImagePlus className="size-6 text-muted-foreground" />
                                )}
                            </div>
                            <div className="min-w-0 flex-1 space-y-2">
                                <Input
                                    id="category-thumbnail"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleThumbnail}
                                    className="h-auto cursor-pointer py-2"
                                />
                                {category?.thumbnail_url &&
                                    !thumbnailPreview &&
                                    !data.clear_thumbnail && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                                setData("clear_thumbnail", true)
                                            }
                                        >
                                            <X />
                                            Remove thumbnail
                                        </Button>
                                    )}
                            </div>
                        </div>
                    </Field>

                    <div className="flex items-center gap-2 rounded-md border p-4">
                        <Checkbox
                            id="category-active"
                            checked={data.is_active}
                            onCheckedChange={(checked) =>
                                setData("is_active", checked === true)
                            }
                        />
                        <Label
                            htmlFor="category-active"
                            className="cursor-pointer"
                        >
                            Active in storefront
                        </Label>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={processing}
                            onClick={() => close(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {processing && (
                                <LoaderCircle className="animate-spin" />
                            )}
                            {category ? "Save changes" : "Create category"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
