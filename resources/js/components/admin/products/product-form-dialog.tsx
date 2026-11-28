import { useForm } from "@inertiajs/react";
import {
    ArrowLeft,
    ArrowRight,
    ImagePlus,
    LoaderCircle,
    Trash2,
    X,
} from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import admin from "@/routes/admin";
import type {
    AdminProduct,
    AdminProductImage,
    ProductCategory,
} from "@/types/admin-products";

type ProductFormValues = {
    category_uuid: string;
    title: string;
    description: string;
    price: string;
    discount_percentage: string;
    rating: string;
    brand: string;
    sku: string;
    thumbnail: File | null;
    clear_thumbnail: boolean;
    minimum_order_quantity: string;
    shipping_information: string;
    return_policy: string;
    warranty_information: string;
    stock: string;
    is_active: boolean;
    is_featured: boolean;
    images: File[];
    existing_images: AdminProductImage[];
    removed_images: string[];
    image_order: string[];
};

type GalleryPreview = {
    key: string;
    url: string;
    name: string;
};

function emptyForm(): ProductFormValues {
    return {
        category_uuid: "",
        title: "",
        description: "",
        price: "",
        discount_percentage: "0",
        rating: "0",
        brand: "",
        sku: "",
        thumbnail: null,
        clear_thumbnail: false,
        minimum_order_quantity: "1",
        shipping_information: "",
        return_policy: "",
        warranty_information: "",
        stock: "0",
        is_active: true,
        is_featured: false,
        images: [],
        existing_images: [],
        removed_images: [],
        image_order: [],
    };
}

function formFromProduct(product: AdminProduct | null): ProductFormValues {
    if (!product) {
        return emptyForm();
    }

    return {
        ...emptyForm(),
        category_uuid: product.category ? product.category.uuid : "",
        title: product.title,
        description: product.description ?? "",
        price: String(product.price),
        discount_percentage: String(product.discount_percentage ?? 0),
        rating: String(product.rating ?? 0),
        brand: product.brand ?? "",
        sku: product.sku,
        minimum_order_quantity: String(product.minimum_order_quantity),
        shipping_information: product.shipping_information ?? "",
        return_policy: product.return_policy ?? "",
        warranty_information: product.warranty_information ?? "",
        stock: String(product.stock),
        is_active: product.is_active,
        is_featured: product.is_featured,
        existing_images: product.images ?? [],
        image_order: (product.images ?? []).map((image) => image.uuid),
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

export function ProductFormDialog({
    open,
    onOpenChange,
    product,
    categories,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    product: AdminProduct | null;
    categories: ProductCategory[];
}) {
    const {
        data,
        setData,
        errors,
        post,
        put,
        processing,
        reset: resetForm,
    } = useForm<ProductFormValues>(emptyForm());

    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(
        null,
    );
    const [galleryPreviews, setGalleryPreviews] = useState<GalleryPreview[]>(
        [],
    );
    const objectUrls = useRef<string[]>([]);

    useEffect(() => {
        if (!open) {
            return;
        }

        resetForm();
        setData(formFromProduct(product));
        setThumbnailPreview(null);
        setGalleryPreviews([]);
    }, [open, product, resetForm, setData]);

    useEffect(
        () => () => {
            objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
            objectUrls.current = [];
        },
        [],
    );

    const close = (nextOpen: boolean) => {
        if (!nextOpen) {
            objectUrls.current.forEach((url) => URL.revokeObjectURL(url));
            objectUrls.current = [];
            setThumbnailPreview(null);
            setGalleryPreviews([]);
        }

        onOpenChange(nextOpen);
    };

    const handleThumbnail = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;

        if (thumbnailPreview) {
            URL.revokeObjectURL(thumbnailPreview);
            objectUrls.current = objectUrls.current.filter(
                (url) => url !== thumbnailPreview,
            );
        }

        if (file) {
            const url = URL.createObjectURL(file);
            objectUrls.current.push(url);
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

    const handleGallery = (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        const available = 8 - data.existing_images.length - data.images.length;

        if (available <= 0) {
            event.target.value = "";
            return;
        }

        const accepted = files.slice(0, available);

        accepted.forEach((file) => {
            const url = URL.createObjectURL(file);
            objectUrls.current.push(url);
        });

        setGalleryPreviews((current) => [
            ...current,
            ...accepted.map((file, index) => ({
                key: `new-${Date.now()}-${index}`,
                url: objectUrls.current[
                    objectUrls.current.length - accepted.length + index
                ],
                name: file.name,
            })),
        ]);
        setData("images", [...data.images, ...accepted]);
        event.target.value = "";
    };

    const removeNewImage = (index: number) => {
        const preview = galleryPreviews[index];

        if (preview) {
            URL.revokeObjectURL(preview.url);
            objectUrls.current = objectUrls.current.filter(
                (url) => url !== preview.url,
            );
        }

        setGalleryPreviews((current) => current.filter((_, i) => i !== index));
        setData(
            "images",
            data.images.filter((_, i) => i !== index),
        );
    };

    const removeExistingImage = (imageUuid: string) => {
        setData((current) => {
            const remaining = current.existing_images.filter(
                (image) => image.uuid !== imageUuid,
            );

            return {
                ...current,
                existing_images: remaining,
                removed_images: [...current.removed_images, imageUuid],
                image_order: remaining.map((image) => image.uuid),
            };
        });
    };

    const moveImage = (index: number, direction: -1 | 1) => {
        setData((current) => {
            const next = [...current.existing_images];
            const target = index + direction;

            if (target < 0 || target >= next.length) {
                return current;
            }

            [next[index], next[target]] = [next[target], next[index]];

            return {
                ...current,
                existing_images: next,
                image_order: next.map((image) => image.uuid),
            };
        });
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const options = {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => close(false),
        };

        if (product) {
            put(admin.products.update(product.uuid).url, options);
        } else {
            post(admin.products.store().url, options);
        }
    };

    const thumbnailSource =
        thumbnailPreview ??
        (data.clear_thumbnail ? null : (product?.thumbnail_url ?? null));
    const galleryFull = data.existing_images.length + data.images.length >= 8;

    const errorEntries = Object.entries(errors).filter(([, message]) =>
        Boolean(message),
    );
    const errorSummary =
        errorEntries.length > 0
            ? `${errorEntries.length} field${errorEntries.length === 1 ? "" : "s"} need${errorEntries.length === 1 ? "s" : ""} attention.`
            : null;

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent
                className="flex max-h-[92vh] w-[calc(100vw-2rem)] flex-col overflow-hidden sm:max-w-4xl"
                onInteractOutside={(e) => e.preventDefault()}
            >
                <DialogHeader className="shrink-0">
                    <DialogTitle className="text-xl">
                        {product ? "Edit product" : "Add product"}
                    </DialogTitle>
                    <DialogDescription>
                        {product
                            ? "Update product details, pricing, media, and policies."
                            : "Fill in all product details below. Use the sections to navigate, then save when you’re ready."}
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={submit}
                    className="flex min-h-0 flex-1 flex-col"
                    noValidate
                >
                    <div className="min-h-0 flex-1 overflow-y-auto px-1 py-2">
                        <div className="space-y-8">
                            <section className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">
                                        Details
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Basic product info shown in the catalog.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2">
                                    <Field
                                        label="Product name"
                                        htmlFor="product-title"
                                        error={errors.title}
                                        className="sm:col-span-2"
                                    >
                                        <Input
                                            id="product-title"
                                            value={data.title}
                                            placeholder="e.g. Everyday canvas tote"
                                            onChange={(event) =>
                                                setData(
                                                    "title",
                                                    event.target.value,
                                                )
                                            }
                                            aria-invalid={Boolean(errors.title)}
                                        />
                                    </Field>

                                    <Field
                                        label="Category"
                                        htmlFor="product-category"
                                        error={errors.category_uuid}
                                        hint={
                                            categories.length === 0
                                                ? "No active categories yet. Add one before publishing."
                                                : undefined
                                        }
                                    >
                                        <Select
                                            value={data.category_uuid}
                                            onValueChange={(value: string) =>
                                                setData("category_uuid", value)
                                            }
                                        >
                                            <SelectTrigger
                                                id="product-category"
                                                className="w-full"
                                            >
                                                <SelectValue placeholder="Select a category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map((category) => (
                                                    <SelectItem
                                                        key={category.uuid}
                                                        value={category.uuid}
                                                    >
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </Field>

                                    <Field
                                        label="Brand - (Optional)"
                                        htmlFor="product-brand"
                                        error={errors.brand}
                                    >
                                        <Input
                                            id="product-brand"
                                            value={data.brand}
                                            placeholder="Optional"
                                            onChange={(event) =>
                                                setData(
                                                    "brand",
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>

                                    <Field
                                        label="SKU - (Stock Keeping Unit)"
                                        htmlFor="product-sku"
                                        error={errors.sku}
                                        hint="Stock Keeping Unit — your internal product code (e.g. NK-AM90-BLK-42)"
                                    >
                                        <Input
                                            id="product-sku"
                                            value={data.sku}
                                            placeholder="TOTE-001"
                                            onChange={(event) =>
                                                setData(
                                                    "sku",
                                                    event.target.value,
                                                )
                                            }
                                            aria-invalid={Boolean(errors.sku)}
                                        />
                                    </Field>

                                    <Field
                                        label="Description - (Optional)"
                                        htmlFor="product-description"
                                        error={errors.description}
                                        className="sm:col-span-2"
                                    >
                                        <Textarea
                                            id="product-description"
                                            rows={4}
                                            value={data.description}
                                            placeholder="What should a customer know before buying?"
                                            onChange={(event) =>
                                                setData(
                                                    "description",
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                </div>

                                <div className="flex flex-col space-y-10 rounded-md border p-4 ">
                                    <label
                                        htmlFor="product-active"
                                        className="flex cursor-pointer items-center gap-2"
                                    >
                                        <Checkbox
                                            id="product-active"
                                            checked={data.is_active}
                                            onCheckedChange={(
                                                checked:
                                                    | boolean
                                                    | "indeterminate",
                                            ) =>
                                                setData(
                                                    "is_active",
                                                    checked === true,
                                                )
                                            }
                                        />
                                        <span className="text-sm font-medium leading-none">
                                            Active in storefront
                                        </span>
                                    </label>

                                    <div className=" flex flex-col gap-2">
                                        <label
                                            htmlFor="product-featured"
                                            className="flex cursor-pointer items-center gap-2"
                                        >
                                            <Checkbox
                                                id="product-featured"
                                                checked={data.is_featured}
                                                onCheckedChange={(
                                                    checked:
                                                        | boolean
                                                        | "indeterminate",
                                                ) =>
                                                    setData(
                                                        "is_featured",
                                                        checked === true,
                                                    )
                                                }
                                            />
                                            <span className="text-sm font-medium leading-none">
                                                Featured product
                                            </span>
                                        </label>
                                        <p className="text-xs text-muted-foreground">
                                            Highlight this product on the
                                            homepage and in promotional
                                            sections.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4 border-t pt-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">
                                        Pricing & stock
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Control price and inventory.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    <Field
                                        label="Price (TZS)"
                                        htmlFor="product-price"
                                        error={errors.price}
                                    >
                                        <Input
                                            id="product-price"
                                            inputMode="numeric"
                                            value={data.price}
                                            placeholder="0"
                                            onChange={(event) =>
                                                setData(
                                                    "price",
                                                    event.target.value,
                                                )
                                            }
                                            aria-invalid={Boolean(errors.price)}
                                        />
                                    </Field>

                                    <Field
                                        label="Discount (%)"
                                        htmlFor="product-discount"
                                        error={errors.discount_percentage}
                                    >
                                        <Input
                                            id="product-discount"
                                            inputMode="decimal"
                                            value={data.discount_percentage}
                                            onChange={(event) =>
                                                setData(
                                                    "discount_percentage",
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                    <Field
                                        label="Rating"
                                        htmlFor="product-rating"
                                        error={errors.rating}
                                        hint="0–5, updated from reviews."
                                    >
                                        <Input
                                            id="product-rating"
                                            inputMode="decimal"
                                            value={data.rating}
                                            onChange={(event) =>
                                                setData(
                                                    "rating",
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                    <Field
                                        label="Stock"
                                        htmlFor="product-stock"
                                        error={errors.stock}
                                    >
                                        <Input
                                            id="product-stock"
                                            inputMode="numeric"
                                            value={data.stock}
                                            onChange={(event) =>
                                                setData(
                                                    "stock",
                                                    event.target.value,
                                                )
                                            }
                                            aria-invalid={Boolean(errors.stock)}
                                        />
                                    </Field>
                                    <Field
                                        label="Minimum order quantity"
                                        htmlFor="product-moq"
                                        error={errors.minimum_order_quantity}
                                    >
                                        <Input
                                            id="product-moq"
                                            inputMode="numeric"
                                            value={data.minimum_order_quantity}
                                            onChange={(event) =>
                                                setData(
                                                    "minimum_order_quantity",
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                </div>
                            </section>

                            <section className="space-y-4 border-t pt-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">
                                        Media
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Thumbnail and gallery images for this
                                        product.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 items-start gap-4">
                                    <Field
                                        label="Thumbnail"
                                        htmlFor="product-thumbnail"
                                        error={errors.thumbnail}
                                        hint="A single image shown in catalogue tables and storefront cards."
                                    >
                                        <div className="grid grid-cols-1 gap-4 rounded-md border border-dashed p-4 sm:grid-cols-[10rem_minmax(0,1fr)] sm:items-center">
                                            <div className="flex aspect-square w-full max-w-40 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/50 sm:w-40">
                                                {thumbnailSource ? (
                                                    <img
                                                        src={thumbnailSource}
                                                        alt="Thumbnail preview"
                                                        className="size-full object-cover"
                                                    />
                                                ) : (
                                                    <ImagePlus className="size-8 text-muted-foreground" />
                                                )}
                                            </div>
                                            <div className="min-w-0 space-y-2">
                                                <Input
                                                    id="product-thumbnail"
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleThumbnail}
                                                    className="h-auto cursor-pointer py-2"
                                                />
                                                {product?.thumbnail_url &&
                                                    !thumbnailPreview &&
                                                    !data.clear_thumbnail && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                setData(
                                                                    "clear_thumbnail",
                                                                    true,
                                                                )
                                                            }
                                                        >
                                                            <X />
                                                            Remove thumbnail
                                                        </Button>
                                                    )}
                                            </div>
                                        </div>
                                    </Field>
                                    <Field
                                        label="Gallery"
                                        htmlFor="product-gallery"
                                        error={
                                            errors.images ||
                                            (Array.isArray(errors.images)
                                                ? errors.images[0]
                                                : undefined)
                                        }
                                        hint="Up to 8 images. Existing images keep their position unless you reorder them."
                                    >
                                        <Input
                                            id="product-gallery"
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleGallery}
                                            disabled={galleryFull}
                                            className="h-auto cursor-pointer py-2"
                                        />
                                    </Field>
                                </div>

                                {(data.existing_images.length > 0 ||
                                    galleryPreviews.length > 0) && (
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        {data.existing_images.map(
                                            (image, index) => (
                                                <div
                                                    key={image.uuid}
                                                    className="group relative overflow-hidden rounded-md border"
                                                >
                                                    {image.url ? (
                                                        <img
                                                            src={image.url}
                                                            alt={
                                                                image.alt ??
                                                                product?.title ??
                                                                ""
                                                            }
                                                            className="aspect-square w-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="flex aspect-square items-center justify-center bg-muted">
                                                            <ImagePlus className="size-5 text-muted-foreground" />
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-background/90 p-1">
                                                        <span className="px-1 text-[11px] text-muted-foreground tabular-nums">
                                                            {index + 1}
                                                        </span>
                                                        <div className="flex items-center">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-7"
                                                                disabled={
                                                                    index === 0
                                                                }
                                                                aria-label="Move image earlier"
                                                                onClick={() =>
                                                                    moveImage(
                                                                        index,
                                                                        -1,
                                                                    )
                                                                }
                                                            >
                                                                <ArrowLeft />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-7"
                                                                disabled={
                                                                    index ===
                                                                    data
                                                                        .existing_images
                                                                        .length -
                                                                        1
                                                                }
                                                                aria-label="Move image later"
                                                                onClick={() =>
                                                                    moveImage(
                                                                        index,
                                                                        1,
                                                                    )
                                                                }
                                                            >
                                                                <ArrowRight />
                                                            </Button>
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                className="size-7 text-destructive"
                                                                aria-label="Remove image"
                                                                onClick={() =>
                                                                    removeExistingImage(
                                                                        image.uuid,
                                                                    )
                                                                }
                                                            >
                                                                <Trash2 />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ),
                                        )}

                                        {galleryPreviews.map(
                                            (preview, index) => (
                                                <div
                                                    key={preview.key}
                                                    className="relative overflow-hidden rounded-md border"
                                                >
                                                    <img
                                                        src={preview.url}
                                                        alt={preview.name}
                                                        className="aspect-square w-full object-cover"
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="absolute top-1 right-1 size-7 bg-background/90 text-destructive"
                                                        aria-label={`Remove ${preview.name}`}
                                                        onClick={() =>
                                                            removeNewImage(
                                                                index,
                                                            )
                                                        }
                                                    >
                                                        <Trash2 />
                                                    </Button>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                )}
                            </section>

                            <section className="space-y-4 border-t pt-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-foreground">
                                        Policies
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Shipping, returns, and warranty details.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 items-start gap-4">
                                    <Field
                                        label="Shipping information - (Optional)"
                                        htmlFor="product-shipping"
                                        error={errors.shipping_information}
                                    >
                                        <Textarea
                                            id="product-shipping"
                                            rows={3}
                                            value={data.shipping_information}
                                            placeholder="Delivery times or handling notes"
                                            onChange={(event) =>
                                                setData(
                                                    "shipping_information",
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                    <Field
                                        label="Return policy - (Optional)"
                                        htmlFor="product-return"
                                        error={errors.return_policy}
                                    >
                                        <Textarea
                                            id="product-return"
                                            rows={3}
                                            value={data.return_policy}
                                            placeholder="Returns and exchange terms"
                                            onChange={(event) =>
                                                setData(
                                                    "return_policy",
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                    <Field
                                        label="Warranty information - (Optional)"
                                        htmlFor="product-warranty"
                                        error={errors.warranty_information}
                                    >
                                        <Textarea
                                            id="product-warranty"
                                            rows={3}
                                            value={data.warranty_information}
                                            placeholder="Warranty duration or coverage"
                                            onChange={(event) =>
                                                setData(
                                                    "warranty_information",
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </Field>
                                </div>
                            </section>
                        </div>
                    </div>

                    <DialogFooter className="shrink-0 border-t pt-4">
                        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0 text-sm">
                                {errorSummary && (
                                    <p
                                        className=" text-red-600 dark:text-red-400"
                                        role="alert"
                                    >
                                        {errorSummary} Scroll up to review
                                        highlighted fields.
                                    </p>
                                )}
                            </div>
                            <div className="flex shrink-0 justify-end gap-2">
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
                                    {product
                                        ? "Save changes"
                                        : "Create product"}
                                </Button>
                            </div>
                        </div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
