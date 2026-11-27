import { Head, Link } from "@inertiajs/react";
import { ImageIcon, Pencil, Plus } from "lucide-react";
import { useState, type ReactNode } from "react";
import { BackButton } from "@/components/admin/back-button";
import { AdminProductPrice } from "@/components/admin/products/admin-product-price";
import { ProductFormDialog } from "@/components/admin/products/product-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { availabilityLabel } from "@/lib/admin-products";
import admin from "@/routes/admin";
import type {
    AdminProductDetail,
    ProductCategory,
} from "@/types/admin-products";

function Detail({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="grid gap-1">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="min-w-0 text-sm font-medium">{value}</dd>
        </div>
    );
}

function ProductBadges({ product }: { product: AdminProductDetail }) {
    return (
        <div className="flex flex-wrap gap-1.5">
            <Badge variant={product.is_active ? "default" : "secondary"}>
                {product.is_active ? "Active" : "Inactive"}
            </Badge>
            {product.is_featured && <Badge variant="outline">Featured</Badge>}
            <Badge variant={product.stock === 0 ? "destructive" : "secondary"}>
                {availabilityLabel(product.availability_status)}
            </Badge>
        </div>
    );
}

export default function ProductShow({
    product,
    categories = [],
}: {
    product: AdminProductDetail;
    categories?: ProductCategory[];
}) {
    const [editing, setEditing] = useState(false);
    const images = product.images ?? [];

    const policies = [
        { label: "Shipping", value: product.shipping_information },
        { label: "Returns", value: product.return_policy },
        { label: "Warranty", value: product.warranty_information },
    ].filter((item) => item.value);

    return (
        <>
            <Head title={product.title} />

            <div className="w-full space-y-5">
                <header className="flex flex-col gap-4 border-b pb-5 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                        <BackButton className="mt-0.5" />
                        <div className="min-w-0 space-y-2">
                            <div className="space-y-0.5">
                                <h1 className="text-xl font-semibold tracking-tight">
                                    {product.title}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    SKU {product.sku} ·{" "}
                                    {product.category?.name ?? "Uncategorised"}
                                </p>
                            </div>
                            <ProductBadges product={product} />
                        </div>
                    </div>
                    <Button
                        id="edit-product"
                        onClick={() => setEditing(true)}
                        className="w-full sm:w-auto"
                    >
                        <Pencil />
                        Edit product
                    </Button>
                </header>

                <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
                    <div className="flex flex-col gap-2">
                        <Card
                            id="product-gallery"
                            className="gap-0 overflow-hidden py-0 lg:col-start-1 lg:row-start-1 "
                        >
                            <CardHeader className="flex flex-row items-center justify-between gap-4 border-b px-5 py-4">
                                <div className="space-y-1">
                                    <CardTitle className="text-base">
                                        Gallery
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground">
                                        Storefront imagery for this product
                                    </p>
                                </div>
                                <Badge
                                    variant="secondary"
                                    className="tabular-nums"
                                >
                                    {images.length}{" "}
                                    {images.length === 1 ? "image" : "images"}
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-4 sm:p-5">
                                {images.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                        {images.map((image, index) => (
                                            <figure
                                                key={image.uuid}
                                                className="overflow-hidden rounded-lg border bg-muted/30"
                                            >
                                                <div className="relative aspect-square overflow-hidden">
                                                    <img
                                                        src={
                                                            image.url ??
                                                            undefined
                                                        }
                                                        alt={
                                                            image.alt ??
                                                            product.title
                                                        }
                                                        width={400}
                                                        height={400}
                                                        loading={
                                                            index === 0
                                                                ? "eager"
                                                                : "lazy"
                                                        }
                                                        decoding="async"
                                                        className="size-full object-cover"
                                                    />
                                                    <span
                                                        aria-hidden="true"
                                                        className="absolute top-2 left-2 rounded-md border bg-background/90 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground tabular-nums"
                                                    >
                                                        {String(
                                                            index + 1,
                                                        ).padStart(2, "0")}
                                                    </span>
                                                </div>
                                            </figure>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex min-h-72 flex-col items-center justify-center gap-4 rounded-lg border border-dashed bg-muted/30 p-6 text-center">
                                        <div className="flex size-11 items-center justify-center rounded-lg border bg-background">
                                            <ImageIcon className="size-5 text-muted-foreground" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">
                                                No gallery images yet
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Add images so shoppers can see
                                                the product from every angle.
                                            </p>
                                        </div>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setEditing(true)}
                                        >
                                            <Plus />
                                            Add images
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Card className="gap-0 py-0 lg:col-start-1 lg:row-start-2">
                            <CardHeader className="border-b px-5 py-4">
                                <CardTitle className="text-base">
                                    Description
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-5">
                                <p className="max-w-prose text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                                    {product.description ||
                                        "No description has been added yet."}
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="gap-0 py-0 lg:col-start-2 lg:row-start-1 ">
                        <CardHeader className="border-b px-5 py-4">
                            <CardTitle className="text-base">
                                Product record
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-5 p-5 ">
                            <div className="space-y-3">
                                {product.thumbnail_url ? (
                                    <img
                                        src={product.thumbnail_url}
                                        alt={`${product.title} thumbnail`}
                                        width={320}
                                        height={320}
                                        className="aspect-square w-full rounded-md border object-cover"
                                    />
                                ) : (
                                    <div className="flex aspect-square items-center justify-center rounded-md border border-dashed bg-muted/40">
                                        <div className="space-y-1 text-center">
                                            <ImageIcon className="mx-auto size-6 text-muted-foreground" />
                                            <p className="text-xs text-muted-foreground">
                                                No thumbnail
                                            </p>
                                        </div>
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="text-sm font-medium">
                                        Thumbnail
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        List and search preview
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <section className="space-y-3">
                                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    Commerce
                                </h3>
                                <dl className="space-y-3">
                                    <Detail
                                        label="Price"
                                        value={
                                            <AdminProductPrice
                                                product={product}
                                                showCurrencyLabel
                                            />
                                        }
                                    />
                                    <Detail
                                        label="Stock"
                                        value={
                                            <span className="tabular-nums">
                                                {product.stock} units · minimum
                                                order{" "}
                                                {product.minimum_order_quantity}
                                            </span>
                                        }
                                    />
                                    <Detail
                                        label="Rating"
                                        value={product.rating.toFixed(1)}
                                    />
                                </dl>
                            </section>

                            <Separator />

                            <section className="space-y-3">
                                <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                    Catalogue
                                </h3>
                                <dl className="space-y-3">
                                    <Detail
                                        label="Brand"
                                        value={product.brand ?? "Not set"}
                                    />
                                    <Detail
                                        label="Category"
                                        value={
                                            product.category?.name ??
                                            "Uncategorised"
                                        }
                                    />
                                </dl>
                            </section>

                            {policies.length > 0 && (
                                <>
                                    <Separator />
                                    <section className="space-y-3">
                                        <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                                            Policies
                                        </h3>
                                        <dl className="space-y-3">
                                            {policies.map((item) => (
                                                <Detail
                                                    key={item.label}
                                                    label={item.label}
                                                    value={item.value}
                                                />
                                            ))}
                                        </dl>
                                    </section>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <ProductFormDialog
                open={editing}
                onOpenChange={setEditing}
                product={product}
                categories={categories}
            />
        </>
    );
}

ProductShow.layout = {
    breadcrumbs: [
        {
            title: "Product",
            href: admin.productsIndex().url,
        },
        {
            title: "Show",
            href: "#",
        },
    ],
};
