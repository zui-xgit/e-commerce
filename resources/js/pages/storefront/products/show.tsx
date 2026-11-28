import { Link, router, usePage } from "@inertiajs/react";
import { ArrowLeft, ArrowRight, ChevronDown, Star } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { StorefrontBreadcrumbs } from "@/components/storefront/breadcrumbs";
import { Container } from "@/components/storefront/container";
import { Heading } from "@/components/storefront/heading";
import { PageHeader } from "@/components/storefront/page-header";
import { ProductCard } from "@/components/storefront/product-card";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { useStorefrontCartStore } from "@/hooks/stores/use-storefront-cart-store";
import { cart as cartRoute } from "@/routes";
import productsRoute from "@/routes/products";
import type {
    StorefrontProduct,
    StorefrontProductDetail,
} from "@/types/storefront-catalog";
import { formatPrice } from "@/lib/storefront/format-price";
import { storefrontToast } from "@/lib/storefront/storefront-toast";

type ProductShowProps = {
    product: StorefrontProductDetail;
    related: StorefrontProduct[];
};

function Note({ title, children }: { title: string; children: ReactNode }) {
    return (
        <details className="group rounded-xl border border-line bg-surface p-4 transition-colors hover:border-brand">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-extrabold text-ink">
                {title}
                <ChevronDown
                    aria-hidden="true"
                    className="size-4 shrink-0 text-ink-muted transition-transform group-open:rotate-180"
                />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {children}
            </p>
        </details>
    );
}

export default function StorefrontProductShowPage() {
    const { product, related } = usePage<ProductShowProps>().props;
    const currency = useSiteSettings().currency;

    const [activeImage, setActiveImage] = useState(0);
    const [quantity, setQuantity] = useState(1);
    const addToCart = useStorefrontCartStore((state) => state.addToCart);
    const cartQuantity = useStorefrontCartStore(
        (state) =>
            state.cart.find((item) => item.uuid === product.uuid)?.quantity ??
            0,
    );

    useEffect(() => {
        setActiveImage(0);
        setQuantity(1);
    }, [product.uuid]);

    const gallery = product.images
        .map((image) => ({ url: image.url, alt: image.alt, uuid: image.uuid }))
        .filter(
            (
                image,
            ): image is { url: string; alt: string | null; uuid: string } =>
                Boolean(image.url),
        );

    const galleryImages =
        gallery.length > 0
            ? gallery
            : product.thumbnailUrl
              ? [
                    {
                        url: product.thumbnailUrl,
                        alt: product.title,
                        uuid: "thumbnail",
                    },
                ]
              : [];

    const activeImageSrc = galleryImages[activeImage]?.url ?? "";
    const reviews = product.reviews ?? [];
    const hasDiscount = product.discountPercentage >= 1 && product.savings > 0;
    const maxQuantity = Math.max(1, product.stock);

    const addProductToCart = (selectedQuantity: number) => {
        if (product.stock === 0) return;

        const remaining = Math.max(0, product.stock - cartQuantity);

        if (selectedQuantity > remaining) {
            storefrontToast(
                remaining > 0
                    ? `Only ${remaining} left in stock for ${product.title}`
                    : `Maximum available quantity reached for ${product.title}`,
            );
            return;
        }

        addToCart(product.uuid, selectedQuantity);

        storefrontToast(`${product.title} added to cart`);
    };

    const details: [string, string][] = [
        ["Category", product.categoryName],
        ["Brand", product.brand ?? "Not specified"],
        ["SKU", product.sku],
        ["Availability", product.availabilityStatus ?? "Not specified"],
        ["Return policy", product.returnPolicy ?? "Not specified"],
        ["Warranty", product.warrantyInformation ?? "Not specified"],
    ];

    return (
        <Container className="pb-28 lg:pb-20">
            <StorefrontBreadcrumbs
                currentLabel={product.title}
                className="mb-6"
            />

            <section className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,.98fr)] lg:items-start">
                <div
                    id="product-gallery"
                    className="rounded-[2rem] border border-line bg-brand-soft p-4 sm:p-6"
                >
                    <div className="relative aspect-square overflow-hidden rounded-[1.5rem] bg-surface">
                        {activeImageSrc ? (
                            <img
                                src={activeImageSrc}
                                alt={`${product.title}, view ${activeImage + 1}`}
                                width={900}
                                height={900}
                                loading={activeImage === 0 ? "eager" : "lazy"}
                                decoding="async"
                                className="size-full object-contain p-6 transition-transform duration-300 motion-safe:hover:scale-105 sm:p-10"
                            />
                        ) : (
                            <div className="flex size-full items-center justify-center px-8 text-center text-sm font-semibold text-ink-muted">
                                No image is attached to this product yet.
                            </div>
                        )}
                        {hasDiscount && (
                            <span className="absolute top-4 left-4 rounded-full bg-coral px-3 py-1.5 text-xs font-extrabold text-surface">
                                Save {Math.round(product.discountPercentage)}%
                            </span>
                        )}
                    </div>

                    {galleryImages.length > 1 && (
                        <div className="no-scrollbar mt-4 flex gap-3 overflow-x-auto pb-1">
                            {galleryImages.map((image, index) => (
                                <button
                                    key={image.uuid}
                                    type="button"
                                    onClick={() => setActiveImage(index)}
                                    aria-label={`View image ${index + 1} of ${product.title}`}
                                    aria-pressed={activeImage === index}
                                    className={`flex size-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 bg-surface transition-colors sm:size-20 ${
                                        activeImage === index
                                            ? "border-brand"
                                            : "border-transparent hover:border-brand/50"
                                    }`}
                                >
                                    <img
                                        src={image.url}
                                        alt=""
                                        aria-hidden="true"
                                        width={80}
                                        height={80}
                                        loading="lazy"
                                        decoding="async"
                                        className="size-full object-contain p-1.5"
                                    />
                                </button>
                            ))}
                        </div>
                    )}

                    <p className="mt-4 flex items-center gap-2 text-xs font-semibold text-ink-muted">
                        <span
                            aria-hidden="true"
                            className="size-2 rounded-full bg-mint"
                        />
                        Images from your store catalogue · Prices in USD
                    </p>
                </div>

                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-brand-soft px-3 py-1.5 text-xs font-extrabold text-brand-deep">
                            {product.categoryName}
                        </span>
                        {product.brand && (
                            <span className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-extrabold text-ink-muted">
                                {product.brand}
                            </span>
                        )}
                    </div>

                    <PageHeader className="mt-4" title={product.title} />

                    <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold text-ink-muted">
                        <span className="flex items-center gap-1.5">
                            <Star
                                aria-hidden="true"
                                className="size-4 fill-star text-star"
                            />
                            <span className="font-extrabold text-ink tabular-nums">
                                {product.rating.toFixed(1)}
                            </span>
                            <span>
                                ({reviews.length}{" "}
                                {reviews.length === 1 ? "review" : "reviews"})
                            </span>
                        </span>
                        <span
                            className={
                                product.stock > 0
                                    ? "font-extrabold text-success"
                                    : "font-extrabold text-error"
                            }
                        >
                            {product.stock > 0
                                ? `${product.stock} in stock`
                                : "Out of stock"}
                        </span>
                        <span className="tabular-nums">SKU {product.sku}</span>
                    </div>

                    <div className="mt-6 flex flex-wrap items-end gap-3">
                        <span className="self-end pb-1 text-[11px] font-extrabold tracking-wide text-ink-muted uppercase">
                            Price
                        </span>
                        <span className="font-display text-4xl font-extrabold text-ink tabular-nums sm:text-5xl">
                            {formatPrice(product.discountedPrice, currency)}
                        </span>
                        {hasDiscount && (
                            <>
                                <span className="pb-1 text-base text-ink-muted tabular-nums line-through">
                                    {formatPrice(
                                        product.originalPrice,
                                        currency,
                                    )}
                                </span>
                                <span className="mb-1 rounded-full bg-mint px-3 py-1.5 text-xs font-extrabold text-ink">
                                    Save{" "}
                                    {formatPrice(product.savings, currency)}
                                </span>
                            </>
                        )}
                        <span className="w-full text-[11px] font-extrabold tracking-wide text-ink-muted uppercase">
                            Prices in USD
                        </span>
                    </div>

                    {product.description && (
                        <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted">
                            {product.description}
                        </p>
                    )}

                    <div className="mt-7 flex flex-wrap gap-x-8 gap-y-4 border-y border-line py-5 text-sm">
                        <div>
                            <strong className="block font-display text-lg font-extrabold text-ink tabular-nums">
                                {product.rating.toFixed(1)} / 5
                            </strong>
                            <span className="text-ink-muted">
                                Shopper rating
                            </span>
                        </div>
                        <div className="sm:border-l sm:border-line sm:pl-8">
                            <strong className="block font-display text-lg font-extrabold text-ink tabular-nums">
                                {product.minimumOrderQuantity}
                            </strong>
                            <span className="text-ink-muted">
                                Minimum order
                            </span>
                        </div>
                        <div className="sm:border-l sm:border-line sm:pl-8">
                            <strong className="block font-display text-lg font-extrabold text-ink">
                                {product.availabilityStatus ?? "Not specified"}
                            </strong>
                            <span className="text-ink-muted">Availability</span>
                        </div>
                    </div>

                    <div className="mt-7 rounded-2xl border border-line bg-surface-alt p-5">
                        <div className="flex flex-wrap items-end gap-4">
                            <div>
                                <span className="block text-sm font-bold text-ink">
                                    Quantity
                                </span>
                                <div
                                    role="group"
                                    aria-label="Product quantity"
                                    className="mt-2 flex min-h-[3.25rem] items-center rounded-xl border border-line bg-surface"
                                >
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setQuantity((value) =>
                                                Math.max(1, value - 1),
                                            )
                                        }
                                        disabled={quantity <= 1}
                                        aria-label="Decrease quantity"
                                        className="flex size-12 items-center justify-center rounded-l-xl text-lg font-bold text-ink-muted transition-colors hover:bg-brand-soft hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        −
                                    </button>
                                    <span
                                        aria-live="polite"
                                        className="w-9 text-center text-sm font-extrabold text-ink tabular-nums"
                                    >
                                        {quantity}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setQuantity((value) =>
                                                Math.min(
                                                    maxQuantity,
                                                    value + 1,
                                                ),
                                            )
                                        }
                                        disabled={quantity >= maxQuantity}
                                        aria-label="Increase quantity"
                                        className="flex size-12 items-center justify-center rounded-r-xl text-lg font-bold text-ink-muted transition-colors hover:bg-brand-soft hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        +
                                    </button>
                                </div>
                                {product.stock > 0 && product.stock <= 5 && (
                                    <p className="mt-1.5 text-xs font-semibold text-ink-muted">
                                        Only {product.stock} available
                                    </p>
                                )}
                            </div>

                            <button
                                id="add-to-cart"
                                type="button"
                                disabled={product.stock === 0}
                                onClick={() => addProductToCart(quantity)}
                                className="flex min-h-[3.25rem] flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-coral px-8 text-sm font-extrabold text-surface transition-colors hover:bg-coral/90 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-alt focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-surface-alt disabled:text-ink-muted"
                            >
                                {product.stock === 0
                                    ? "Out of stock"
                                    : "Add to cart"}
                                <ArrowRight
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            </button>
                        </div>

                        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                            <Link
                                href={cartRoute().url}
                                className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-extrabold text-ink transition-colors hover:text-brand"
                            >
                                View cart
                                <ArrowRight
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            </Link>
                            <Link
                                href={productsRoute.index().url}
                                className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-bold text-ink-muted transition-colors hover:text-brand"
                            >
                                <ArrowLeft
                                    aria-hidden="true"
                                    className="size-4"
                                />
                                Back to the shelf
                            </Link>
                        </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <Note title="Delivery">
                            {product.shippingInformation ?? "Not specified."}{" "}
                            <Link
                                href="/policies/shipping"
                                className="font-semibold text-brand underline decoration-line underline-offset-4 hover:text-brand-deep"
                            >
                                Shipping policy
                            </Link>
                        </Note>
                        <Note title="Returns">
                            {product.returnPolicy ?? "Not specified."}{" "}
                            <Link
                                href="/policies/refund"
                                className="font-semibold text-brand underline decoration-line underline-offset-4 hover:text-brand-deep"
                            >
                                Refund policy
                            </Link>
                        </Note>
                        <Note title="Warranty">
                            {product.warrantyInformation ?? "Not specified."}
                        </Note>
                        <Note title="About this product">
                            Every detail here comes from your store catalogue.
                            Checkout and live delivery details arrive once
                            payment is connected.
                        </Note>
                    </div>
                </div>
            </section>

            <section className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="rounded-[2rem] bg-brand-deep p-6 text-surface sm:p-8">
                    <Heading level={2} size="section">
                        The ticket, in full
                    </Heading>
                    {product.description && (
                        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-surface/75 sm:text-base">
                            {product.description}
                        </p>
                    )}
                    <dl className="mt-7 grid gap-x-8 gap-y-5 sm:grid-cols-2">
                        {details.map(([label, value]) => (
                            <div
                                key={label}
                                className="border-t border-surface/20 pt-3"
                            >
                                <dt className="text-xs font-bold tracking-wide text-surface/60 uppercase">
                                    {label}
                                </dt>
                                <dd className="mt-1 text-sm font-bold text-surface">
                                    {value}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </div>

                <div className="rounded-[2rem] border border-line bg-surface p-6">
                    <Heading level={2} size="card">
                        Reviews
                    </Heading>
                    {reviews.length === 0 ? (
                        <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                            No reviews are attached to this product yet.
                        </p>
                    ) : (
                        <ul className="mt-5 space-y-5">
                            {reviews.slice(0, 3).map((review, index) => (
                                <li
                                    key={`${review.reviewerName}-${index}`}
                                    className="border-b border-line pb-5 last:border-0 last:pb-0"
                                >
                                    <div className="flex items-center gap-1">
                                        {Array.from(
                                            { length: 5 },
                                            (_, starIndex) => (
                                                <Star
                                                    key={starIndex}
                                                    aria-hidden="true"
                                                    className={`size-3.5 ${
                                                        starIndex <
                                                        Math.round(
                                                            review.rating,
                                                        )
                                                            ? "fill-star text-star"
                                                            : "text-line"
                                                    }`}
                                                />
                                            ),
                                        )}
                                    </div>
                                    <p className="mt-2 text-sm leading-relaxed text-ink">
                                        “{review.comment}”
                                    </p>
                                    <p className="mt-2 text-xs font-bold text-ink-muted">
                                        {review.reviewerName} ·{" "}
                                        {new Date(
                                            review.date,
                                        ).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </section>

            <section className="mt-14">
                <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <Heading level={2} size="section">
                            More from the same aisle
                        </Heading>
                        <p className="mt-2 text-sm text-ink-muted">
                            Other products worth a look.
                        </p>
                    </div>
                    <Link
                        href={productsRoute.index().url}
                        className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-extrabold text-brand transition-colors hover:text-brand-deep"
                    >
                        See the whole shelf
                        <ArrowRight aria-hidden="true" className="size-4" />
                    </Link>
                </div>

                {related.length === 0 ? (
                    <div className="mt-6 rounded-2xl border border-line bg-surface-alt px-6 py-10 text-center text-sm text-ink-muted">
                        No related products are available right now.
                    </div>
                ) : (
                    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
                        {related.map((item) => (
                            <ProductCard key={item.uuid} product={item} />
                        ))}
                    </div>
                )}
            </section>

            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface lg:hidden">
                <Container className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-extrabold tracking-wide text-ink-muted uppercase">
                            {product.title}
                        </p>
                        <p className="font-display text-lg font-extrabold text-ink tabular-nums">
                            {formatPrice(
                                product.discountedPrice * quantity,
                                currency,
                            )}
                        </p>
                    </div>
                    <button
                        id="add-to-cart-mobile"
                        type="button"
                        disabled={product.stock === 0}
                        onClick={() => addProductToCart(quantity)}
                        className="flex min-h-12 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-coral px-6 text-sm font-extrabold text-surface transition-colors hover:bg-coral/90 focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-surface-alt disabled:text-ink-muted"
                    >
                        Add to Cart
                    </button>
                </Container>
            </div>
        </Container>
    );
}
