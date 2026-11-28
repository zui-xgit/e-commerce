import { Link, router, usePage } from "@inertiajs/react";
import { ArrowRight, Package, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { AccountPageHeader } from "@/components/storefront/account-page-header";
import { StorefrontBreadcrumbs } from "@/components/storefront/breadcrumbs";
import { Heading } from "@/components/storefront/heading";
import { OrderStatusBadge } from "@/components/storefront/order-status-badge";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { formatPrice } from "@/lib/storefront/format-price";
import { cn } from "@/lib/utils";
import account from "@/routes/account";
import type {
    StorefrontOrder,
    StorefrontOrderStatus,
} from "@/types/storefront-orders";

type StatusFilter = StorefrontOrderStatus | "all";

type OrdersIndexPageProps = {
    orders: StorefrontOrder[];
    filters: {
        search: string;
        status: StatusFilter;
    };
    counts: Record<StatusFilter, number>;
};

const FILTERS: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All orders" },
    { value: "pending", label: "Pending" },
    { value: "processed", label: "Processed" },
    { value: "cancelled", label: "Cancelled" },
];

export default function StorefrontOrdersIndexPage() {
    const { orders, filters, counts } = usePage<OrdersIndexPageProps>().props;
    const currency = useSiteSettings().currency;

    const [searchInput, setSearchInput] = useState(filters.search);
    const [loading, setLoading] = useState(false);

    const navigate = (next: { search?: string; status?: StatusFilter }) => {
        const search = next.search ?? filters.search;
        const status = next.status ?? filters.status;
        const query: Record<string, string> = {};

        if (search.trim()) query.search = search.trim();
        if (status !== "all") query.status = status;

        router.get(
            account.orders.index.url({
                query: Object.keys(query).length > 0 ? query : undefined,
            }),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                only: ["orders", "filters"],
                onStart: () => setLoading(true),
                onFinish: () => setLoading(false),
            },
        );
    };

    useEffect(() => {
        if (searchInput.trim() === filters.search) return;

        const timer = window.setTimeout(() => navigate({ search: searchInput }), 350);

        return () => window.clearTimeout(timer);
    }, [searchInput, filters.search, filters.status]);

    const resetFilters = () => {
        setSearchInput("");
        navigate({ search: "", status: "all" });
    };

    const hasFilters = Boolean(filters.search) || filters.status !== "all";

    return (
        <>
            <StorefrontBreadcrumbs className="mb-4 sm:mb-6" />

            <AccountPageHeader
                title="Your orders"
                description="Search your order history and open a receipt."
                hideDescriptionOnMobile
            >
                <span className="flex min-h-8 w-fit items-center gap-2 rounded-full border border-line bg-surface px-3 text-xs font-extrabold text-ink-muted sm:min-h-11 sm:px-4">
                    <span
                        aria-hidden="true"
                        className="size-2 rounded-full bg-mint"
                    />
                    {counts.all} {counts.all === 1 ? "order" : "orders"} ·{" "}
                    {currency}
                </span>
            </AccountPageHeader>

            <section
                id="orders-ledger"
                aria-label="Order history"
                aria-busy={loading}
                className="mt-2 sm:mt-6"
            >
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:gap-3">
                    <div>
                        <label
                            htmlFor="order-search"
                            className="sr-only text-xs font-bold text-ink sm:not-sr-only sm:block sm:text-sm"
                        >
                            Find an order
                        </label>
                        <div className="relative mt-1.5 sm:mt-2">
                            <Search
                                aria-hidden="true"
                                className="absolute top-1/2 left-4 size-4 -translate-y-1/2 text-ink-muted"
                            />
                            <input
                                id="order-search"
                                type="search"
                                value={searchInput}
                                onChange={(event) =>
                                    setSearchInput(event.target.value)
                                }
                                placeholder="Order number or item name"
                                className="min-h-11 w-full rounded-xl border border-line bg-surface pr-4 pl-11 text-base text-ink placeholder:text-ink-muted"
                            />
                        </div>
                    </div>
                    <fieldset>
                        <legend className="sr-only text-sm font-bold text-ink sm:not-sr-only sm:mb-2">
                            Status
                        </legend>
                        <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible">
                            {FILTERS.map((filter) => (
                                <button
                                    key={filter.value}
                                    type="button"
                                    onClick={() => navigate({ status: filter.value })}
                                    aria-pressed={filters.status === filter.value}
                                    aria-label={`${filter.label} (${counts[filter.value]})`}
                                    className={cn(
                                        "min-h-11 shrink-0 rounded-xl border px-4 text-sm font-bold transition-colors",
                                        filters.status === filter.value
                                            ? "border-brand bg-brand-soft text-brand-deep"
                                            : "border-line bg-surface text-ink-muted hover:border-brand hover:text-brand",
                                    )}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </fieldset>
                </div>

                <p
                    aria-live="polite"
                    className="sr-only text-sm font-semibold text-ink-muted sm:not-sr-only sm:mt-5 sm:block"
                >
                    {orders.length} of {counts.all} orders shown
                </p>

                {orders.length > 0 ? (
                    <ul className="mt-2 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface sm:mt-3">
                        {orders.map((order) => {
                            const term = filters.search.trim().toLowerCase();
                            const previewItem =
                                (term &&
                                    order.items.find((item) =>
                                        item.title.toLowerCase().includes(term),
                                    )) ||
                                order.items[0];
                            const previewImages = previewItem
                                ? [
                                      previewItem,
                                      ...order.items.filter(
                                          (item) => item.uuid !== previewItem.uuid,
                                      ),
                                  ].slice(0, 3)
                                : [];
                            const extraItems = Math.max(
                                0,
                                order.items.length - previewImages.length,
                            );

                            return (
                                <li
                                    key={order.uuid}
                                    className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)_auto] lg:items-center lg:gap-6"
                                >
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Heading level={2} size="compact">
                                                Order #{order.orderNumber}
                                            </Heading>
                                            <OrderStatusBadge status={order.status} />
                                        </div>
                                        <p className="mt-1 text-xs font-semibold text-ink-muted">
                                            Placed {order.placedOn} ·{" "}
                                            {order.totalQuantity} items
                                        </p>
                                    </div>

                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex shrink-0 gap-2">
                                            {previewImages.map((item) =>
                                                item.thumbnailUrl ? (
                                                    <img
                                                        key={item.uuid}
                                                        src={item.thumbnailUrl}
                                                        alt=""
                                                        aria-hidden="true"
                                                        width={48}
                                                        height={48}
                                                        loading="lazy"
                                                        decoding="async"
                                                        className="size-12 rounded-xl border border-line bg-brand-soft object-contain p-1"
                                                    />
                                                ) : (
                                                    <span
                                                        key={item.uuid}
                                                        aria-hidden="true"
                                                        className="flex size-12 items-center justify-center rounded-xl border border-line bg-brand-soft text-ink-muted"
                                                    >
                                                        <Package className="size-4" />
                                                    </span>
                                                ),
                                            )}
                                        </div>
                                        <p className="min-w-0 truncate text-sm font-semibold text-ink">
                                            {previewItem?.title}
                                            {extraItems > 0 && ` +${extraItems} more`}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4 lg:flex-col lg:items-end lg:gap-2">
                                        <div className="lg:text-right">
                                            <p className="text-[11px] font-extrabold tracking-wide text-ink-muted uppercase">
                                                Total
                                            </p>
                                            <p className="font-display text-xl font-extrabold text-ink tabular-nums">
                                                {formatPrice(order.total, currency)}
                                            </p>
                                        </div>
                                        <Link
                                            href={account.orders.show.url(order.uuid)}
                                            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-line px-4 text-sm font-extrabold text-ink transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-deep sm:w-auto"
                                        >
                                            View details
                                            <ArrowRight
                                                aria-hidden="true"
                                                className="size-4"
                                            />
                                        </Link>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <div className="mt-3 rounded-2xl border border-line bg-surface-alt px-6 py-14 text-center">
                        <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                            <Package aria-hidden="true" className="size-7" />
                        </span>
                        <Heading level={2} size="card" className="mt-4">
                            {hasFilters
                                ? "No orders match those filters"
                                : "No orders yet"}
                        </Heading>
                        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
                            {hasFilters
                                ? "Try another order number, a different status, or clear the filters to see everything."
                                : "Orders you place will appear here with their latest status."}
                        </p>
                        {hasFilters && (
                            <button
                                type="button"
                                onClick={resetFilters}
                                className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-brand px-5 text-sm font-extrabold text-surface transition-colors hover:bg-brand-deep"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                )}
            </section>

            <p className="mt-6 flex items-center gap-2 text-xs font-semibold text-ink-muted">
                <span
                    aria-hidden="true"
                    className="size-2 rounded-full bg-mint"
                />
                Order history from your account · Prices in {currency}.
            </p>
        </>
    );
}
