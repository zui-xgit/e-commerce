import { Head, Link } from "@inertiajs/react";
import { ImageIcon, Pencil, Plus, Tags } from "lucide-react";
import { useState, type ReactNode } from "react";
import { CategoryFormDialog } from "@/components/admin/categories/category-form-dialog";
import Heading from "@/components/heading";
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
import { BackButton } from "@/components/admin/back-button";
import { useSiteSettings } from "@/hooks/use-site-settings";

function Detail({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="grid gap-1 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="min-w-0 text-sm font-medium">{value}</dd>
        </div>
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

            <div className=" w-full space-y-4">
                <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <BackButton className="mt-0.5" />
                        <Heading
                            title={category.name}
                            description={`${category.products_count} ${category.products_count === 1 ? "product" : "products"} in this category`}
                        />
                    </div>
                    <Button
                        onClick={() => setEditing(true)}
                        className="w-full sm:w-auto"
                    >
                        <Pencil />
                        Edit category
                    </Button>
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="space-y-4">
                        <Card className="gap-0 py-0">
                            <CardHeader className="border-b px-6 py-4">
                                <CardTitle className="text-base">
                                    Category details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="px-6 py-5">
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

                        <Card className="gap-0 overflow-hidden py-0">
                            <CardHeader className="border-b px-6 py-4">
                                <CardTitle className="text-base">
                                    Products
                                </CardTitle>
                            </CardHeader>
                            {category.products.length === 0 ? (
                                <CardContent className="flex flex-col items-center gap-3 px-6 py-12 text-center">
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
                                    <Button variant="outline" size="sm" asChild>
                                        <Link href={admin.products.index().url}>
                                            <Plus />
                                            Go to products
                                        </Link>
                                    </Button>
                                </CardContent>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                                            <TableHead className="pl-6">
                                                Product
                                            </TableHead>
                                            <TableHead>SKU</TableHead>
                                            <TableHead className="text-right">
                                                Price
                                            </TableHead>
                                            <TableHead className="text-right">
                                                Stock
                                            </TableHead>
                                            <TableHead className="pr-6">
                                                Status
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {category.products.map((product) => (
                                            <TableRow key={product.uuid}>
                                                <TableCell className="pl-6">
                                                    <Link
                                                        href={
                                                            admin.products.show(
                                                                product.uuid,
                                                            ).url
                                                        }
                                                        className="flex items-center gap-3 hover:underline"
                                                    >
                                                        <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/50">
                                                            {product.thumbnail_url ? (
                                                                <img
                                                                    src={
                                                                        product.thumbnail_url
                                                                    }
                                                                    alt=""
                                                                    width={36}
                                                                    height={36}
                                                                    loading="lazy"
                                                                    className="size-full object-cover"
                                                                />
                                                            ) : (
                                                                <Tags className="size-4 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                        <span className="max-w-56 truncate font-medium">
                                                            {product.title}
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
                                                <TableCell className="pr-6">
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
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </Card>
                    </div>

                    <Card className="gap-0 py-0 ">
                        <CardHeader className="border-b px-6 py-4">
                            <CardTitle className="text-base">
                                Thumbnail
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 py-5">
                            {category.thumbnail_url ? (
                                <img
                                    src={category.thumbnail_url}
                                    alt={category.name}
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
                        </CardContent>
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
            href: admin.dashboard().url,
        },
        {
            title: "Categories",
            href: admin.categories.index().url,
        },
    ],
};
