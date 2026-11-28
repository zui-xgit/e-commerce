import { useForm } from "@inertiajs/react";
import { ImagePlus, LoaderCircle, Upload, X } from "lucide-react";
import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type ChangeEvent,
    type DragEvent,
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
import type { AdminBanner } from "@/types/admin-banners";

type BannerFormValues = {
    title: string;
    sort_order: string;
    is_active: boolean;
    image: File | null;
};

function emptyForm(): BannerFormValues {
    return {
        title: "",
        sort_order: "0",
        is_active: true,
        image: null,
    };
}

function formFromBanner(banner: AdminBanner | null): BannerFormValues {
    if (!banner) {
        return emptyForm();
    }

    return {
        title: banner.title,
        sort_order: String(banner.sort_order),
        is_active: banner.is_active,
        image: null,
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

export function BannerFormDialog({
    open,
    onOpenChange,
    banner,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    banner: AdminBanner | null;
}) {
    const form = useForm<BannerFormValues>(emptyForm());
    const { data, setData, errors, post, processing, reset, clearErrors } =
        form;
    const fileInput = useRef<HTMLInputElement>(null);
    const previewUrl = useRef<string | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [dragging, setDragging] = useState(false);

    const releasePreview = useCallback(() => {
        if (previewUrl.current) {
            URL.revokeObjectURL(previewUrl.current);
            previewUrl.current = null;
        }
    }, []);

    useEffect(() => {
        if (!open) {
            return;
        }

        reset();
        setData(formFromBanner(banner));
        releasePreview();
        setImagePreview(null);
        setDragging(false);
    }, [banner, open, reset, releasePreview, setData]);

    useEffect(() => () => releasePreview(), [releasePreview]);

    const close = (nextOpen: boolean) => {
        if (!nextOpen) {
            releasePreview();
            setImagePreview(null);
            setDragging(false);
        }

        onOpenChange(nextOpen);
    };

    const clearSelectedImage = () => {
        releasePreview();
        setImagePreview(null);
        setData("image", null);
        clearErrors("image");

        if (fileInput.current) {
            fileInput.current.value = "";
        }
    };

    const acceptImage = (file: File | null) => {
        if (!file) {
            return;
        }

        releasePreview();
        const url = URL.createObjectURL(file);
        previewUrl.current = url;
        setImagePreview(url);
        setData("image", file);
        clearErrors("image");
    };

    const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;

        event.target.value = "";

        acceptImage(file);
    };

    const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();

        if (Array.from(event.dataTransfer.types).includes("Files")) {
            setDragging(true);
        }
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "copy";
    };

    const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setDragging(false);
        }
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setDragging(false);
        acceptImage(event.dataTransfer.files?.[0] ?? null);
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (processing) {
            return;
        }

        // POST keeps the multipart body parseable; Laravel spoofs the PUT route.
        // On edits, omit the image entirely when no new file was chosen so the
        // existing banner image is kept.
        form.transform((current) => {
            if (!banner) {
                return current;
            }

            const { image, ...fields } = current;

            return {
                ...fields,
                ...(image ? { image } : {}),
                _method: "put",
            };
        });

        const options = {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => close(false),
        };

        if (banner) {
            post(admin.banners.update(banner.uuid).url, options);
            return;
        }

        post(admin.banners.store().url, options);
    };

    const imageSource = imagePreview ?? banner?.image_url ?? null;
    const openPicker = () => fileInput.current?.click();

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent
                className="sm:max-w-xl"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader>
                    <DialogTitle>
                        {banner ? "Edit banner" : "Add banner"}
                    </DialogTitle>
                    <DialogDescription>
                        {banner
                            ? "Update the banner details and storefront image."
                            : "Create a banner for the storefront with its image and display order."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="space-y-4" noValidate>
                    <Field
                        label="Title"
                        htmlFor="banner-title"
                        error={errors.title}
                    >
                        <Input
                            id="banner-title"
                            value={data.title}
                            placeholder="e.g. Summer sale hero"
                            onChange={(event) =>
                                setData("title", event.target.value)
                            }
                            aria-invalid={Boolean(errors.title)}
                        />
                    </Field>

                    <Field
                        label="Sort order"
                        htmlFor="banner-sort-order"
                        error={errors.sort_order}
                        hint="Lower numbers appear first."
                    >
                        <Input
                            id="banner-sort-order"
                            inputMode="numeric"
                            value={data.sort_order}
                            onChange={(event) =>
                                setData("sort_order", event.target.value)
                            }
                            aria-invalid={Boolean(errors.sort_order)}
                        />
                    </Field>

                    <Field
                        label="Banner image"
                        htmlFor="banner-image"
                        error={errors.image}
                    >
                        <div
                            onDragEnter={handleDragEnter}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={cn(
                                "space-y-3 rounded-lg border border-dashed p-3 transition-colors",
                                dragging && "border-primary bg-accent/40",
                                errors.image &&
                                    !dragging &&
                                    "border-destructive/60",
                            )}
                        >
                            <input
                                id="banner-image"
                                ref={fileInput}
                                type="file"
                                onChange={handleImage}
                                className="peer sr-only"
                            />
                            <Label
                                htmlFor="banner-image"
                                className="relative flex aspect-[16/7] w-full cursor-pointer items-center justify-center overflow-hidden rounded-md border bg-muted/30 peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background"
                            >
                                {imageSource ? (
                                    <img
                                        src={imageSource}
                                        alt={data.title || "Banner preview"}
                                        className="size-full object-cover"
                                    />
                                ) : (
                                    <span className="flex flex-col items-center gap-2 px-4 text-center">
                                        <span className="flex size-11 items-center justify-center rounded-full border bg-background">
                                            <ImagePlus className="size-5 text-muted-foreground" />
                                        </span>
                                        <span className="text-sm font-medium text-foreground">
                                            Drop a banner image here
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            or click to browse files
                                        </span>
                                    </span>
                                )}
                            </Label>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div className="min-w-0 space-y-1">
                                    {data.image && (
                                        <p className="truncate text-xs text-muted-foreground">
                                            <span className="font-medium text-foreground">
                                                {data.image.name}
                                            </span>
                                        </p>
                                    )}
                                    {banner && !imagePreview &&
                                        (banner.image_url ? (
                                            <p className="text-xs text-muted-foreground">
                                                Leave empty to keep the current
                                                image.
                                            </p>
                                        ) : (
                                            <p className="text-xs text-muted-foreground">
                                                An image is required for this
                                                banner.
                                            </p>
                                        ))}
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={openPicker}
                                    >
                                        <Upload />
                                        {imagePreview || banner?.image_url
                                            ? "Replace"
                                            : "Choose image"}
                                    </Button>
                                    {imagePreview && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={clearSelectedImage}
                                        >
                                            <X />
                                            Remove
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Field>

                    <div className="flex items-center gap-2 rounded-md border p-4">
                        <Checkbox
                            id="banner-active"
                            checked={data.is_active}
                            onCheckedChange={(checked) =>
                                setData("is_active", checked === true)
                            }
                        />
                        <Label
                            htmlFor="banner-active"
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
                            {banner ? "Save changes" : "Create banner"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
