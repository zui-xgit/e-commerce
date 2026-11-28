import { Head, Link } from "@inertiajs/react";
import { ImageIcon, Pencil, Plus, Tags } from "lucide-react";
import { useState, type ReactNode } from "react";
import { BackButton } from "@/components/admin/back-button";
import { CategoryFormDialog } from "@/components/admin/categories/category-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { formatProductPrice } from "@/lib/admin-products";
import admin from "@/routes/admin";
import type { AdminCategoryDetail } from "@/types/admin-categories";
import { useSiteSettings } from "@/hooks/use-site-settings";
import Heading from "@/components/heading";

type CategoryProduct = AdminCategoryDetail["products"][number];

function Detail({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="grid min-w-0 gap-1 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4">
            <dt className="text-xs text-muted-foreground sm:text-sm">
                {label}
            </dt>
            <dd className="min-w-0 text-sm font-medium break-words">{value}</dd>
        </div>
    );
}

function ProductThumbnail({ product }: { product: CategoryProduct }) {
    return (
        <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/50 lg:size-9">
            {product.thumbnail_url ? (
                <img
                    src={product.thumbnail_url}
                    alt=""
                    width={40}
                    height={40}
                    loading="lazy"
                    className="size-full object-cover"
                />
            ) : (
                <Tags className="size-4 text-muted-foreground" />
            )}
        </div>
    );
}

function ProductRow({
    product,
    currency,
}: {
    product: CategoryProduct;
    currency: ReturnType<typeof useSiteSettings>["currency"];
}) {
    return (
        <Link
            href={admin.products.show(product.uuid).url}
            className="flex min-w-0 items-start gap-3 px-4 py-4 transition-colors hover:bg-muted/40 focus-visible:bg-muted/40"
        >
            <ProductThumbnail product={product} />
            <div className="min-w-0 flex-1 space-y-2">
                <div className="flex min-w-0 items-start justify-between gap-3">
                    <p className="min-w-0 break-words text-sm font-medium leading-snug">
                        {product.title}
                    </p>
                    <p className="shrink-0 text-right text-sm font-semibold tabular-nums">
                        {formatProductPrice(product.price, currency)}
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="tabular-nums">{product.sku}</span>
                    <span className="tabular-nums">
                        {product.stock} in stock
                    </span>
                </div>
                <Badge
                    variant={product.is_active ? "default" : "secondary"}
                    className="text-xs"
                >
                    {product.is_active ? "Active" : "Inactive"}
                </Badge>
            </div>
        </Link>
    );
}

export default function CategoryShow({
    category,
}: {
    category: AdminCategoryDetail;
}) {
    const [editing, setEditing] = useState(false);
    const currency = useSiteSettings().currency;

    return (
        <>
            <Head title={category.name} />

            <div className="w-full min-w-0 space-y-4">
                <header className="flex min-w-0 flex-col gap-4 border-b pb-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                        <BackButton className="mt-0.5 shrink-0" />
                        <Heading
                            title={category.name}
                            description={`${category.products_count} ${category.products_count === 1 ? "product" : "products"} in this category`}
                        />
                    </div>
                    <Button
                        onClick={() => setEditing(true)}
                        className="w-full shrink-0 sm:w-auto"
                    >
                        <Pencil />
                        Edit category
                    </Button>
                </header>

                <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <Card className="min-w-0 gap-0 py-0 lg:col-start-1 lg:row-start-1">
                        <CardHeader className="border-b px-4 py-4 sm:px-6">
                            <CardTitle className="text-base">
                                Category details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 py-4 sm:px-6 sm:py-5">
                            <dl className="space-y-4">
                                <Detail
                                    label="Status"
                                    value={
                                        <Badge
                                            variant={
                                                category.is_active
                                                    ? "default"
                                                    : "secondary"
                                            }
                                        >
                                            {category.is_active
                                                ? "Active"
                                                : "Inactive"}
                                        </Badge>
                                    }
                                />
                                <Detail
                                    label="Sort order"
                                    value={
                                        <span className="tabular-nums">
                                            {category.sort_order}
                                        </span>
                                    }
                                />
                                <Detail
                                    label="Created"
                                    value={category.created_at ?? "—"}
                                />
                            </dl>
                        </CardContent>
                    </Card>

                    <Card className="min-w-0 gap-0 overflow-hidden py-0 lg:col-start-2 lg:row-span-2 lg:row-start-1">
                        <CardHeader className="border-b px-4 py-4 sm:px-6">
                            <CardTitle className="text-base">
                                Thumbnail
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-4 py-4 sm:px-6 sm:py-5">
                            <div className="mx-auto w-full max-w-sm lg:max-w-none">
                                {category.thumbnail_url ? (
                                    <img
                                        src={category.thumbnail_url}
                                        alt={category.name}
                                        width={320}
                                        height={320}
                                        className="aspect-[16/9] w-full rounded-md border object-cover sm:aspect-[3/2] lg:aspect-square"
                                    />
                                ) : (
                                    <div className="flex aspect-[16/9] items-center justify-center rounded-md border border-dashed bg-muted/40 sm:aspect-[3/2] lg:aspect-square">
                                        <div className="space-y-1 text-center">
                                            <ImageIcon className="mx-auto size-6 text-muted-foreground" />
                                            <p className="text-xs text-muted-foreground">
                                                No thumbnail
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="min-w-0 gap-0 overflow-hidden py-0 lg:col-start-1 lg:row-start-2">
                        <CardHeader className="flex flex-row items-center justify-between gap-3 border-b px-4 py-4 sm:px-6">
                            <CardTitle className="text-base">
                                Products
                            </CardTitle>
                            <Badge
                                variant="secondary"
                                className="shrink-0 tabular-nums"
                            >
                                {category.products.length}
                            </Badge>
                        </CardHeader>
                        {category.products.length === 0 ? (
                            <CardContent className="flex flex-col items-center gap-3 px-4 py-10 text-center sm:py-12">
                                <div className="flex size-11 items-center justify-center rounded-full bg-muted">
                                    <Tags className="size-5 text-muted-foreground" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">
                                        No products in this category
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Add products and assign them to this
                                        category to see them here.
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    asChild
                                    className="w-full sm:w-auto"
                                >
                                    <Link href={admin.products.index().url}>
                                        <Plus />
                                        Go to products
                                    </Link>
                                </Button>
                            </CardContent>
                        ) : (
                            <>
                                <ul className="divide-y lg:hidden">
                                    {category.products.map((product) => (
                                        <li key={product.uuid}>
                                            <ProductRow
                                                product={product}
                                                currency={currency}
                                            />
                                        </li>
                                    ))}
                                </ul>

                                <div className="hidden lg:block">
                                    <Table className="min-w-[640px] [&_td]:py-3 [&_th]:h-12">
                                        <TableHeader>
                                            <TableRow className="bg-muted/40 hover:bg-muted/40">
                                                <TableHead className="pl-4 sm:pl-6">
                                                    Product
                                                </TableHead>
                                                <TableHead>SKU</TableHead>
                                                <TableHead className="text-right">
                                                    Price
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Stock
                                                </TableHead>
                                                <TableHead className="pr-4 sm:pr-6">
                                                    Status
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {category.products.map(
                                                (product) => (
                                                    <TableRow
                                                        key={product.uuid}
                                                    >
                                                        <TableCell className="pl-4 sm:pl-6">
                                                            <Link
                                                                href={
                                                                    admin.products.show(
                                                                        product.uuid,
                                                                    ).url
                                                                }
                                                                className="flex items-center gap-3 hover:underline"
                                                            >
                                                                <ProductThumbnail
                                                                    product={
                                                                        product
                                                                    }
                                                                />
                                                                <span className="max-w-56 truncate font-medium">
                                                                    {
                                                                        product.title
                                                                    }
                                                                </span>
                                                            </Link>
                                                        </TableCell>
                                                        <TableCell className="text-muted-foreground tabular-nums">
                                                            {product.sku}
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums">
                                                            {formatProductPrice(
                                                                product.price,
                                                                currency,
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right tabular-nums">
                                                            {product.stock}
                                                        </TableCell>
                                                        <TableCell className="pr-4 sm:pr-6">
                                                            <Badge
                                                                variant={
                                                                    product.is_active
                                                                        ? "default"
                                                                        : "secondary"
                                                                }
                                                            >
                                                                {product.is_active
                                                                    ? "Active"
                                                                    : "Inactive"}
                                                            </Badge>
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </>
                        )}
                    </Card>
                </div>
            </div>

            <CategoryFormDialog
                open={editing}
                onOpenChange={setEditing}
                category={category}
            />
        </>
    );
}

CategoryShow.layout = {
    breadcrumbs: [
        {
            title: "Categories",
            href: admin.categories.index().url,
        },
        {
            title: "Category",
            href: "#",
        },
    ],
};
