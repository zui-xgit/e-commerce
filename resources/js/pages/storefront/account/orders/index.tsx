import { Link } from "@inertiajs/react";
import { ArrowRight, Package, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AccountPageHeader } from "@/components/storefront/account-page-header";
import { StorefrontBreadcrumbs } from "@/components/storefront/breadcrumbs";
import { Heading } from "@/components/storefront/heading";
import { OrderStatusBadge } from "@/components/storefront/order-status-badge";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { DUMMY_ORDERS } from "@/dummy_data/storefront-orders";
import { cn } from "@/lib/utils";
import type { StorefrontOrderStatus } from "@/types/storefront-orders";
import { formatPrice } from "@/lib/storefront/format-price";

type StatusFilter = StorefrontOrderStatus | "all";

const FILTERS: { value: StatusFilter; label: string }[] = [
    { value: "all", label: "All orders" },
    { value: "pending", label: "Pending" },
    { value: "processed", label: "Processed" },
];

export default function StorefrontOrdersIndexPage() {
    const [query, setQuery] = useState("");
    const [status, setStatus] = useState<StatusFilter>("all");
    const currency = useSiteSettings().currency;

    const visibleOrders = useMemo(() => {
        const term = query.trim().toLowerCase();

        return DUMMY_ORDERS.filter((order) => {
            const matchesStatus = status === "all" || order.status === status;
            const matchesTerm =
                !term ||
                `#${order.id}`.includes(term) ||
                order.items.some((item) =>
                    item.title.toLowerCase().includes(term),
                );

            return matchesStatus && matchesTerm;
        });
    }, [query, status]);

    const resetFilters = () => {
        setQuery("");
        setStatus("all");
    };

    return (
        <>
            <StorefrontBreadcrumbs className="mb-4 sm:mb-6" />

            <AccountPageHeader
                title="Your orders"
                description="Search or open a sample order."
                hideDescriptionOnMobile
            >
                <span className="flex min-h-8 w-fit items-center gap-2 rounded-full border border-line bg-surface px-3 text-xs font-extrabold text-ink-muted sm:min-h-11 sm:px-4">
                    <span
                        aria-hidden="true"
                        className="size-2 rounded-full bg-mint"
                    />
                    {DUMMY_ORDERS.length} sample orders · USD
                </span>
            </AccountPageHeader>

            <section
                id="orders-ledger"
                aria-label="Order history"
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
                                value={query}
                                onChange={(event) =>
                                    setQuery(event.target.value)
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
                                    onClick={() => setStatus(filter.value)}
                                    aria-pressed={status === filter.value}
                                    className={cn(
                                        "min-h-11 shrink-0 rounded-xl border px-4 text-sm font-bold transition-colors",
                                        status === filter.value
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
                    {visibleOrders.length} of {DUMMY_ORDERS.length} orders shown
                </p>

                {visibleOrders.length > 0 ? (
                    <ul className="mt-2 divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface sm:mt-3">
                        {visibleOrders.map((order) => {
                            const extraItems = order.items.length - 3;
                            const term = query.trim().toLowerCase();
                            const previewItem =
                                (term &&
                                    order.items.find((item) =>
                                        item.title.toLowerCase().includes(term),
                                    )) ||
                                order.items[0];
                            const previewImages = [
                                previewItem,
                                ...order.items.filter(
                                    (item) => item.id !== previewItem.id,
                                ),
                            ].slice(0, 3);

                            return (
                                <li
                                    key={order.id}
                                    className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)_auto] lg:items-center lg:gap-6"
                                >
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Heading level={2} size="compact">
                                                Order #{order.id}
                                            </Heading>
                                            <OrderStatusBadge
                                                status={order.status}
                                            />
                                        </div>
                                        <p className="mt-1 text-xs font-semibold text-ink-muted">
                                            Placed {order.placedOn} ·{" "}
                                            {order.totalQuantity} items
                                        </p>
                                    </div>

                                    <div className="flex min-w-0 items-center gap-3">
                                        <div className="flex shrink-0 gap-2">
                                            {previewImages.map((item) => (
                                                <img
                                                    key={item.id}
                                                    src={item.thumbnail}
                                                    alt=""
                                                    aria-hidden="true"
                                                    width={48}
                                                    height={48}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="size-12 rounded-xl border border-line bg-brand-soft object-contain p-1"
                                                />
                                            ))}
                                        </div>
                                        <p className="min-w-0 truncate text-sm font-semibold text-ink">
                                            {previewItem.title}
                                            {extraItems > 0 &&
                                                ` +${extraItems} more`}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4 lg:flex-col lg:items-end lg:gap-2">
                                        <div className="lg:text-right">
                                            <p className="text-[11px] font-extrabold tracking-wide text-ink-muted uppercase">
                                                Sample total
                                            </p>
                                            <p className="font-display text-xl font-extrabold text-ink tabular-nums">
                                                {formatPrice(
                                                    order.discountedTotal,
                                                    currency,
                                                )}
                                            </p>
                                        </div>
                                        <Link
                                            href={`/account/orders/${order.id}`}
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
                            No orders match that search
                        </Heading>
                        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
                            Try another item, a different status, or clear the
                            filters to see every sample order.
                        </p>
                        <button
                            type="button"
                            onClick={resetFilters}
                            className="mt-5 inline-flex min-h-11 items-center rounded-xl bg-brand px-5 text-sm font-extrabold text-surface transition-colors hover:bg-brand-deep"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </section>

            <p className="mt-6 flex items-center gap-2 text-xs font-semibold text-ink-muted">
                <span
                    aria-hidden="true"
                    className="size-2 rounded-full bg-mint"
                />
                Sample orders from DummyJSON · Delivery states are for UI
                testing · Prices in USD.
            </p>
        </>
    );
}
