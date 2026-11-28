import { Head, router } from "@inertiajs/react";
import { Eye, ImageIcon, MoreHorizontal, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { BannerDeleteDialog } from "@/components/admin/banners/banner-delete-dialog";
import { BannerFiltersBar } from "@/components/admin/banners/banner-filters";
import { BannerFormDialog } from "@/components/admin/banners/banner-form-dialog";
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
import type { AdminBanner, BannerFilters, BannersIndexProps } from "@/types/admin-banners";

const EMPTY_FILTERS: BannerFilters = {
    search: "",
    status: "all",
    sort: "newest",
};

export default function BannersIndex({
    banners,
    filters,
    counts,
}: BannersIndexProps) {
    const [formOpen, setFormOpen] = useState(false);
    const [editing, setEditing] = useState<AdminBanner | null>(null);
    const [deleting, setDeleting] = useState<AdminBanner | null>(null);
    const [filtering, setFiltering] = useState(false);
    const filtersRef = useRef(filters);
    filtersRef.current = filters;

    const visitFilters = useCallback((next: BannerFilters) => {
        setFiltering(true);
        router.get(admin.banners.index().url, next, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onFinish: () => setFiltering(false),
        });
    }, []);

    const applyFilters = useCallback(
        (next: Partial<BannerFilters>) => {
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

    const openEdit = (banner: AdminBanner) => {
        setEditing(banner);
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
        banners.total === 0 ? 0 : (banners.current_page - 1) * banners.per_page + 1;
    const to = Math.min(banners.current_page * banners.per_page, banners.total);

    return (
        <>
            <Head title="Banners" />

            <div className="w-full space-y-4">
                <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <Heading
                        title="Banners"
                        description="Manage storefront banners, their images, and display order."
                    />
                    <Button id="add-banner-toolbar" onClick={openCreate} className="w-full sm:w-auto">
                        <Plus />
                        Add banner
                    </Button>
                </div>

                <BannerFiltersBar
                    filters={filters}
                    counts={counts}
                    total={banners.total}
                    filtering={filtering}
                    onChange={applyFilters}
                    onReset={resetFilters}
                />

                {banners.total === 0 && (
                    <Card className="flex flex-col items-center gap-3 px-6 py-14 text-center">
                        <div className="flex size-12 items-center justify-center rounded-full bg-muted">
                            <ImageIcon className="size-6 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <h2 className="text-base font-semibold">
                                {hasFilters ? "No banners match those filters" : "No banners yet"}
                            </h2>
                            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
                                {hasFilters
                                    ? "Try a different search or clear filters to see all banners."
                                    : "Create banners to feature promotions and content on the storefront."}
                            </p>
                        </div>
                        {hasFilters ? (
                            <Button variant="outline" onClick={resetFilters}>
                                Clear filters
                            </Button>
                        ) : (
                            <Button id="add-banner-empty" onClick={openCreate}>
                                <Plus />
                                Add banner
                            </Button>
                        )}
                    </Card>
                )}

                {banners.total > 0 && (
                    <Card className="gap-0 overflow-hidden py-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="pl-4">Banner</TableHead>
                                    <TableHead className="text-right">Order</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="hidden xl:table-cell">Added</TableHead>
                                    <TableHead className="w-12 pr-4">
                                        <span className="sr-only">Actions</span>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {banners.data.map((banner) => (
                                    <TableRow
                                        key={banner.uuid}
                                        className="cursor-pointer"
                                        onClick={() => {
                                            router.visit(admin.banners.show(banner.uuid).url);
                                        }}
                                    >
                                        <TableCell className="pl-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-12 w-20 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/50">
                                                    {banner.image_url ? (
                                                        <img
                                                            src={banner.image_url}
                                                            alt=""
                                                            width={80}
                                                            height={48}
                                                            loading="lazy"
                                                            className="size-full object-cover"
                                                        />
                                                    ) : (
                                                        <ImageIcon className="size-4 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="max-w-64 truncate font-medium">
                                                        {banner.title}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-muted-foreground tabular-nums">
                                            {banner.sort_order}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={banner.is_active ? "default" : "secondary"}>
                                                {banner.is_active ? "Active" : "Inactive"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden text-xs text-muted-foreground xl:table-cell">
                                            {banner.created_at ?? "—"}
                                        </TableCell>
                                        <TableCell
                                            className="pr-4 text-right"
                                            onClick={(event) => event.stopPropagation()}
                                        >
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="size-8"
                                                        aria-label={`Actions for ${banner.title}`}
                                                    >
                                                        <MoreHorizontal />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() =>
                                                            router.visit(
                                                                admin.banners.show(banner.uuid).url,
                                                            )
                                                        }
                                                    >
                                                        <Eye />
                                                        View details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => openEdit(banner)}>
                                                        <Pencil />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => setDeleting(banner)}
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
                                Showing {from}–{to} of {banners.total}
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={banners.current_page <= 1 || filtering}
                                    onClick={() => goToPage(banners.links[0]?.url ?? null)}
                                >
                                    Previous
                                </Button>
                                <span className="px-1 text-xs text-muted-foreground tabular-nums">
                                    {banners.current_page} / {banners.last_page}
                                </span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={banners.current_page >= banners.last_page || filtering}
                                    onClick={() =>
                                        goToPage(banners.links[banners.links.length - 1]?.url ?? null)
                                    }
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </Card>
                )}
            </div>

            <BannerFormDialog open={formOpen} onOpenChange={setFormOpen} banner={editing} />
            <BannerDeleteDialog
                open={deleting !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeleting(null);
                    }
                }}
                banner={deleting}
            />
        </>
    );
}

BannersIndex.layout = {
    breadcrumbs: [
        {
            title: "Content",
            href: admin.dashboard().url,
        },
        {
            title: "Banners",
            href: admin.banners.index().url,
        },
    ],
};
