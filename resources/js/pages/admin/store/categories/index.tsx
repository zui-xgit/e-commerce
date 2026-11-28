import { Head, router } from "@inertiajs/react";
import { Eye, MoreHorizontal, Pencil, Plus, Tags, Trash2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { AdminTableThumbnail } from "@/components/admin/admin-table-thumbnail";
import { CategoryDeleteDialog } from "@/components/admin/categories/category-delete-dialog";
import { CategoryFiltersBar } from "@/components/admin/categories/category-filters";
import { CategoryFormDialog } from "@/components/admin/categories/category-form-dialog";
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
import admin from "@/routes/admin";
import type {
    AdminCategory,
    CategoriesIndexProps,
    CategoryFilters,
} from "@/types/admin-categories";

const EMPTY_FILTERS: CategoryFilters = {
    search: "",
    status: "all",
    sort: "newest",
};

export default function CategoriesIndex({
    categories,
    filters,
    counts,
}: CategoriesIndexProps) {
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<AdminCategory | null>(null);
    const [deleting, setDeleting] = useState<AdminCategory | null>(null);
    const [filtering, setFiltering] = useState(false);
    const filtersRef = useRef(filters);
    filtersRef.current = filters;

    const visitFilters = useCallback((next: CategoryFilters) => {
        setFiltering(true);
        router.get(admin.categories.index().url, next, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setFiltering(false),
        });
    }, []);

    const applyFilters = useCallback(
        (next: Partial<CategoryFilters>) => {
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

    const openEdit = (category: AdminCategory) => {
        setEditing(category);
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
        filters.search || filters.status !== "all" || filters.sort !== "newest",
    );
    const from =
        categories.total === 0
            ? 0
            : (categories.current_page - 1) * categories.per_page + 1;
    const to = Math.min(
        categories.current_page * categories.per_page,
        categories.total,
    );

    return (
        <>
            <Head title="Categories" />

            <div className="w-full space-y-4">
                <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title="Categories"
                        description="Organize products into clear, browsable groups."
                    />
                    <Button
                        id="add-category-toolbar"
                        onClick={openCreate}
                        className="w-full sm:w-auto"
                    >
                        <Plus />
                        Add category
                    </Button>
                </div>

                <CategoryFiltersBar
                    filters={filters}
                    counts={counts}
                    total={categories.total}
                    filtering={filtering}
                    onChange={applyFilters}
                    onReset={resetFilters}
                />

                {categories.total === 0 && (
                    <Card className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                            <Tags className="size-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-base font-semibold">
                                {hasFilters
                                    ? "No categories match those filters"
                                    : "No categories yet"}
                            </h2>
                            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                                {hasFilters
                                    ? "Try a different search or clear filters to see all categories."
                                    : "Create categories so products are easier to browse and manage."}
                            </p>
                        </div>
                        {hasFilters ? (
                            <Button variant="outline" onClick={resetFilters}>
                                Clear filters
                            </Button>
                        ) : (
                            <Button
                                id="add-category-empty"
                                onClick={openCreate}
                            >
                                <Plus />
                                Add category
                            </Button>
                        )}
                    </Card>
                )}

                {categories.total > 0 && (
                    <Card className="gap-0 overflow-hidden py-0">
                        <Table className="[&_td]:py-3 [&_th]:h-12">
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="min-w-64 pl-4">
                                        Category
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Products
                                    </TableHead>
                                    <TableHead className="text-right">
                                        Order
                                    </TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="hidden xl:table-cell">
                                        Added
                                    </TableHead>
                                    <TableHead className="w-12 pr-4">
                                        <span>Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {categories.data.map((category, index) => (
                                    <TableRow
                                        key={index}
                                        className="cursor-pointer"
                                        onClick={() => {
                                            router.visit(
                                                admin.categories.show(
                                                    category.uuid,
                                                ).url,
                                            );
                                        }}
                                    >
                                        <TableCell className="min-w-64 pl-4">
                                            <div className="flex items-center gap-4">
                                                <AdminTableThumbnail
                                                    src={category.thumbnail_url}
                                                    fallbackIcon={Tags}
                                                />
                                                <div className="min-w-0 space-y-0.5">
                                                    <p className="max-w-64 truncate text-sm font-semibold leading-tight">
                                                        {category.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {
                                                            category.products_count
                                                        }{" "}
                                                        {category.products_count ===
                                                        1
                                                            ? "product"
                                                            : "products"}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-medium tabular-nums">
                                            {category.products_count}
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground tabular-nums">
                                            {category.sort_order}
                                        </TableCell>
                                        <TableCell>
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
                                        </TableCell>
                                        <TableCell className="hidden text-xs text-muted-foreground xl:table-cell">
                                            {category.created_at ?? "—"}
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
                                                        aria-label={`Actions for ${category.name}`}
                                                    >
                                                        <MoreHorizontal />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            router.visit(
                                                                admin.categories.show(
                                                                    category.uuid,
                                                                ).url,
                                                            )
                                                        }
                                                    >
                                                        <Eye />
                                                        View details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            openEdit(category)
                                                        }
                                                    >
                                                        <Pencil />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() =>
                                                            setDeleting(
                                                                category,
                                                            )
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
                                Showing {from}–{to} of {categories.total}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={
                                        categories.current_page <= 1 ||
                                        filtering
                                    }
                                    onClick={() =>
                                        goToPage(
                                            categories.links[0]?.url ?? null,
                                        )
                                    }
                                >
                                    Previous
                                </Button>
                                <span className="px-1 text-xs text-muted-foreground tabular-nums">
                                    {categories.current_page} /{" "}
                                    {categories.last_page}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={
                                        categories.current_page >=
                                            categories.last_page || filtering
                                    }
                                    onClick={() =>
                                        goToPage(
                                            categories.links[
                                                categories.links.length - 1
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

            <CategoryFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                category={editing}
            />
            <CategoryDeleteDialog
                open={deleting !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleting(null);
                    }
                }}
                category={deleting}
            />
        </>
    );
}

CategoriesIndex.layout = {
    breadcrumbs: [
        {
            title: "Store",
            href: admin.dashboard().url,
        },
        {
            title: "Categories",
            href: admin.categories.index().url,
        },
    ],
};
