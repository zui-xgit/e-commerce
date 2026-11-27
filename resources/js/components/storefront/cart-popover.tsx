import { Link } from "@inertiajs/react";
import { ArrowRight, Minus, Plus, Trash2, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { useStorefrontCart } from "@/hooks/use-storefront-cart";
import { useStorefrontCartStore } from "@/hooks/stores/use-storefront-cart-store";

import { cart as cartRoute } from "@/routes";
import { formatPrice } from "@/lib/storefront/format-price";

export function CartPopover({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState<boolean>(false);
    const changeQuantity = useStorefrontCartStore((s) => s.changeQuantity);
    const setQuantity = useStorefrontCartStore((s) => s.setQuantity);
    const removeItem = useStorefrontCartStore((s) => s.removeItem);
    const clearCart = useStorefrontCartStore((s) => s.clearCart);

    const totalItems = useStorefrontCartStore((s) => s.getTotalItems());

    const currency = useSiteSettings().currency;
    const { items, isLoading, hasError } = useStorefrontCart();

    const [quantityDrafts, setQuantityDrafts] = useState<
        Record<string, string>
    >({});

    const total = items.reduce(
        (sum, item) => sum + item.product.discountedPrice * item.quantity,
        0,
    );

    const updateQuantity = (uuid: string, raw: string, stock: number) => {
        if (raw === "") {
            setQuantityDrafts((drafts) => ({ ...drafts, [uuid]: "" }));
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

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>{children}</PopoverTrigger>
            <PopoverContent
                align="end"
                sideOffset={12}
                collisionPadding={12}
                className="storefront w-[min(88vw,360px)] rounded-2xl border border-line bg-surface p-4 text-ink shadow-lg"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h2 className="font-display text-lg font-extrabold">
                            Your Cart
                        </h2>
                        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[11px] font-bold text-brand-deep tabular-nums">
                            {totalItems} {totalItems === 1 ? "item" : "items"}
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                        {items.length > 0 && (
                            <button
                                onClick={clearCart}
                                type="button"
                                className="flex h-9 items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-ink-muted hover:bg-surface-alt hover:text-brand"
                            >
                                <Trash2
                                    aria-hidden="true"
                                    className="size-3.5"
                                />
                                Clear cart
                            </button>
                        )}

                        <button
                            onClick={() => setOpen(false)}
                            type="button"
                            aria-label="Close cart"
                            className="flex size-9 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-alt"
                        >
                            <X aria-hidden="true" className="size-4" />
                        </button>
                    </div>
                </div>

                {isLoading ? (
                    <>
                        <p role="status" className="sr-only">
                            Loading your cart…
                        </p>
                        <div aria-hidden="true" className="mt-3 space-y-3">
                            {[0, 1].map((index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3"
                                >
                                    <div className="size-12 shrink-0 rounded-lg bg-surface-alt motion-safe:animate-pulse" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3 w-3/4 rounded-full bg-surface-alt motion-safe:animate-pulse" />
                                        <div className="h-3 w-1/3 rounded-full bg-surface-alt motion-safe:animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                ) : hasError ? (
                    <p role="alert" className="py-6 text-sm text-error">
                        Couldn't load your cart. Please try again.
                    </p>
                ) : items.length === 0 ? (
                    <p className="py-6 text-sm text-ink-muted">
                        Nothing in here yet. Add something from the shelf.
                    </p>
                ) : (
                    <ul className="mt-3 max-h-64 space-y-3 overflow-y-auto">
                        {items.map((item) => {
                            const atStock = item.quantity >= item.product.stock;

                            return (
                                <li
                                    key={item.product.uuid}
                                    className="flex items-center gap-3"
                                >
                                    <img
                                        src={item.product.thumbnailUrl ?? undefined}
                                        alt=""
                                        aria-hidden="true"
                                        width={48}
                                        height={48}
                                        loading="lazy"
                                        className="size-12 rounded-lg bg-surface-alt object-contain"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="line-clamp-1 text-xs font-semibold">
                                            {item.product.title}
                                        </p>
                                        <p className="text-xs font-bold text-brand tabular-nums">
                                            {formatPrice(
                                                item.product.discountedPrice,
                                                currency,
                                            )}
                                        </p>
                                    </div>
                                    <div className="flex items-center rounded-lg border border-line">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                changeQuantity(
                                                    item.product.uuid,
                                                    -1,
                                                )
                                            }
                                            aria-label={`Remove one ${item.product.title}`}
                                            className="flex size-8 items-center justify-center text-ink-muted hover:text-brand"
                                        >
                                            <Minus
                                                aria-hidden="true"
                                                className="size-3.5"
                                            />
                                        </button>
                                        <input
                                            type="number"
                                            inputMode="numeric"
                                            min={1}
                                            max={item.product.stock}
                                            value={
                                                quantityDrafts[
                                                    item.product.uuid
                                                ] ?? String(item.quantity)
                                            }
                                            onChange={(event) =>
                                                updateQuantity(
                                                    item.product.uuid,
                                                    event.target.value,
                                                    item.product.stock,
                                                )
                                            }
                                            onBlur={() =>
                                                clearQuantityDraft(
                                                    item.product.uuid,
                                                )
                                            }
                                            aria-label={`Quantity for ${item.product.title}`}
                                            className="w-8 bg-transparent text-center text-xs font-bold tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                changeQuantity(
                                                    item.product.uuid,
                                                    1,
                                                )
                                            }
                                            disabled={atStock}
                                            aria-label={
                                                atStock
                                                    ? `${item.product.title} is at its stock limit`
                                                    : `Add one ${item.product.title}`
                                            }
                                            className="flex size-8 items-center justify-center text-ink-muted transition-colors hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            <Plus
                                                aria-hidden="true"
                                                className="size-3.5"
                                            />
                                        </button>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeItem(item.product.uuid)
                                        }
                                        aria-label={`Remove ${item.product.title} from cart`}
                                        className="flex size-7 shrink-0 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-alt hover:text-error"
                                    >
                                        <Trash2
                                            aria-hidden="true"
                                            className="size-3.5"
                                        />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                )}

                <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-sm font-bold">
                    <span>Subtotal</span>
                    <span className="tabular-nums">
                        {formatPrice(total, currency)}
                    </span>
                </div>
                <Link
                    // href={}
                    href={cartRoute().url}
                    onClick={() => setOpen(false)}
                    className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand text-sm font-extrabold text-surface transition-colors hover:bg-brand-deep"
                >
                    Go to cart
                    <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
            </PopoverContent>
        </Popover>
    );
}
