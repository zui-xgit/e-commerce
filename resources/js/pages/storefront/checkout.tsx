import { Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Banknote,
    Check,
    CircleAlert,
    Minus,
    Plus,
    ShieldCheck,
    ShoppingBag,
    Trash2,
} from 'lucide-react';
import type { FormEvent } from 'react';
import type { SharedPageProps } from '@/types/inertia-config';
import { useEffect, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { Authentication } from '@/components/storefront/authentication';
import { StorefrontBreadcrumbs } from '@/components/storefront/breadcrumbs';
import { Container } from '@/components/storefront/container';
import { DeliveryAddressFields } from '@/components/storefront/delivery-address-fields';
import { Heading } from '@/components/storefront/heading';
import { Input } from '@/components/storefront/input';
import { PageHeader } from '@/components/storefront/page-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useSiteSettings } from '@/hooks/use-site-settings';
import { store as placeOrderRoute } from '@/routes/checkout';
import { useStorefrontCart } from '@/hooks/use-storefront-cart';
import { useStorefrontCartStore } from '@/hooks/stores/use-storefront-cart-store';
import { formatPrice } from '@/lib/storefront/format-price';
import type {
    DeliveryAddressErrors,
    DeliveryAddressValues,
} from '@/lib/storefront/delivery-address';

const FOLLOW_UP_LABEL = "We'll call you first";
const FOLLOW_UP_HINT = "We'll arrange payment together when we're in touch.";

const PREVIEW_DELIVERY = 0;
const PREVIEW_TAX = 0;

type CheckoutItem = {
    uuid: string;
    quantity: number;
};

type CheckoutFormData = {
    email: string;
    userUuid?: string;
    items: CheckoutItem[];
    deliveryCountry: string;
    deliveryName: string;
    deliveryCompany: string;
    deliveryAddress: string;
    deliveryCity: string;
    deliveryPostalCode: string;
    deliveryPhone: string;
    policies: boolean;
};

type CheckoutFormKey = keyof CheckoutFormData;
type CheckoutTextFormKey = Exclude<
    CheckoutFormKey,
    'policies' | 'items' | 'userUuid'
>;

const EMPTY_FORM_DATA: CheckoutFormData = {
    email: '',
    items: [],
    deliveryCountry: '',
    deliveryName: '',
    deliveryCompany: '',
    deliveryAddress: '',
    deliveryCity: '',
    deliveryPostalCode: '',
    deliveryPhone: '',
    policies: false,
};

const ADDRESS_FORM_KEYS = {
    country: 'deliveryCountry',
    name: 'deliveryName',
    company: 'deliveryCompany',
    address: 'deliveryAddress',
    city: 'deliveryCity',
    postalCode: 'deliveryPostalCode',
    phone: 'deliveryPhone',
    email: 'email',
} as const satisfies Record<keyof DeliveryAddressValues, CheckoutTextFormKey>;

const FIELD_IDS: Partial<Record<CheckoutFormKey, string>> = {
    deliveryCountry: 'delivery-country',
    deliveryName: 'delivery-name',
    deliveryCompany: 'delivery-company',
    deliveryAddress: 'delivery-address',
    deliveryCity: 'delivery-city',
    deliveryPostalCode: 'delivery-postal-code',
    deliveryPhone: 'delivery-phone',
    email: 'delivery-email',
    policies: 'accept-policies',
};

const policyLinkClassName =
    'rounded-sm font-semibold text-brand underline decoration-line underline-offset-4 hover:text-brand-deep focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none';

function PolicyLink({ href, label }: { href: string; label: string }) {
    return (
        <Link
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${label} (opens in a new tab)`}
            className={policyLinkClassName}
        >
            {label}
        </Link>
    );
}

function addressFromForm(data: CheckoutFormData): DeliveryAddressValues {
    return {
        country: data.deliveryCountry,
        name: data.deliveryName,
        company: data.deliveryCompany,
        address: data.deliveryAddress,
        city: data.deliveryCity,
        postalCode: data.deliveryPostalCode,
        phone: data.deliveryPhone,
        email: data.email,
    };
}

function formFromAddress(
    address: DeliveryAddressValues,
): Partial<CheckoutFormData> {
    return {
        deliveryCountry: address.country,
        deliveryName: address.name,
        deliveryCompany: address.company,
        deliveryAddress: address.address,
        deliveryCity: address.city,
        deliveryPostalCode: address.postalCode,
        deliveryPhone: address.phone,
        email: address.email,
    };
}

const checkboxClass =
    'mt-0.5 size-5 shrink-0 cursor-pointer rounded-md border-line bg-surface text-surface data-[state=checked]:border-brand data-[state=checked]:bg-brand data-[state=checked]:text-surface focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none! focus-visible:ring-offset-surface';

function CheckoutTopBar() {
    return (
        <div className="border-b border-line bg-surface-alt/80">
            <Container className="flex min-h-16 items-center justify-between gap-3 py-3">
                <div className="flex min-w-0 items-center gap-3">
                    <Link
                        href="/"
                        className="flex min-h-10 items-center gap-2.5 rounded-xl focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-alt focus-visible:outline-none"
                    >
                        <span
                            aria-hidden="true"
                            className="flex size-9 items-center justify-center rounded-xl bg-brand font-display text-lg font-extrabold text-surface"
                        >
                            S
                        </span>
                        <span className="font-display text-lg font-extrabold tracking-tight text-ink">
                            ShopHub
                        </span>
                    </Link>
                    <Link
                        href="/cart"
                        aria-label="Back to cart"
                        className="flex size-10 shrink-0 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-surface hover:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-alt focus-visible:outline-none sm:hidden"
                    >
                        <ArrowLeft aria-hidden="true" className="size-4" />
                    </Link>
                    <span
                        aria-hidden="true"
                        className="hidden h-5 w-px bg-line sm:block"
                    />
                    <Link
                        href="/cart"
                        className="hidden min-h-10 items-center gap-1.5 rounded-xl px-2 text-sm font-bold text-ink-muted transition-colors hover:bg-surface hover:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-alt focus-visible:outline-none sm:inline-flex"
                    >
                        <ArrowLeft aria-hidden="true" className="size-4" />
                        Back to cart
                    </Link>
                </div>

                <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-bold text-ink-muted">
                    <ShieldCheck
                        aria-hidden="true"
                        className="size-4 text-brand"
                    />
                    <span className="hidden min-[400px]:inline">
                        Secure checkout
                    </span>
                    <span className="min-[400px]:hidden">Checkout</span>
                </span>
            </Container>
        </div>
    );
}

type QuantityStepperProps = {
    title: string;
    quantity: number;
    stock: number;
    draft?: string;
    onChange: (raw: string) => void;
    onBlur: () => void;
    onDecrease: () => void;
    onIncrease: () => void;
};

function QuantityStepper({
    title,
    quantity,
    stock,
    draft,
    onChange,
    onBlur,
    onDecrease,
    onIncrease,
}: QuantityStepperProps) {
    const atStock = quantity >= stock;

    return (
        <div>
            <div className="inline-flex items-center rounded-xl border border-line bg-surface">
                <button
                    type="button"
                    onClick={onDecrease}
                    aria-label={`Remove one ${title}`}
                    className="flex size-10 items-center justify-center rounded-l-xl text-ink-muted transition-colors hover:bg-surface-alt hover:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none"
                >
                    <Minus aria-hidden="true" className="size-4" />
                </button>
                <Input
                    variant="bare"
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={stock}
                    value={draft ?? String(quantity)}
                    onChange={(event) => onChange(event.target.value)}
                    onBlur={onBlur}
                    aria-label={`Quantity for ${title}`}
                    className="h-10 w-12 [appearance:textfield] text-base text-ink sm:text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <button
                    type="button"
                    onClick={onIncrease}
                    disabled={atStock}
                    aria-label={
                        atStock
                            ? `${title} is at its stock limit`
                            : `Add one ${title}`
                    }
                    className="flex size-10 items-center justify-center rounded-r-xl text-ink-muted transition-colors hover:bg-surface-alt hover:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <Plus aria-hidden="true" className="size-4" />
                </button>
            </div>
            {atStock && (
                <p className="mt-1 text-[11px] font-semibold text-ink-muted">
                    Max stock reached
                </p>
            )}
        </div>
    );
}

function CheckoutSkeleton() {
    return (
        <>
            <p role="status" className="sr-only">
                Loading checkout…
            </p>
            <div
                aria-hidden="true"
                className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start"
            >
                <div className="grid gap-6">
                    <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
                        <div className="h-6 w-40 rounded-full bg-surface-alt motion-safe:animate-pulse" />
                        <div className="mt-6 space-y-5">
                            {[0, 1].map((index) => (
                                <div
                                    key={index}
                                    className="flex gap-4 border-b border-line pb-5 last:border-0 last:pb-0"
                                >
                                    <div className="size-20 shrink-0 rounded-xl bg-surface-alt motion-safe:animate-pulse sm:size-24" />
                                    <div className="flex-1 space-y-3">
                                        <div className="h-3 w-20 rounded-full bg-surface-alt motion-safe:animate-pulse" />
                                        <div className="h-4 w-2/3 rounded-full bg-surface-alt motion-safe:animate-pulse" />
                                        <div className="h-10 w-28 rounded-xl bg-surface-alt motion-safe:animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
                        <div className="h-6 w-36 rounded-full bg-surface-alt motion-safe:animate-pulse" />
                        <div className="mt-6 grid gap-3 md:grid-cols-3">
                            {[0, 1, 2].map((index) => (
                                <div
                                    key={index}
                                    className="h-20 rounded-xl bg-surface-alt motion-safe:animate-pulse"
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="rounded-2xl border border-line bg-surface p-6">
                    <div className="h-16 w-full rounded-xl bg-surface-alt motion-safe:animate-pulse" />
                    <div className="mt-6 space-y-3">
                        <div className="h-4 w-full rounded-full bg-surface-alt motion-safe:animate-pulse" />
                        <div className="h-4 w-3/4 rounded-full bg-surface-alt motion-safe:animate-pulse" />
                        <div className="h-4 w-2/3 rounded-full bg-surface-alt motion-safe:animate-pulse" />
                    </div>
                    <div className="mt-6 h-12 w-full rounded-xl bg-surface-alt motion-safe:animate-pulse" />
                </div>
            </div>
        </>
    );
}

function EmptyCheckout() {
    return (
        <div className="rounded-3xl border border-line bg-surface-alt px-6 py-16 text-center sm:py-20">
            <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <ShoppingBag aria-hidden="true" className="size-8" />
            </span>
            <Heading level={2} size="section" className="mt-5">
                Nothing to check out yet
            </Heading>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted sm:text-base">
                Your cart is empty. Pick something from the shelf and it will
                show up here as a real order line.
            </p>
            <Link
                href="/"
                className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-brand px-6 text-sm font-extrabold text-surface transition-colors hover:bg-brand-deep focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-alt focus-visible:outline-none"
            >
                Browse the shelf
                <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
        </div>
    );
}

function CheckoutError() {
    return (
        <div
            role="alert"
            className="rounded-3xl border border-line bg-surface px-6 py-14 text-center sm:py-16"
        >
            <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-error/10 text-error">
                <CircleAlert aria-hidden="true" className="size-8" />
            </span>
            <Heading level={2} size="section" className="mt-5">
                We couldn't load your cart
            </Heading>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted sm:text-base">
                Your saved items are still on this device. Try again, or head
                back to the cart to review them there.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-brand px-6 text-sm font-extrabold text-surface transition-colors hover:bg-brand-deep focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none"
                >
                    Try again
                </button>
                <Link
                    href="/cart"
                    className="inline-flex min-h-12 items-center rounded-xl border border-line px-5 text-sm font-bold text-ink transition-colors hover:border-brand hover:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none"
                >
                    Back to cart
                </Link>
            </div>
        </div>
    );
}

type CheckoutPageProps = {
    savedAddress: DeliveryAddressValues | null;
};

export default function StorefrontCheckoutPage() {
    const [hydrated, setHydrated] = useState(false);
    const [quantityDrafts, setQuantityDrafts] = useState<
        Record<string, string>
    >({});
    const { auth, savedAddress } = usePage<
        SharedPageProps & CheckoutPageProps
    >().props;
    const user = auth.user;
    const form = useForm<CheckoutFormData>(EMPTY_FORM_DATA);
    const prefilledAddress = useRef<string | null>(null);

    const changeQuantity = useStorefrontCartStore(
        (state) => state.changeQuantity,
    );
    const removeItem = useStorefrontCartStore((state) => state.removeItem);
    const setQuantity = useStorefrontCartStore((state) => state.setQuantity);
    const clearCart = useStorefrontCartStore((state) => state.clearCart);

    const currency = useSiteSettings().currency;
    const { items, isLoading, hasError } = useStorefrontCart();

    useEffect(() => {
        setHydrated(true);
    }, []);

    // Saved account details are a starting point, not a lock: the user can
    // still edit them for this order without changing their address book.
    useEffect(() => {
        if (!savedAddress) return;

        // Prefill once per address version so later Inertia visits (including
        // the redirect after placing an order) never overwrite local edits.
        const version = JSON.stringify(savedAddress);
        if (prefilledAddress.current === version) return;

        prefilledAddress.current = version;
        form.setData((current) => ({
            ...current,
            ...formFromAddress(savedAddress),
        }));
    }, [savedAddress, form.setData]);

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce(
        (sum, item) => sum + item.product.discountedPrice * item.quantity,
        0,
    );
    const grandTotal = subtotal + PREVIEW_DELIVERY + PREVIEW_TAX;
    const deliveryAddress = addressFromForm(form.data);
    const addressErrors: DeliveryAddressErrors = {
        country: form.errors.deliveryCountry,
        name: form.errors.deliveryName,
        company: form.errors.deliveryCompany,
        address: form.errors.deliveryAddress,
        city: form.errors.deliveryCity,
        postalCode: form.errors.deliveryPostalCode,
        phone: form.errors.deliveryPhone,
        email: form.errors.email,
    };
    const policyError = Boolean(form.errors.policies);

    const updateText = (field: CheckoutTextFormKey, value: string) => {
        form.setData(field, value);
        form.clearErrors(field);
    };

    const updateAddress = (field: keyof DeliveryAddressValues, value: string) =>
        updateText(ADDRESS_FORM_KEYS[field], value);

    const updatePolicies = (value: boolean) => {
        form.setData('policies', value);
        form.clearErrors('policies');
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        // Radix portals render outside this form in the DOM but keep React's
        // event bubbling through the checkout page. Auth submissions must stay
        // owned by the authentication form, not trigger checkout validation.
        if (!event.currentTarget.contains(event.target as Node)) return;

        event.preventDefault();

        if (form.processing) return;

        form.transform((data) => ({
            ...data,
            ...(user ? { userUuid: user.uuid } : {}),
            items: items.map(({ product, quantity }) => ({
                uuid: product.uuid,
                quantity,
            })),
        }));

        form.post(placeOrderRoute().url, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => clearCart(),
            onError: (errors) => {
                const firstInvalidField = Object.keys(errors)[0] as
                    | CheckoutFormKey
                    | undefined;

                if (firstInvalidField) {
                    document
                        .getElementById(
                            FIELD_IDS[firstInvalidField] ?? firstInvalidField,
                        )
                        ?.focus();
                }
            },
        });
    };

    const ctaHint = (() => {
        if (form.hasErrors) {
            return 'Check the highlighted fields to continue.';
        }
        return 'Your order details will be saved. No payment is taken.';
    })();

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

    const removeLine = (uuid: string) => {
        removeItem(uuid);
        clearQuantityDraft(uuid);
    };

    const adjustQuantity = (uuid: string, amount: number) => {
        changeQuantity(uuid, amount);
    };

    const headerDescription =
        !hydrated || isLoading
            ? 'Getting your saved picks ready for review.'
            : hasError
              ? "We couldn't load the items saved on this device."
              : itemCount === 0
                ? 'Your cart is empty.'
                : `${itemCount} ${itemCount === 1 ? 'item' : 'items'} ready for review — adjust anything before placing your order.`;

    return (
        <div className="storefront min-h-screen bg-surface text-ink">
            <CheckoutTopBar />

            <Container className="pt-6 pb-16 sm:pt-8 sm:pb-20">
                <StorefrontBreadcrumbs className="mb-4" />
                <PageHeader title="Checkout" description={headerDescription} />

                <div className="mt-8">
                    {!hydrated || isLoading ? (
                        <CheckoutSkeleton />
                    ) : hasError ? (
                        <CheckoutError />
                    ) : items.length === 0 ? (
                        <EmptyCheckout />
                    ) : (
                        <form
                            onSubmit={submit}
                            noValidate
                            className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start"
                        >
                            <div className="grid gap-6">
                                <section
                                    aria-labelledby="order-summary-heading"
                                    className="overflow-hidden rounded-2xl border border-line bg-surface"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
                                        <Heading
                                            level={2}
                                            size="card"
                                            id="order-summary-heading"
                                        >
                                            Order summary
                                        </Heading>
                                        <span className="text-xs font-bold text-ink-muted">
                                            {itemCount}{' '}
                                            {itemCount === 1 ? 'item' : 'items'}
                                        </span>
                                    </div>
                                    <ul className="divide-y divide-line">
                                        {items.map((item) => {
                                            const { product, quantity } = item;
                                            const lineTotal =
                                                product.discountedPrice *
                                                quantity;

                                            return (
                                                <li
                                                    key={product.uuid}
                                                    className="flex gap-4 p-4 sm:gap-5 sm:p-5"
                                                >
                                                    <div className="size-20 shrink-0 overflow-hidden rounded-xl bg-brand-soft sm:size-24">
                                                        <img
                                                            src={
                                                                product.thumbnailUrl ??
                                                                ''
                                                            }
                                                            alt=""
                                                            aria-hidden="true"
                                                            width={96}
                                                            height={96}
                                                            loading="lazy"
                                                            decoding="async"
                                                            className="size-full object-contain p-2"
                                                        />
                                                    </div>

                                                    <div className="flex min-w-0 flex-1 flex-col gap-3">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="min-w-0">
                                                                <p className="truncate text-[11px] font-bold tracking-wide text-brand uppercase">
                                                                    {
                                                                        product.categoryName
                                                                    }
                                                                </p>
                                                                <h3 className="mt-1 line-clamp-2 text-sm leading-snug font-semibold break-words text-ink sm:text-base">
                                                                    {
                                                                        product.title
                                                                    }
                                                                </h3>
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
                                                                    removeLine(
                                                                        product.uuid,
                                                                    )
                                                                }
                                                                aria-label={`Remove ${product.title} from order`}
                                                                className="flex size-10 shrink-0 items-center justify-center rounded-xl text-ink-muted transition-colors hover:bg-surface-alt hover:text-error focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none"
                                                            >
                                                                <Trash2
                                                                    aria-hidden="true"
                                                                    className="size-4"
                                                                />
                                                            </button>
                                                        </div>

                                                        <div className="mt-auto flex flex-wrap items-end justify-between gap-3">
                                                            <QuantityStepper
                                                                title={
                                                                    product.title
                                                                }
                                                                quantity={
                                                                    quantity
                                                                }
                                                                stock={
                                                                    product.stock
                                                                }
                                                                draft={
                                                                    quantityDrafts[
                                                                        product
                                                                            .uuid
                                                                    ]
                                                                }
                                                                onChange={(
                                                                    raw,
                                                                ) =>
                                                                    updateQuantity(
                                                                        product.uuid,
                                                                        raw,
                                                                        product.stock,
                                                                    )
                                                                }
                                                                onBlur={() =>
                                                                    clearQuantityDraft(
                                                                        product.uuid,
                                                                    )
                                                                }
                                                                onDecrease={() =>
                                                                    adjustQuantity(
                                                                        product.uuid,
                                                                        -1,
                                                                    )
                                                                }
                                                                onIncrease={() =>
                                                                    adjustQuantity(
                                                                        product.uuid,
                                                                        1,
                                                                    )
                                                                }
                                                            />
                                                            <p
                                                                aria-label={`Line total ${formatPrice(lineTotal, currency)}`}
                                                                className="text-base font-extrabold text-ink tabular-nums sm:text-lg"
                                                            >
                                                                {formatPrice(
                                                                    lineTotal,
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

                                <section
                                    aria-labelledby="delivery-heading"
                                    className="rounded-2xl border border-line bg-surface"
                                >
                                    <div className="border-b border-line px-5 py-4 sm:px-6">
                                        <Heading
                                            level={2}
                                            size="card"
                                            id="delivery-heading"
                                        >
                                            Delivery information
                                        </Heading>
                                        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                                            Where should we send your order?
                                            Delivery is free.
                                        </p>
                                    </div>
                                    <div className="px-5 py-5 sm:px-6">
                                        <DeliveryAddressFields
                                            values={deliveryAddress}
                                            errors={addressErrors}
                                            onChange={updateAddress}
                                        />

                                        {user ? (
                                            <div className="mt-5 flex flex-col gap-3 rounded-xl border border-line bg-mint-soft p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-mint text-brand-deep">
                                                        <Check
                                                            aria-hidden="true"
                                                            className="size-5"
                                                        />
                                                    </span>
                                                    <div className="grid min-w-0 gap-0.5">
                                                        <p className="text-sm font-bold text-ink">
                                                            Signed in
                                                        </p>
                                                        <p className="text-xs leading-relaxed text-ink-muted">
                                                            Saved details are
                                                            filled in below.
                                                            Changes here apply
                                                            to this order only.
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg border border-line bg-surface px-4 text-sm font-bold text-brand-deep">
                                                    Account connected
                                                </span>
                                            </div>
                                        ) : (
                                            <div className="mt-5 flex flex-col gap-3 rounded-xl border border-line bg-surface-alt p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
                                                <div className="grid gap-0.5">
                                                    <p className="flex items-center gap-3 text-sm font-bold text-ink">
                                                        Save this information
                                                        for next time
                                                        <span className="text-[11px] leading-none font-semibold text-green-600">
                                                            (Optional)
                                                        </span>
                                                    </p>

                                                    <p className="text-xs leading-relaxed text-ink-muted">
                                                        Log in or register to
                                                        add a saved address that
                                                        fills in automatically
                                                        next time.
                                                    </p>
                                                </div>
                                                <Authentication>
                                                    <button
                                                        type="button"
                                                        className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg border border-line bg-surface px-4 text-sm font-bold text-brand transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-deep focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-alt focus-visible:outline-none"
                                                    >
                                                        Log in or register
                                                    </button>
                                                </Authentication>
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <section
                                    aria-labelledby="payment-heading"
                                    className="overflow-hidden rounded-2xl border border-line bg-surface"
                                >
                                    <div className="border-b border-line px-5 py-4 sm:px-6">
                                        <Heading
                                            level={2}
                                            size="card"
                                            id="payment-heading"
                                        >
                                            What happens next
                                        </Heading>
                                        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
                                            Your order will be saved. We'll call
                                            you to arrange payment; no payment
                                            is taken here.
                                        </p>
                                    </div>
                                    <div className="p-5 sm:p-6">
                                        <div className="grid min-h-20 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl border border-line bg-surface-alt p-4">
                                            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-line bg-surface">
                                                <Banknote
                                                    aria-hidden="true"
                                                    className="size-5 text-brand-deep"
                                                />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block text-sm font-bold text-ink">
                                                    {FOLLOW_UP_LABEL}
                                                </span>
                                                <span className="mt-0.5 block text-xs text-ink-muted">
                                                    {FOLLOW_UP_HINT}
                                                </span>
                                            </span>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            <aside
                                aria-labelledby="total-heading"
                                className="overflow-hidden rounded-2xl border border-line bg-surface lg:sticky lg:top-6"
                            >
                                <div className="bg-brand-deep px-5 py-5 sm:px-6">
                                    <div className="flex items-center justify-between gap-3">
                                        <Heading
                                            level={2}
                                            size="compact"
                                            tone="surface"
                                            id="total-heading"
                                        >
                                            Your total
                                        </Heading>
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/15 px-2.5 py-1 text-[11px] font-bold text-surface">
                                            <span
                                                aria-hidden="true"
                                                className="size-1.5 rounded-full bg-mint"
                                            />
                                            Estimate
                                        </span>
                                    </div>
                                    <p className="mt-3 font-display text-3xl font-extrabold tracking-tight text-surface tabular-nums sm:text-4xl">
                                        {formatPrice(grandTotal, currency)}
                                    </p>
                                </div>

                                <div className="p-5 sm:p-6">
                                    <dl className="space-y-3 text-sm">
                                        <div className="flex items-center justify-between gap-4">
                                            <dt className="text-ink-muted">
                                                Subtotal
                                            </dt>
                                            <dd className="font-semibold text-ink tabular-nums">
                                                {formatPrice(
                                                    subtotal,
                                                    currency,
                                                )}
                                            </dd>
                                        </div>
                                        <div className="flex items-center justify-between gap-4">
                                            <dt className="text-ink-muted">
                                                Delivery
                                            </dt>
                                            <dd className="font-semibold text-ink">
                                                Free
                                            </dd>
                                        </div>
                                        <div className="flex items-center justify-between gap-4">
                                            <dt className="text-ink-muted">
                                                Tax
                                            </dt>
                                            <dd className="font-semibold text-ink tabular-nums">
                                                {formatPrice(
                                                    PREVIEW_TAX,
                                                    currency,
                                                )}
                                            </dd>
                                        </div>
                                    </dl>

                                    <div className="mt-5 flex items-end justify-between gap-4 border-t border-line pt-5">
                                        <span className="font-display text-lg font-extrabold text-ink">
                                            Total due
                                        </span>
                                        <span className="font-display text-2xl font-extrabold text-brand tabular-nums">
                                            {formatPrice(grandTotal, currency)}
                                        </span>
                                    </div>

                                    <p className="mt-3 text-xs leading-relaxed text-ink-muted">
                                        Prices in {currency}. Delivery is free.
                                        Payment is arranged after your order is
                                        placed.
                                    </p>

                                    <div className="mt-5 border-t border-line pt-5">
                                        <div className="grid gap-2 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-x-3">
                                            <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 sm:col-span-2">
                                                <Checkbox
                                                    id="accept-policies"
                                                    checked={form.data.policies}
                                                    onCheckedChange={(
                                                        checked,
                                                    ) =>
                                                        updatePolicies(
                                                            checked === true,
                                                        )
                                                    }
                                                    aria-label="I agree to the Terms of service and Privacy policy"
                                                    aria-invalid={policyError}
                                                    aria-describedby={
                                                        policyError
                                                            ? 'policy-hint policy-error'
                                                            : 'policy-hint'
                                                    }
                                                    className={checkboxClass}
                                                />
                                                <Label
                                                    htmlFor="accept-policies"
                                                    className="cursor-pointer text-sm leading-relaxed font-normal text-ink sm:text-xs"
                                                >
                                                    I agree to the{' '}
                                                    <PolicyLink
                                                        href="/policies/terms"
                                                        label="Terms of service"
                                                    />{' '}
                                                    and{' '}
                                                    <PolicyLink
                                                        href="/policies/privacy"
                                                        label="Privacy policy"
                                                    />
                                                    .
                                                </Label>
                                            </div>
                                            <p
                                                id="policy-hint"
                                                className="text-xs leading-relaxed text-ink-muted sm:col-start-2 sm:text-[11px]"
                                            >
                                                You can also read the{' '}
                                                <PolicyLink
                                                    href="/policies/shipping"
                                                    label="Shipping policy"
                                                />{' '}
                                                and{' '}
                                                <PolicyLink
                                                    href="/policies/refund"
                                                    label="Refund policy"
                                                />{' '}
                                                before you continue.
                                            </p>
                                            <InputError
                                                id="policy-error"
                                                role="alert"
                                                message={form.errors.policies}
                                                className="text-xs font-bold text-error sm:col-start-2"
                                            />
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                        aria-describedby="cta-hint"
                                        className="mt-4 flex min-h-12 w-full rounded-xl bg-brand px-6 text-sm font-extrabold text-surface focus-visible:ring-brand focus-visible:ring-offset-surface enabled:hover:bg-brand-deep disabled:cursor-not-allowed disabled:bg-brand-soft disabled:text-brand-deep disabled:opacity-80"
                                    >
                                        {form.processing && (
                                            <Spinner aria-hidden="true" />
                                        )}
                                        Place order
                                        {!form.processing && (
                                            <ArrowRight
                                                aria-hidden="true"
                                                className="size-4"
                                            />
                                        )}
                                    </Button>

                                    <p
                                        id="cta-hint"
                                        className="mt-3 text-center text-xs font-semibold text-ink-muted"
                                    >
                                        {ctaHint}
                                    </p>
                                </div>
                            </aside>
                        </form>
                    )}
                </div>
            </Container>
        </div>
    );
}
