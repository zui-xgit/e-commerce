import { Link, usePage } from "@inertiajs/react";
import { ArrowLeft, Package, Phone } from "lucide-react";
import { AccountPageHeader } from "@/components/storefront/account-page-header";
import { StorefrontBreadcrumbs } from "@/components/storefront/breadcrumbs";
import { Heading } from "@/components/storefront/heading";
import { OrderStatusBadge } from "@/components/storefront/order-status-badge";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { formatPrice } from "@/lib/storefront/format-price";
import account from "@/routes/account";
import type { StorefrontOrder } from "@/types/storefront-orders";

type OrderShowPageProps = {
    order: StorefrontOrder | null;
};

export default function StorefrontOrderShowPage() {
    const { order } = usePage<OrderShowPageProps>().props;
    const currency = useSiteSettings().currency;

    const breadcrumbs = (
        <StorefrontBreadcrumbs
            id="order-breadcrumb"
            currentLabel={order ? `Order #${order.orderNumber}` : "Order"}
            className="mb-6"
        />
    );

    if (!order) {
        return (
            <>
                {breadcrumbs}

                <div className="rounded-2xl border border-line bg-surface-alt px-6 py-16 text-center">
                    <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                        <Package aria-hidden="true" className="size-7" />
                    </span>
                    <Heading level={1} size="compact" className="mt-4">
                        We couldn't find that order
                    </Heading>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
                        It may have been placed from another account. Head back
                        to your order history and pick another one.
                    </p>
                    <Link
                        href={account.orders.index.url()}
                        className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-brand px-6 text-sm font-extrabold text-surface transition-colors hover:bg-brand-deep"
                    >
                        Back to all orders
                        <ArrowLeft aria-hidden="true" className="size-4" />
                    </Link>
                </div>
            </>
        );
    }

    const address = order.deliveryAddress;

    return (
        <>
            {breadcrumbs}

            <div>
                <AccountPageHeader
                    title={`Order #${order.orderNumber}`}
                    description={`Placed ${order.placedOn} · ${order.totalProducts} products · ${order.totalQuantity} units`}
                >
                    <span className="flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-xs font-extrabold text-ink-muted">
                        <span
                            aria-hidden="true"
                            className="size-2 rounded-full bg-mint"
                        />
                        {currency}
                    </span>
                    <OrderStatusBadge status={order.status} />
                </AccountPageHeader>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-brand/20 bg-brand-soft px-4 py-3 text-sm font-semibold text-brand-deep">
                <Phone aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <p>We will call you shortly to confirm your order.</p>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start lg:gap-6">
                <section
                    aria-labelledby="order-items-heading"
                    className="overflow-hidden rounded-2xl border border-line bg-surface"
                >
                    <div className="border-b border-line px-4 py-4 sm:px-5">
                        <Heading id="order-items-heading" size="compact">
                            Items in this order
                        </Heading>
                    </div>
                    <ul className="divide-y divide-line">
                        {order.items.map((item) => (
                            <li key={item.uuid} className="flex gap-4 p-4 sm:p-5">
                                {item.thumbnailUrl ? (
                                    <img
                                        src={item.thumbnailUrl}
                                        alt={item.title}
                                        width={80}
                                        height={80}
                                        loading="lazy"
                                        decoding="async"
                                        className="size-16 shrink-0 rounded-xl border border-line bg-brand-soft object-contain p-1.5 sm:size-20"
                                    />
                                ) : (
                                    <span className="flex size-16 shrink-0 items-center justify-center rounded-xl border border-line bg-brand-soft text-ink-muted sm:size-20">
                                        <Package aria-hidden="true" className="size-6" />
                                    </span>
                                )}
                                <div className="min-w-0 flex-1">
                                    <h3 className="line-clamp-2 text-sm leading-snug font-bold text-ink">
                                        {item.title}
                                    </h3>
                                    <p className="mt-1 text-xs font-semibold text-ink-muted">
                                        {formatPrice(item.price, currency)} each
                                        · Qty {item.quantity}
                                    </p>
                                    {item.discountPercentage >= 1 && (
                                        <span className="mt-2 inline-flex rounded-full bg-coral-soft px-2.5 py-1 text-[11px] font-extrabold text-ink">
                                            {Math.round(item.discountPercentage)}%
                                            off
                                        </span>
                                    )}
                                </div>
                                <p className="shrink-0 font-display text-lg font-extrabold text-ink tabular-nums">
                                    {formatPrice(item.discountedTotal, currency)}
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>

                <aside aria-label="Order details" className="space-y-4">
                    <section
                        aria-labelledby="delivery-heading"
                        className="rounded-2xl border border-line bg-surface p-5"
                    >
                        <Heading id="delivery-heading" size="compact">
                            Delivery
                        </Heading>
                        {address ? (
                            <>
                                <address className="mt-4 text-sm leading-relaxed font-semibold text-ink not-italic">
                                    {address.name}
                                    {address.company && (
                                        <>
                                            <br />
                                            {address.company}
                                        </>
                                    )}
                                    <br />
                                    {address.address}
                                    <br />
                                    {address.city}
                                    {address.postalCode && ` ${address.postalCode}`}
                                    <br />
                                    {address.country}
                                    <br />
                                    {address.phone}
                                    <br />
                                    {address.email}
                                </address>
                                <p className="mt-4 border-t border-line pt-4 text-xs leading-relaxed text-ink-muted">
                                    These details were saved with the order at
                                    checkout.
                                </p>
                            </>
                        ) : (
                            <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                                No delivery details were saved with this order.
                            </p>
                        )}
                    </section>

                    <section
                        aria-labelledby="summary-heading"
                        className="rounded-2xl bg-brand-deep p-5 text-surface"
                    >
                        <Heading id="summary-heading" size="compact" tone="surface">
                            Payment summary
                        </Heading>
                        <dl className="mt-5 space-y-3 text-sm">
                            <div className="flex items-center justify-between gap-4">
                                <dt className="text-surface/75">Items total</dt>
                                <dd className="font-semibold tabular-nums">
                                    {formatPrice(order.originalTotal, currency)}
                                </dd>
                            </div>
                            {order.savings > 0 && (
                                <div className="flex items-center justify-between gap-4">
                                    <dt className="text-surface/75">Discount</dt>
                                    <dd className="font-semibold tabular-nums">
                                        −{formatPrice(order.savings, currency)}
                                    </dd>
                                </div>
                            )}
                        </dl>
                        <div className="mt-5 flex items-end justify-between gap-4 border-t border-surface/20 pt-5">
                            <span className="font-display text-lg font-extrabold">
                                Total
                            </span>
                            <span className="font-display text-2xl font-extrabold tabular-nums">
                                {formatPrice(order.total, currency)}
                            </span>
                        </div>
                        <p className="mt-3 text-xs leading-relaxed text-surface/75">
                            Prices in {currency}.
                        </p>
                    </section>

                    <Link
                        href={account.orders.index.url()}
                        className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line bg-surface text-sm font-extrabold text-ink transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-deep"
                    >
                        <ArrowLeft aria-hidden="true" className="size-4" />
                        Back to all orders
                    </Link>
                </aside>
            </div>

            <p className="mt-6 flex items-center gap-2 text-xs font-semibold text-ink-muted">
                <span
                    aria-hidden="true"
                    className="size-2 rounded-full bg-mint"
                />
                Order details from your account · Prices in {currency}.
            </p>
        </>
    );
}
