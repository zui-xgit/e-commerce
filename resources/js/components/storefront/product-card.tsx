import { Link } from "@inertiajs/react";
import { Package, Plus, Star } from "lucide-react";
import productsRoute from "@/routes/products";
import { useStorefrontCartStore } from "@/hooks/stores/use-storefront-cart-store";
import type { StorefrontProduct } from "@/types/storefront-catalog";
import { storefrontToast } from "@/lib/storefront/storefront-toast";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { formatPrice } from "@/lib/storefront/format-price";

type ProductCardProps = {
    product: StorefrontProduct;
};

export function ProductCard({ product }: ProductCardProps) {
    const hasDiscount = product.discountPercentage >= 1 && product.savings > 0;
    const thumbnail =
        product.thumbnailUrl ?? product.images?.[0]?.url ?? undefined;

    const addToCart = useStorefrontCartStore((state) => state.addToCart);
    const cartQuantity = useStorefrontCartStore(
        (state) =>
            state.cart.find((item) => item.uuid === product.uuid)?.quantity ??
            0,
    );
    const currency = useSiteSettings().currency;

    const addProductToCart = () => {
        if (product.stock - cartQuantity < 1) {
            storefrontToast(
                `Maximum available quantity reached for ${product.title}`,
            );
            return;
        }

        addToCart(product.uuid);
        storefrontToast(`${product.title} added to cart`);
    };

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-shadow duration-300 focus-within:border-brand/40 motion-safe:focus-within:shadow-lg motion-safe:hover:shadow-lg">
            <Link
                href={productsRoute.show({ product: product.uuid }).url}
                aria-label={`View ${product.title}`}
                className="flex flex-1 flex-col rounded-t-2xl focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none focus-visible:ring-inset"
            >
                <div className="relative aspect-square overflow-hidden bg-brand-soft">
                    {thumbnail ? (
                        <img
                            src={thumbnail}
                            alt={product.title}
                            width={300}
                            height={300}
                            loading="lazy"
                            decoding="async"
                            className="h-full w-full object-contain p-3 transition-transform duration-300 motion-safe:group-focus-within:scale-105 motion-safe:group-hover:scale-105"
                        />
                    ) : (
                        <span className="flex size-full items-center justify-center text-brand/30">
                            <Package
                                aria-hidden="true"
                                className="size-12"
                            />
                        </span>
                    )}
                    {hasDiscount && (
                        <span className="absolute top-2 left-2 rounded-full bg-coral px-2.5 py-1 text-[11px] font-extrabold text-surface">
                            -{Math.round(product.discountPercentage)}%
                        </span>
                    )}
                </div>

                <div className="flex flex-1 flex-col gap-2 px-3 pt-3 sm:px-4 sm:pt-4">
                    <span className="text-[11px] font-bold tracking-wide text-brand uppercase">
                        {product.categoryName}
                    </span>

                    <h3 className="line-clamp-2 text-sm leading-snug font-semibold text-ink">
                        {product.title}
                    </h3>

                    <div className="mt-auto flex items-end justify-between gap-2 pt-1">
                        <div className="min-w-0">
                            <p className="truncate text-base font-extrabold text-ink tabular-nums">
                                {formatPrice(product.discountedPrice, currency)}
                            </p>
                            {hasDiscount && (
                                <p className="text-xs text-ink-muted tabular-nums line-through">
                                    {formatPrice(
                                        product.originalPrice,
                                        currency,
                                    )}
                                </p>
                            )}
                            <p
                                className={`mt-0.5 text-[11px] font-bold tabular-nums ${
                                    product.stock > 0
                                        ? "text-success"
                                        : "text-error"
                                }`}
                            >
                                {product.stock > 0
                                    ? `${product.stock} in stock`
                                    : "Out of stock"}
                            </p>
                        </div>

                        <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-ink-muted">
                            <Star
                                aria-hidden="true"
                                className="size-3.5 fill-star text-star"
                            />
                            <span className="tabular-nums">
                                {product.rating.toFixed(1)}
                            </span>
                        </span>
                    </div>
                </div>
            </Link>

            <div className="px-3 pb-3 sm:px-4 sm:pb-4">
                <button
                    type="button"
                    disabled={product.stock === 0}
                    onClick={addProductToCart}
                    aria-label={
                        product.stock === 0
                            ? `${product.title} is out of stock`
                            : `Add ${product.title} to cart`
                    }
                    className="mt-1 flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-brand px-3 text-sm font-bold text-surface transition-colors duration-200 hover:bg-brand-deep focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-surface-alt disabled:text-ink-muted"
                >
                    <Plus aria-hidden="true" className="size-4" />
                    {product.stock === 0 ? "Out of stock" : "Add to cart"}
                </button>
            </div>
        </article>
    );
}
