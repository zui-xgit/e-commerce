import { Head, router } from "@inertiajs/react";
import {
    Eye,
    MoreHorizontal,
    PackageOpen,
    Pencil,
    Plus,
    Trash2,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { AdminTableThumbnail } from "@/components/admin/admin-table-thumbnail";
import { AdminProductPrice } from "@/components/admin/products/admin-product-price";
import { ProductDeleteDialog } from "@/components/admin/products/product-delete-dialog";
import { ProductFiltersBar } from "@/components/admin/products/product-filters";
import { ProductFormDialog } from "@/components/admin/products/product-form-dialog";
import Heading from "@/components/heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { availabilityLabel } from "@/lib/admin-products";
import admin from "@/routes/admin";
import type {
    AdminProduct,
    ProductFilters,
    ProductsIndexProps,
} from "@/types/admin-products";

const EMPTY_FILTERS: ProductFilters = {
    search: "",
    category: "",
    status: "all",
    sort: "newest",
};

function StatusBadges({ product }: { product: AdminProduct }) {
    return (
        <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant={product.is_active ? "default" : "secondary"}>
                {product.is_active ? "Active" : "Inactive"}
            </Badge>
            {product.is_featured && <Badge variant="outline">Featured</Badge>}
            {product.stock === 0 && (
                <Badge variant="destructive">Out of stock</Badge>
            )}
        </div>
    );
}

export default function ProductsIndex({
    products,
    categories,
    filters,
    counts,
}: ProductsIndexProps) {
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<AdminProduct | null>(null);
    const [deleting, setDeleting] = useState<AdminProduct | null>(null);
    const [filtering, setFiltering] = useState(false);
    const filtersRef = useRef(filters);
    filtersRef.current = filters;

    const visitFilters = useCallback((next: ProductFilters) => {
        setFiltering(true);
        router.get(admin.products.index().url, next, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setFiltering(false),
        });
    }, []);

    const applyFilters = useCallback(
        (next: Partial<ProductFilters>) => {
            visitFilters({ ...filtersRef.current, ...next });
        },
        [visitFilters],
    );

    const resetFilters = useCallback(() => {
        visitFilters(EMPTY_FILTERS);
    }, [visitFilters]);

    const openCreate = () => {
        setEditing(null);
        setFormOpen(true);
    };

    const openEdit = (product: AdminProduct) => {
        setEditing(product);
        setFormOpen(true);
    };

    const goToPage = (url: string | null) => {
        if (!url) {
            return;
        }

        setFiltering(true);
        router.visit(url, {
            preserveState: true,
            preserveScroll: true,
            onFinish: () => setFiltering(false),
        });
    };

    const hasFilters = Boolean(
        filters.search ||
        filters.category ||
        filters.status !== "all" ||
        filters.sort !== "newest",
    );
    const from =
        products.total === 0
            ? 0
            : (products.current_page - 1) * products.per_page + 1;
    const to = Math.min(
        products.current_page * products.per_page,
        products.total,
    );

    return (
        <>
            <Head title="Products" />

            <div className="w-full space-y-4">
                <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title="Products"
                        description="Search, price and publish everything in your catalogue."
                    />
                    <Button
                        id="add-product-toolbar"
                        onClick={openCreate}
                        className="w-full sm:w-auto"
                    >
                        <Plus />
                        Add product
                    </Button>
                </div>

                <ProductFiltersBar
                    filters={filters}
                    categories={categories}
                    counts={counts}
                    total={products.total}
                    filtering={filtering}
                    onChange={applyFilters}
                    onReset={resetFilters}
                />

                {products.total === 0 && (
                    <Card className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                            <PackageOpen className="size-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-base font-semibold">
                                {hasFilters
                                    ? "No products match those filters"
                                    : "Your catalogue is empty"}
                            </h2>
                            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                                {hasFilters
                                    ? "Try a different search term or clear the filters to see the whole catalogue."
                                    : "Add your first product to start building the storefront catalogue."}
                            </p>
                        </div>
                        {hasFilters ? (
                            <Button variant="outline" onClick={resetFilters}>
                                Clear filters
                            </Button>
                        ) : (
                            <Button id="add-product-empty" onClick={openCreate}>
                                <Plus />
                                Add product
                            </Button>
                        )}
                    </Card>
                )}

                {products.total > 0 && (
                    <Card className="gap-0 overflow-hidden py-0">
                        <Table className="[&_td]:py-3 [&_th]:h-12">
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="min-w-64 pl-4">
                                        Product
                                    </TableHead>
                                    <TableHead>SKU</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">
                                        Price
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Stock
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="hidden xl:table-cell">
                                        Added
                                    </TableHead>
                                    <TableHead className="w-12 pr-4">
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.data.map((product, index) => (
                                    <TableRow
                                        key={index}
                                        onClick={() => {
                                            router.visit(
                                                admin.products.show(product.uuid)
                                                    .url,
                                            );
                                        }}
                                        className="cursor-pointer"
                                    >
                                        <TableCell className="min-w-64 pl-4">
                                            <div className="flex items-center gap-4">
                                                <AdminTableThumbnail
                                                    src={product.thumbnail_url}
                                                    fallbackIcon={PackageOpen}
                                                />
                                                <div className="min-w-0 space-y-0.5">
                                                    <p className="max-w-64 truncate text-sm font-semibold leading-tight">
                                                        {product.title}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {product.images_count}{" "}
                                                        {product.images_count ===
                                                        1
                                                            ? "image"
                                                            : "images"}
                                                        {product.brand &&
                                                            ` · ${product.brand}`}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground tabular-nums">
                                            {product.sku}
                                        </TableCell>
                                        <TableCell>
                                            {product.category?.name ??
                                                "Uncategorised"}
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            <AdminProductPrice
                                                product={product}
                                                align="right"
                                            />
                                        </TableCell>
                                        <TableCell className="text-right tabular-nums">
                                            <span
                                                className={
                                                    product.stock === 0
                                                        ? "font-medium text-destructive"
                                                        : "font-medium"
                                                }
                                            >
                                                {product.stock}
                                            </span>
                                            <span className="block text-xs text-muted-foreground">
                                                {availabilityLabel(
                                                    product.availability_status,
                                                )}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadges product={product} />
                                        </TableCell>
                                        <TableCell className="hidden text-xs text-muted-foreground xl:table-cell">
                                            {product.created_at ?? "—"}
                                        </TableCell>
                                        <TableCell
                                            className="pr-4 text-right"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8"
                                                        aria-label={`Actions for ${product.title}`}
                                                    >
                                                        <MoreHorizontal />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            router.visit(
                                                                admin.products.show(
                                                                    product.uuid,
                                                                ).url,
                                                            )
                                                        }
                                                    >
                                                        <Eye />
                                                        View details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            openEdit(product)
                                                        }
                                                    >
                                                        <Pencil />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() =>
                                                            setDeleting(product)
                                                        }
                                                    >
                                                        <Trash2 />
                                                        Remove
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        <div className="flex flex-col gap-3 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs text-muted-foreground tabular-nums">
                                Showing {from}–{to} of {products.total}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={
                                        products.current_page <= 1 || filtering
                                    }
                                    onClick={() =>
                                        goToPage(products.links[0]?.url ?? null)
                                    }
                                >
                                    Previous
                                </Button>
                                <span className="px-1 text-xs text-muted-foreground tabular-nums">
                                    {products.current_page} /{" "}
                                    {products.last_page}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={
                                        products.current_page >=
                                            products.last_page || filtering
                                    }
                                    onClick={() =>
                                        goToPage(
                                            products.links[
                                                products.links.length - 1
                                            ]?.url ?? null,
                                        )
                                    }
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}
            </div>

            <ProductFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                product={editing}
                categories={categories}
            />
            <ProductDeleteDialog
                open={deleting !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleting(null);
                    }
                }}
                product={deleting}
            />
        </>
    );
}

ProductsIndex.layout = {
    breadcrumbs: [
        {
            title: "Store",
            href: admin.dashboard().url,
        },
        {
            title: "Products",
            href: admin.products.index().url,
        },
    ],
};
