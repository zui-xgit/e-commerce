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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type {
    AdminOrderCounts,
    AdminOrderCustomerOption,
    AdminOrderFilters,
    OrderSort,
    OrderStatusFilter,
} from "@/types/admin-orders";

const STATUS_TABS: { value: OrderStatusFilter; label: string }[] = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "processed", label: "Processed" },
    { value: "cancelled", label: "Cancelled" },
];

const SORT_OPTIONS: { value: OrderSort; label: string }[] = [
    { value: "newest", label: "Newest first" },
    { value: "oldest", label: "Oldest first" },
    { value: "total_desc", label: "Total: high to low" },
    { value: "total_asc", label: "Total: low to high" },
];

export function OrderFiltersBar({
    filters,
    customers,
    counts,
    total,
    filtering,
    onChange,
    onReset,
}: {
    filters: AdminOrderFilters;
    customers: AdminOrderCustomerOption[];
    counts: AdminOrderCounts;
    total: number;
    filtering: boolean;
    onChange: (next: Partial<AdminOrderFilters>) => void;
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
        filters.search ||
        filters.customer ||
        filters.status !== "all" ||
        filters.sort !== "newest",
    );

    return (
        <div className="space-y-3 rounded-lg border bg-card p-3">
            <Tabs
                value={filters.status}
                onValueChange={(value) =>
                    onChange({ status: value as OrderStatusFilter })
                }
            >
                <TabsList
                    aria-label="Order status"
                    variant={"line"}
                    className="w-full"
                >
                    {STATUS_TABS.map((tab) => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="cursor-pointer"
                        >
                            <span>{tab.label}</span>
                            <span>{counts[tab.value]}</span>
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <div className="relative w-full lg:max-w-xs">
                    <Search
                        aria-hidden="true"
                        className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                        id="order-search"
                        type="search"
                        value={search}
                        placeholder="Order, customer or phone"
                        onChange={(event) => setSearch(event.target.value)}
                        className="pl-9"
                        aria-label="Search orders"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3 lg:flex lg:min-w-0 lg:flex-1">
                    <Select
                        value={filters.customer || "all"}
                        onValueChange={(value) =>
                            onChange({ customer: value === "all" ? "" : value })
                        }
                    >
                        <SelectTrigger
                            id="order-filter-customer"
                            aria-label="Filter by customer"
                            className="w-full"
                        >
                            <SelectValue placeholder="All customers" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All customers</SelectItem>
                            <SelectItem value="guest">
                                Guest checkout
                            </SelectItem>
                            {customers.map((customer) => (
                                <SelectItem
                                    key={customer.uuid}
                                    value={customer.uuid}
                                >
                                    {customer.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.sort}
                        onValueChange={(value) =>
                            onChange({ sort: value as OrderSort })
                        }
                    >
                        <SelectTrigger
                            id="order-sort"
                            aria-label="Sort orders"
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
                    >
                        <X />
                        Clear filters
                    </Button>
                )}
            </div>

            <div className="flex items-center gap-2 border-t pt-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5 font-medium text-foreground tabular-nums">
                    {filtering && (
                        <LoaderCircle className="size-3 animate-spin" />
                    )}
                    {total} {total === 1 ? "order" : "orders"}
                </span>
                <span className="ml-auto tabular-nums">
                    {counts.pending} awaiting confirmation
                </span>
            </div>
        </div>
    );
}
