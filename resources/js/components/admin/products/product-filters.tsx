import { LoaderCircle, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type {
    ProductCategory,
    ProductCounts,
    ProductFilters,
} from "@/types/admin-products";
import { useSiteSettings } from "@/hooks/use-site-settings";

const STATUS_OPTIONS = [
    { value: "all", label: "All statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "featured", label: "Featured" },
    { value: "out_of_stock", label: "Out of stock" },
    { value: "low_stock", label: "Low stock" },
] as const;

const SORT_OPTIONS = [
    { value: "newest", label: "Newest first" },
    { value: "title", label: "Name A–Z" },
    { value: "price_asc", label: "Price: low to high" },
    { value: "price_desc", label: "Price: high to low" },
    { value: "stock", label: "Lowest stock" },
] as const;

export function ProductFiltersBar({
    filters,
    categories,
    counts,
    total,
    filtering,
    onChange,
    onReset,
}: {
    filters: ProductFilters;
    categories: ProductCategory[];
    counts: ProductCounts;
    total: number;
    filtering: boolean;
    onChange: (next: Partial<ProductFilters>) => void;
    onReset: () => void;
}) {
    const currency = useSiteSettings().currency;
    const [search, setSearch] = useState(filters.search);

    useEffect(() => {
        setSearch(filters.search);
    }, [filters.search]);

    useEffect(() => {
        if (search === filters.search) {
            return;
        }

        const timer = window.setTimeout(() => onChange({ search }), 300);

        return () => window.clearTimeout(timer);
    }, [search, filters.search, onChange]);

    const hasFilters = Boolean(
        filters.search ||
        filters.category ||
        filters.status !== "all" ||
        filters.sort !== "newest",
    );

    return (
        <div className="space-y-3 rounded-lg border bg-card p-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative w-full lg:max-w-xs">
                    <Search
                        aria-hidden="true"
                        className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                        id="product-search"
                        type="search"
                        value={search}
                        placeholder="Search name, SKU or brand"
                        onChange={(event) => setSearch(event.target.value)}
                        className="pl-9"
                        aria-label="Search products"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3 lg:flex lg:min-w-0 lg:flex-1">
                    <Select
                        value={filters.category || "all"}
                        onValueChange={(value) =>
                            onChange({
                                category: value === "all" ? "" : value,
                            })
                        }
                    >
                        <SelectTrigger
                            id="product-filter-category"
                            aria-label="Filter by category"
                            className="w-full"
                        >
                            <SelectValue placeholder="All categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All categories</SelectItem>
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

                    <Select
                        value={filters.status}
                        onValueChange={(value) => onChange({ status: value })}
                    >
                        <SelectTrigger
                            id="product-filter-status"
                            aria-label="Filter by status"
                            className="w-full"
                        >
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_OPTIONS.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.sort}
                        onValueChange={(value) => onChange({ sort: value })}
                    >
                        <SelectTrigger
                            id="product-sort"
                            aria-label="Sort products"
                            className="col-span-2 w-full lg:col-span-1 lg:w-44"
                        >
                            <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent>
                            {SORT_OPTIONS.map((option) => (
                                <SelectItem
                                    key={option.value}
                                    value={option.value}
                                >
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {hasFilters && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={onReset}
                        className="lg:shrink-0"
                    >
                        <X />
                        Clear filters
                    </Button>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t pt-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 font-medium text-foreground tabular-nums">
                    {filtering && (
                        <LoaderCircle className="size-3 animate-spin" />
                    )}
                    {total} {total === 1 ? "product" : "products"}
                </span>
                <span className="tabular-nums">{counts.active} active</span>
                <span className="tabular-nums">
                    {counts.low_stock} low stock
                </span>
                <span className="tabular-nums">
                    {counts.out_of_stock} out of stock
                </span>
                <span className="ml-auto hidden sm:inline">
                    Prices in {currency}
                </span>
            </div>
        </div>
    );
}
