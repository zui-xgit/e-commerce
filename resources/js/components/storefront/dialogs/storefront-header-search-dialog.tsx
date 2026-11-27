import { router, useHttp } from "@inertiajs/react";
import { Star } from "lucide-react";
import { useDebouncedCallback } from "use-debounce";
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
import type { StorefrontProduct } from "@/types/storefront-catalog";
import { formatPrice } from "@/lib/storefront/format-price";
import products from "@/routes/products";
import { ReactNode, useState } from "react";

type SearchResponse = { data: StorefrontProduct[] };

type UseHttpProps = { query: string };

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

export function StorefrontHeaderSearchDialog({
    children,
}: {
    children: ReactNode;
}) {
    const [open, setOpen] = useState(false);
    const currency = useSiteSettings().currency;

    const [searchResults, setSearchResults] = useState<StorefrontProduct[]>([]);

    const { data, setData, get, processing } = useHttp<UseHttpProps>({
        query: "",
    });

    const debouncedSearch = useDebouncedCallback(() => {
        get(products.suggest().url, {
            onSuccess: (response) => {
                const { data } = response as SearchResponse;
                setSearchResults(data);
            },
        });
    }, 500);

    const handleValueChange = (value: string) => {
        setData("query", value);
        debouncedSearch();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>

            <DialogContent className="storefront top-[10dvh] flex max-h-[calc(90dvh_-_2rem)] w-[min(92vw,56rem)] max-w-[min(92vw,56rem)] translate-y-0 flex-col overflow-hidden rounded-xl border border-line bg-surface p-0 text-ink shadow-2xl sm:max-w-[min(92vw,56rem)] [&_[data-slot=command-input-wrapper]]:border-line [&_[data-slot=command-input-wrapper]]:focus-within:border-brand [&_[data-slot=command-input-wrapper]_svg]:text-brand-deep [&_[data-slot=command-input-wrapper]]:shrink-0 [&>button]:text-ink-muted [&>button]:hover:bg-surface-alt [&>button]:hover:text-brand-deep">
                <DialogHeader className="sr-only">
                    <DialogTitle>Search products</DialogTitle>
                    <DialogDescription>
                        Search the Shophub catalogue.
                    </DialogDescription>
                </DialogHeader>

                <Command
                    shouldFilter={false}
                    className="storefront h-auto min-h-0 flex-auto flex-col overflow-hidden rounded-2xl bg-surface text-ink"
                >
                    <CommandInput
                        autoFocus
                        value={data.query}
                        onValueChange={handleValueChange}
                        placeholder="Search products, brands or categories…"
                    />

                    <CommandList className="storefront max-h-none min-h-0 flex-auto overflow-x-hidden overflow-y-auto p-2">
                        <p className="px-2 py-1.5 text-[11px] font-extrabold tracking-wide text-ink-muted uppercase">
                            {data.query
                                ? "Matching products"
                                : "Popular right now"}
                        </p>

                        {processing ? (
                            <SearchSkeleton />
                        ) : (
                            <>
                                <CommandEmpty className="storefront py-10 text-center text-sm text-ink-muted">
                                    {data.query
                                        ? `No products match “${data.query}”. Try another search.`
                                        : "No products are on the shelf yet."}
                                </CommandEmpty>
                                {searchResults.map((result) => (
                                    <CommandItem
                                        key={result.uuid}
                                        value={result.title}
                                        onSelect={() => {
                                            setOpen(false);
                                            router.visit(
                                                products.show({
                                                    product: result.uuid,
                                                }),
                                            );
                                        }}
                                        className="storefront flex items-center gap-3 rounded-xl px-3 py-2.5 data-[selected=true]:bg-brand-soft data-[selected=true]:text-brand-deep"
                                    >
                                        <img
                                            src={
                                                result.thumbnailUrl ??
                                                result.images?.[0]?.url ??
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
                                                {result.title}
                                            </p>
                                            <p className="mt-0.5 line-clamp-1 text-xs text-ink-muted">
                                                {result.categoryName}
                                                {result.brand
                                                    ? ` · ${result.brand}`
                                                    : ""}
                                            </p>
                                        </div>
                                        <div className="shrink-0 text-right">
                                            <p className="text-sm font-extrabold text-brand tabular-nums">
                                                {formatPrice(
                                                    result.discountedPrice,
                                                    currency,
                                                )}
                                            </p>
                                            <p className="mt-0.5 flex items-center justify-end gap-1 text-[11px] font-bold text-ink-muted">
                                                <Star
                                                    aria-hidden="true"
                                                    className="size-3 fill-star text-star"
                                                />
                                                <span className="tabular-nums">
                                                    {result.rating.toFixed(1)}
                                                </span>
                                            </p>
                                        </div>
                                    </CommandItem>
                                ))}
                            </>
                        )}
                    </CommandList>

                    <div className="storefront flex shrink-0 items-center justify-between gap-3 border-t border-line bg-surface-alt px-4 py-2.5 text-[11px] font-semibold text-ink-muted">
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
