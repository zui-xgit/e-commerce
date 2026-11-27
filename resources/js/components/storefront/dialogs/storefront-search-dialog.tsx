import { useEffect, useState, type ReactElement } from "react";
import { router } from "@inertiajs/react";
import { Star } from "lucide-react";
import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useSiteSettings } from "@/hooks/use-site-settings";
import productsRoute, { suggest as suggestRoute } from "@/routes/products";
import type { StorefrontProduct } from "@/types/storefront-catalog";
import { formatPrice } from "@/lib/storefront/format-price";

function SearchSkeleton() {
    return (
        <div className="space-y-1 p-1" aria-hidden="true">
            {[0, 1, 2].map((row) => (
                <div
                    key={row}
                    className="flex animate-pulse items-center gap-3 rounded-xl p-2"
                >
                    <div className="size-12 shrink-0 rounded-lg bg-surface-alt" />
                    <div className="flex-1 space-y-2">
                        <div className="h-3 w-2/3 rounded bg-surface-alt" />
                        <div className="h-2.5 w-1/3 rounded bg-surface-alt" />
                    </div>
                    <div className="h-3 w-14 rounded bg-surface-alt" />
                </div>
            ))}
        </div>
    );
}

export function StorefrontSearchDialog({
    children,
}: {
    children: ReactElement;
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [products, setProducts] = useState<StorefrontProduct[]>([]);
    const [status, setStatus] = useState<"loading" | "ready">("ready");
    const currency = useSiteSettings().currency;

    useEffect(() => {
        if (!open) return;

        const controller = new AbortController();
        const term = query.trim();

        const timer = window.setTimeout(
            () => {
                setStatus("loading");

                fetch(
                    suggestRoute.url({ query: term ? { q: term } : undefined }),
                    {
                        signal: controller.signal,
                        headers: { Accept: "application/json" },
                    },
                )
                    .then((response) => {
                        if (!response.ok) {
                            throw new Error(
                                `Search failed (${response.status})`,
                            );
                        }
                        return response.json();
                    })
                    .then(
                        (
                            payload:
                                | StorefrontProduct[]
                                | { data: StorefrontProduct[] },
                        ) => {
                            setProducts(
                                Array.isArray(payload) ? payload : payload.data,
                            );
                            setStatus("ready");
                        },
                    )
                    .catch((error: unknown) => {
                        if (
                            error instanceof Error &&
                            error.name === "AbortError"
                        ) {
                            return;
                        }
                        setProducts([]);
                        setStatus("ready");
                    });
            },
            term ? 250 : 0,
        );

        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [open, query]);

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);
        if (!nextOpen) {
            setQuery("");
        }
    };

    const term = query.trim();

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>

            <DialogContent className="storefront top-[10vh] block w-[min(92vw,56rem)] max-w-[min(92vw,56rem)] translate-y-0 rounded-xl border border-line bg-surface p-0 text-ink shadow-2xl sm:max-w-[min(92vw,56rem)] [&_[data-slot=command-input-wrapper]]:border-line [&_[data-slot=command-input-wrapper]]:focus-within:border-brand [&_[data-slot=command-input-wrapper]_svg]:text-brand-deep [&>button]:text-ink-muted [&>button]:hover:bg-surface-alt [&>button]:hover:text-brand-deep">
                <DialogHeader className="sr-only">
                    <DialogTitle>Search products</DialogTitle>
                    <DialogDescription>
                        Search the Shophub catalogue.
                    </DialogDescription>
                </DialogHeader>

                <Command
                    shouldFilter={false}
                    className="storefront rounded-2xl bg-surface text-ink"
                >
                    <CommandInput
                        autoFocus
                        value={query}
                        onValueChange={setQuery}
                        placeholder="Search products, brands or categories…"
                    />

                    <CommandList className="storefront max-h-[24rem] p-2">
                        <p className="px-2 py-1.5 text-[11px] font-extrabold tracking-wide text-ink-muted uppercase">
                            {term ? "Matching products" : "Popular right now"}
                        </p>

                        {status === "loading" ? (
                            <SearchSkeleton />
                        ) : (
                            <>
                                <CommandEmpty className="storefront py-10 text-center text-sm text-ink-muted">
                                    {term
                                        ? `No products match “${term}”. Try another search.`
                                        : "No products are on the shelf yet."}
                                </CommandEmpty>
                                {products.map((product) => (
                                    <CommandItem
                                        key={product.uuid}
                                        value={product.title}
                                        onSelect={() => {
                                            handleOpenChange(false);
                                            router.visit(
                                                productsRoute.show({
                                                    product: product.uuid,
                                                }).url,
                                            );
                                        }}
                                        className="storefront flex items-center gap-3 rounded-xl px-3 py-2.5 data-[selected=true]:bg-brand-soft data-[selected=true]:text-brand-deep"
                                    >
                                        <img
                                            src={
                                                product.thumbnailUrl ??
                                                product.images?.[0]?.url ??
                                                undefined
                                            }
                                            alt=""
                                            aria-hidden="true"
                                            width={48}
                                            height={48}
                                            loading="lazy"
                                            className="size-12 shrink-0 rounded-lg bg-brand-soft object-contain"
                                        />
                                        <div className="min-w-0 flex-1">
                                            <p className="line-clamp-1 text-sm font-semibold">
                                                {product.title}
                                            </p>
                                            <p className="mt-0.5 line-clamp-1 text-xs text-ink-muted">
                                                {product.categoryName}
                                                {product.brand
                                                    ? ` · ${product.brand}`
                                                    : ""}
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-sm font-extrabold text-brand tabular-nums">
                                                {formatPrice(
                                                    product.discountedPrice,
                                                    currency,
                                                )}
                                            </p>
                                            <p className="mt-0.5 flex items-center justify-end gap-1 text-[11px] font-bold text-ink-muted">
                                                <Star
                                                    aria-hidden="true"
                                                    className="size-3 fill-star text-star"
                                                />
                                                <span className="tabular-nums">
                                                    {product.rating.toFixed(1)}
                                                </span>
                                            </p>
                                        </div>
                                    </CommandItem>
                                ))}
                            </>
                        )}
                    </CommandList>

                    <div className="storefront flex items-center justify-between gap-3 border-t border-line bg-surface-alt px-4 py-2.5 text-[11px] font-semibold text-ink-muted">
                        <span>Catalogue from your store</span>
                        <span className="hidden sm:inline">
                            Type to search · Enter to select · Esc to close
                        </span>
                    </div>
                </Command>
            </DialogContent>
        </Dialog>
    );
}
