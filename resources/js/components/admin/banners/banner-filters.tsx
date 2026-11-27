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
import type { BannerCounts, BannerFilters } from "@/types/admin-banners";

const STATUS_OPTIONS = [
    { value: "all", label: "All statuses" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
] as const;

const SORT_OPTIONS = [
    { value: "newest", label: "Newest first" },
    { value: "oldest", label: "Oldest first" },
    { value: "title", label: "Title A–Z" },
    { value: "sort_order", label: "Sort order" },
] as const;

export function BannerFiltersBar({
    filters,
    counts,
    total,
    filtering,
    onChange,
    onReset,
}: {
    filters: BannerFilters;
    counts: BannerCounts;
    total: number;
    filtering: boolean;
    onChange: (next: Partial<BannerFilters>) => void;
    onReset: () => void;
}) {
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
        filters.search || filters.status !== "all" || filters.sort !== "newest",
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
                        id="banner-search"
                        type="search"
                        value={search}
                        placeholder="Search banner title"
                        onChange={(event) => setSearch(event.target.value)}
                        className="pl-9"
                        aria-label="Search banners"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3 lg:flex lg:min-w-0 lg:flex-1">
                    <Select
                        value={filters.status}
                        onValueChange={(value) => onChange({ status: value })}
                    >
                        <SelectTrigger
                            id="banner-filter-status"
                            aria-label="Filter by status"
                            className="w-full"
                        >
                            <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            {STATUS_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
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
                            id="banner-sort"
                            aria-label="Sort banners"
                            className="w-full lg:w-44"
                        >
                            <SelectValue placeholder="Sort" />
                        </SelectTrigger>
                        <SelectContent>
                            {SORT_OPTIONS.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
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
                    {filtering && <LoaderCircle className="size-3 animate-spin" />}
                    {total} {total === 1 ? "banner" : "banners"}
                </span>
                <span className="tabular-nums">{counts.active} active</span>
                <span className="tabular-nums">{counts.inactive} inactive</span>
            </div>
        </div>
    );
}
