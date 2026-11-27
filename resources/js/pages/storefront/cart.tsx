import { Link } from '@inertiajs/react';
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { StorefrontBreadcrumbs } from '@/components/storefront/breadcrumbs';
import { Container } from '@/components/storefront/container';
import { Heading } from '@/components/storefront/heading';
import { PageHeader } from '@/components/storefront/page-header';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { useStorefrontCart } from '@/hooks/use-storefront-cart';
import { useStorefrontCartStore } from '@/hooks/stores/use-storefront-cart-store';
import { formatPrice } from '@/lib/storefront/format-price';
import { useCan } from '@/hooks/use-can';

function EmptyCart() {
    return (
        <div className="rounded-3xl border border-line bg-surface-alt px-6 py-16 text-center sm:py-20">
            <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <ShoppingBag aria-hidden="true" className="size-8" />
            </span>
            <Heading level={2} size="section" className="mt-5">
                Your Cart is empty
            </Heading>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted sm:text-base">
                Pick something from the shelf and it will show up right here.
            </p>
            <Link
                href="/"
                className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-brand px-6 text-sm font-extrabold text-surface transition-colors hover:bg-brand-deep"
            >
                Browse the shelf
                <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
        </div>
    );
}

function CartSkeleton() {
    return (
        <>
            <p role="status" className="sr-only">
                Loading your cart…
            </p>
            <div
                aria-hidden="true"
                className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start"
            >
                <div className="rounded-2xl border border-line bg-surface p-5">
                    {[0, 1].map((index) => (
                        <div
                            key={index}
                            className="flex gap-4 border-b border-line py-4 first:pt-0 last:border-0 last:pb-0"
                        >
                            <div className="size-20 shrink-0 rounded-xl bg-surface-alt motion-safe:animate-pulse sm:size-28" />
                            <div className="flex-1 space-y-3">
                                <div className="h-3 w-24 rounded-full bg-surface-alt motion-safe:animate-pulse" />
                                <div className="h-4 w-2/3 rounded-full bg-surface-alt motion-safe:animate-pulse" />
                                <div className="h-10 w-28 rounded-xl bg-surface-alt motion-safe:animate-pulse" />
                            </div>
                        </div>
                    ))}
                </div>
                <div className="rounded-2xl border border-line bg-surface p-6">
                    <div className="h-6 w-40 rounded-full bg-surface-alt motion-safe:animate-pulse" />
                    <div className="mt-6 h-4 w-full rounded-full bg-surface-alt motion-safe:animate-pulse" />
                    <div className="mt-3 h-4 w-2/3 rounded-full bg-surface-alt motion-safe:animate-pulse" />
                    <div className="mt-6 h-12 w-full rounded-xl bg-surface-alt motion-safe:animate-pulse" />
                </div>
            </div>
        </>
    );
}

export default function StorefrontCartPage() {
    const [hydrated, setHydrated] = useState(false);

    const changeQuantity = useStorefrontCartStore(
        (state) => state.changeQuantity,
    );
    const removeItem = useStorefrontCartStore((state) => state.removeItem);
    const setQuantity = useStorefrontCartStore((state) => state.setQuantity);
    const clearCart = useStorefrontCartStore((state) => state.clearCart);
    const currency = useSiteSettings().currency;
    const { items, isLoading, hasError } = useStorefrontCart();

    const [quantityDrafts, setQuantityDrafts] = useState<
        Record<string, string>
    >({});

    useEffect(() => {
        setHydrated(true);
    }, []);

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce(
        (sum, item) => sum + item.product.discountedPrice * item.quantity,
        0,
    );

    const updateQuantity = (uuid: string, raw: string, stock: number) => {
        if (raw === '') {
            setQuantityDrafts((drafts) => ({ ...drafts, [uuid]: '' }));
            return;
        }

        const parsed = Math.trunc(Number(raw));
        const limit = Math.max(1, stock);
        const next = String(
            Math.min(Math.max(Number.isNaN(parsed) ? 1 : parsed, 1), limit),
        );

        setQuantityDrafts((drafts) => ({ ...drafts, [uuid]: next }));
        setQuantity(uuid, Number(next));
    };

    const clearQuantityDraft = (uuid: string) => {
        setQuantityDrafts((drafts) => {
            const next = { ...drafts };
            delete next[uuid];
            return next;
        });
    };

    const { hasRole } = useCan();

    return (
        <Container className="pt-6 pb-12 sm:pt-8 sm:pb-16">
            <StorefrontBreadcrumbs className="mb-4" />

            <PageHeader
                className="mt-2"
                title="Your Cart"
                description={
                    itemCount === 0
                        ? 'Everything you pick lands here.'
                        : `${itemCount} ${itemCount === 1 ? 'item' : 'items'} from the shelf.`
                }
                action={
                    items.length > 0 ? (
                        <button
                            type="button"
                            onClick={clearCart}
                            className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-ink-muted transition-colors hover:bg-surface-alt hover:text-error"
                        >
                            <Trash2 aria-hidden="true" className="size-4" />
                            Clear cart
                        </button>
                    ) : undefined
                }
            />

            <div className="mt-8">
                {!hydrated || isLoading ? (
                    <CartSkeleton />
                ) : hasError ? (
                    <p
                        role="alert"
                        className="rounded-2xl border border-line bg-surface px-5 py-8 text-center text-sm text-ink-muted"
                    >
                        We couldn't load your cart. Please try again.
                    </p>
                ) : items.length === 0 ? (
                    <EmptyCart />
                ) : (
                    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
                        <section
                            aria-label="Items in your cart"
                            className="overflow-hidden rounded-2xl border border-line bg-surface"
                        >
                            <ul className="divide-y divide-line">
                                {items.map((item) => {
                                    const { product, quantity } = item;
                                    const atStock = quantity >= product.stock;

                                    return (
                                        <li
                                            key={product.uuid}
                                            className="flex gap-4 p-4 sm:gap-5 sm:p-5"
                                        >
                                            <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-brand-soft sm:size-28">
                                                <img
                                                    src={
                                                        product.thumbnailUrl ??
                                                        undefined
                                                    }
                                                    alt=""
                                                    aria-hidden="true"
                                                    width={112}
                                                    height={112}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className="size-full object-contain p-2"
                                                />
                                            </div>

                                            <div className="flex min-w-0 flex-1 flex-col gap-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="min-w-0">
                                                        <p className="text-[11px] font-bold tracking-wide text-brand uppercase">
                                                            {
                                                                product.categoryName
                                                            }
                                                        </p>
                                                        <h2 className="mt-1 line-clamp-2 text-sm leading-snug font-semibold text-ink sm:text-base">
                                                            {product.title}
                                                        </h2>
                                                        <p className="mt-1 text-xs text-ink-muted">
                                                            {formatPrice(
                                                                product.discountedPrice,
                                                                currency,
                                                            )}{' '}
                                                            each
                                                        </p>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeItem(
                                                                product.uuid,
                                                            )
                                                        }
                                                        aria-label={`Remove ${product.title} from cart`}
                                                        className="flex size-10 shrink-0 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-surface-alt hover:text-error"
                                                    >
                                                        <Trash2
                                                            aria-hidden="true"
                                                            className="size-4"
                                                        />
                                                    </button>
                                                </div>

                                                <div className="mt-auto flex flex-wrap items-end justify-between gap-3">
                                                    <div>
                                                        <div className="flex items-center rounded-xl border border-line">
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    changeQuantity(
                                                                        product.uuid,
                                                                        -1,
                                                                    )
                                                                }
                                                                aria-label={`Remove one ${product.title}`}
                                                                className="flex size-10 items-center justify-center rounded-l-xl text-ink-muted transition-colors hover:bg-surface-alt hover:text-brand"
                                                            >
                                                                <Minus
                                                                    aria-hidden="true"
                                                                    className="size-4"
                                                                />
                                                            </button>
                                                            <input
                                                                type="number"
                                                                inputMode="numeric"
                                                                min={1}
                                                                max={
                                                                    product.stock
                                                                }
                                                                value={
                                                                    quantityDrafts[
                                                                        product
                                                                            .uuid
                                                                    ] ??
                                                                    String(
                                                                        quantity,
                                                                    )
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateQuantity(
                                                                        product.uuid,
                                                                        event
                                                                            .target
                                                                            .value,
                                                                        product.stock,
                                                                    )
                                                                }
                                                                onBlur={() =>
                                                                    clearQuantityDraft(
                                                                        product.uuid,
                                                                    )
                                                                }
                                                                aria-label={`Quantity for ${product.title}`}
                                                                className="w-10 [appearance:textfield] bg-transparent text-center text-sm font-bold text-ink tabular-nums outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    changeQuantity(
                                                                        product.uuid,
                                                                        1,
                                                                    )
                                                                }
                                                                disabled={
                                                                    atStock
                                                                }
                                                                aria-label={
                                                                    atStock
                                                                        ? `${product.title} is at its stock limit`
                                                                        : `Add one ${product.title}`
                                                                }
                                                                className="flex size-10 items-center justify-center rounded-r-xl text-ink-muted transition-colors hover:bg-surface-alt hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
                                                            >
                                                                <Plus
                                                                    aria-hidden="true"
                                                                    className="size-4"
                                                                />
                                                            </button>
                                                        </div>
                                                        {atStock && (
                                                            <p className="mt-1 text-[11px] font-semibold text-ink-muted">
                                                                Max stock
                                                                reached
                                                            </p>
                                                        )}
                                                    </div>
                                                    <p className="text-base font-extrabold text-ink tabular-nums sm:text-lg">
                                                        {formatPrice(
                                                            product.discountedPrice *
                                                                quantity,
                                                            currency,
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>

                        <aside
                            aria-label="Order summary"
                            className="overflow-hidden rounded-2xl border border-line bg-surface lg:sticky lg:top-24"
                        >
                            <div className="bg-brand-deep px-5 py-4 sm:px-6">
                                <Heading level={2} size="card" tone="surface">
                                    Order summary
                                </Heading>
                            </div>
                            <div className="p-5 sm:p-6">
                                <dl className="space-y-3 text-sm">
                                    <div className="flex items-center justify-between gap-4">
                                        <dt className="text-ink-muted">
                                            Items
                                        </dt>
                                        <dd className="font-semibold text-ink tabular-nums">
                                            {itemCount}
                                        </dd>
                                    </div>
                                    <div className="flex items-center justify-between gap-4">
                                        <dt className="text-ink-muted">
                                            Subtotal
                                        </dt>
                                        <dd className="font-extrabold text-ink tabular-nums">
                                            {formatPrice(subtotal, currency)}
                                        </dd>
                                    </div>
                                </dl>

                                <div className="mt-5 flex items-end justify-between gap-4 border-t border-line pt-5">
                                    <span className="font-display text-lg font-extrabold text-ink">
                                        Total
                                    </span>
                                    <span className="font-display text-2xl font-extrabold text-brand tabular-nums">
                                        {formatPrice(subtotal, currency)}
                                    </span>
                                </div>

                                <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                                    Catalogue prices in USD. Checkout opens once
                                    payment is connected.
                                </p>

                                <p className="mt-4 text-xs leading-relaxed text-ink-muted">
                                    Questions before you order?{' '}
                                    <Link
                                        href="/policies/shipping"
                                        className="font-semibold text-brand underline decoration-line underline-offset-4 hover:text-brand-deep"
                                    >
                                        Shipping policy
                                    </Link>
                                </p>

                                <Link
                                    href="/checkout"
                                    disabled={hasRole('admin')}
                                    className="mt-3 flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-extrabold text-surface transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none enabled:hover:bg-brand-deep disabled:cursor-not-allowed disabled:bg-brand-soft disabled:text-brand-deep disabled:opacity-80"
                                >
                                    Continue to checkout
                                    <ArrowRight
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                </Link>
                            </div>
                        </aside>
                    </div>
                )}
            </div>

            <p className="mt-6 flex items-center gap-2 text-xs font-semibold text-ink-muted">
                <span
                    aria-hidden="true"
                    className="size-2 rounded-full bg-mint"
                />
                Your cart is saved on this device while the catalogue is in
                preview.
            </p>
        </Container>
    );
}
