import { useEffect, useState, type ReactNode } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { ChevronDown, Search, SlidersHorizontal, Star, X } from "lucide-react";
import { toast } from "sonner";
import { StorefrontBreadcrumbs } from "@/components/storefront/breadcrumbs";
import { Container } from "@/components/storefront/container";
import { Heading } from "@/components/storefront/heading";
import { PageHeader } from "@/components/storefront/page-header";
import { ProductCard } from "@/components/storefront/product-card";
import { ProductCardSkeleton } from "@/components/storefront/product-card-skeleton";
import { ProductFilters } from "@/components/storefront/product-filters";
import { ProductFiltersSheet } from "@/components/storefront/sheets/product-filters-sheet";
import { useSiteSettings } from "@/hooks/use-site-settings";
import { useStorefrontCart } from "@/hooks/use-storefront-cart";
import { useStorefrontCartStore } from "@/hooks/stores/use-storefront-cart-store";
import { cart as cartRoute } from "@/routes";
import productsRoute from "@/routes/products";
import type {
    PaginatedProducts,
    StorefrontCategory,
    StorefrontProduct,
    StorefrontSortOption,
} from "@/types/storefront-catalog";
import { formatPrice } from "@/lib/storefront/format-price";
import { storefrontToast } from "@/lib/storefront/storefront-toast";

type SortOption = StorefrontSortOption;

type ProductsIndexProps = {
    products: PaginatedProducts;
    categories: StorefrontCategory[];
    featured: StorefrontProduct | null;
    filters: {
        search: string;
        category: string;
        sort: SortOption;
    };
    counts: { products: number; categories: number };
};

const SORT_LABELS: Record<SortOption, string> = {
    recommended: "Recommended",
    "price-asc": "Price: low to high",
    "price-desc": "Price: high to low",
    rating: "Top rated",
};

function ShelfState({
    title,
    description,
    action,
}: {
    title: string;
    description: string;
    action?: ReactNode;
}) {
    return (
        <div className="rounded-[2rem] border border-line bg-surface-alt px-6 py-14 text-center sm:py-20">
            <Heading level={3} size="section">
                {title}
            </Heading>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted sm:text-base">
                {description}
            </p>
            {action}
        </div>
    );
}

function cleanPaginationLabel(label: string) {
    return label.replace(/&laquo;|&raquo;/g, "").trim();
}

export default function StorefrontProductsIndexPage() {
    const { products, categories, featured, filters, counts } =
        usePage<ProductsIndexProps>().props;
    const currency = useSiteSettings().currency;

    const addToCart = useStorefrontCartStore((state) => state.addToCart);
    const { items: cartItems } = useStorefrontCart();

    const [searchInput, setSearchInput] = useState(filters.search);
    const [loading, setLoading] = useState(false);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const navigate = (next: {
        search?: string;
        category?: string;
        sort?: SortOption;
        page?: number;
    }) => {
        const search = next.search ?? filters.search;
        const category = next.category ?? filters.category;
        const sort = next.sort ?? filters.sort;
        const query: Record<string, string> = {};

        if (search.trim()) query.search = search.trim();
        if (category) query.category = category;
        if (sort !== "recommended") query.sort = sort;
        if (next.page && next.page > 1) query.page = String(next.page);

        router.get(
            productsRoute.index.url({
                query: Object.keys(query).length > 0 ? query : undefined,
            }),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                only: ["products", "filters"],
                onStart: () => setLoading(true),
                onFinish: () => setLoading(false),
            },
        );
    };

    useEffect(() => {
        if (searchInput.trim() === filters.search) return;

        const timer = window.setTimeout(
            () => navigate({ search: searchInput }),
            350,
        );

        return () => window.clearTimeout(timer);
    }, [searchInput, filters.search]);

    const hasFilters = Boolean(filters.search || filters.category);
    const activeFilterCount =
        Number(Boolean(filters.search.trim())) +
        Number(Boolean(filters.category));

    const activeCategoryLabel =
        categories.find((category) => category.uuid === filters.category)
            ?.name ?? filters.category;

    const activeFilters: { key: string; label: string; clear: () => void }[] =
        [];
    if (filters.search) {
        activeFilters.push({
            key: "query",
            label: `Search: ${filters.search}`,
            clear: () => {
                setSearchInput("");
                navigate({ search: "" });
            },
        });
    }
    if (filters.category) {
        activeFilters.push({
            key: "category",
            label: `Department: ${activeCategoryLabel}`,
            clear: () => navigate({ category: "" }),
        });
    }
    const clearFilters = () => {
        setSearchInput("");
        navigate({
            search: "",
            category: "",
            sort: "recommended",
        });
    };

    const addProductToCart = (product: StorefrontProduct) => {
        if (product.stock === 0) return;

        addToCart(product.uuid);

        storefrontToast(`${product.title} added to cart`);
    };

    const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartSubtotal = cartItems.reduce(
        (sum, item) => sum + item.product.discountedPrice * item.quantity,
        0,
    );
    const showCartRail = cartCount > 0;
    const showingFrom = products.meta.from ?? 0;
    const showingTo = products.meta.to ?? 0;

    return (
        <Container className={showCartRail ? "pb-28 lg:pb-20" : "pb-20"}>
            <StorefrontBreadcrumbs className="mb-5" />

            <PageHeader
                className="mt-2"
                title="The whole shelf"
                description="Search, narrow by department, sort, and open the full story, or add straight to your cart."
                action={
                    <p
                        role="status"
                        className="flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-xs font-extrabold text-ink-muted"
                    >
                        <span
                            aria-hidden="true"
                            className="size-2 rounded-full bg-mint"
                        />
                        {counts.products} products · USD
                    </p>
                }
            />

            {featured && (
                <section
                    id="featured"
                    aria-labelledby="featured-title"
                    className="mt-6 overflow-hidden rounded-3xl border border-line bg-brand-soft p-3 sm:p-5 lg:flex lg:items-center lg:gap-6"
                >
                    <Link
                        href={
                            productsRoute.show({ product: featured.uuid }).url
                        }
                        aria-label={`View ${featured.title}`}
                        className="block size-24 shrink-0 overflow-hidden rounded-2xl bg-surface focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none sm:size-32 lg:size-44"
                    >
                        <img
                            src={featured.thumbnailUrl ?? ""}
                            alt={featured.title}
                            width={300}
                            height={300}
                            loading="lazy"
                            decoding="async"
                            className="size-full object-contain p-2"
                        />
                    </Link>

                    <div className="mt-3 min-w-0 flex-1 lg:mt-0">
                        <p className="text-[11px] font-extrabold tracking-wide text-brand-deep uppercase">
                            Featured
                        </p>
                        <Heading
                            level={2}
                            size="card"
                            id="featured-title"
                            className="mt-1 line-clamp-2"
                        >
                            <Link
                                href={
                                    productsRoute.show({
                                        product: featured.uuid,
                                    }).url
                                }
                                className="hover:underline"
                            >
                                {featured.title}
                            </Link>
                        </Heading>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span className="font-display text-xl font-extrabold text-ink tabular-nums">
                                {formatPrice(
                                    featured.discountedPrice,
                                    currency,
                                )}
                            </span>
                            {featured.savings > 0 && (
                                <span className="text-sm text-ink-muted tabular-nums line-through">
                                    {formatPrice(
                                        featured.originalPrice,
                                        currency,
                                    )}
                                </span>
                            )}
                            <span className="flex items-center gap-1 text-sm font-bold text-ink-muted">
                                <Star
                                    aria-hidden="true"
                                    className="size-4 fill-star text-star"
                                />
                                <span className="tabular-nums">
                                    {featured.rating.toFixed(1)}
                                </span>
                            </span>
                            <span className="text-xs font-semibold text-ink-muted">
                                Prices in USD
                            </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                            <button
                                id="add-featured-to-cart-mobile"
                                type="button"
                                disabled={featured.stock === 0}
                                onClick={() => addProductToCart(featured)}
                                className="min-h-12 cursor-pointer rounded-xl bg-coral px-5 text-sm font-extrabold text-surface transition-colors hover:bg-brand-deep focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-brand-soft focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-surface-alt disabled:text-ink-muted"
                            >
                                {featured.stock === 0
                                    ? "Out of stock"
                                    : "Add to cart"}
                            </button>
                            <Link
                                href={
                                    productsRoute.show({
                                        product: featured.uuid,
                                    }).url
                                }
                                className="inline-flex min-h-12 items-center rounded-xl border border-line bg-surface px-5 text-sm font-extrabold text-ink transition-colors hover:border-brand hover:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-brand-soft focus-visible:outline-none"
                            >
                                View details
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            <section id="shelf" className="mt-8 scroll-mt-24 sm:mt-12">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
                    <aside
                        id="shelf-filters"
                        className="hidden lg:sticky lg:top-24 lg:block lg:w-64 lg:shrink-0"
                        aria-label="Product filters"
                    >
                        <div className="rounded-2xl border border-line bg-surface p-5 lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:overscroll-contain">
                            <div className="flex items-center justify-between gap-3">
                                <Heading level={2} size="compact">
                                    Narrow the shelf
                                </Heading>
                                <SlidersHorizontal
                                    aria-hidden="true"
                                    className="size-5 text-brand"
                                />
                            </div>

                            <ProductFilters
                                className="mt-5"
                                categories={categories}
                                value={{ category: filters.category }}
                                onChange={(next) => navigate(next)}
                            />

                            {hasFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="mt-6 min-h-11 w-full cursor-pointer rounded-xl border border-line text-sm font-extrabold text-ink transition-colors hover:border-brand hover:text-brand-deep focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    </aside>

                    <div className="min-w-0 flex-1">
                        <div className="mb-5">
                            <label
                                htmlFor="shelf-search"
                                className="block text-sm font-bold text-ink"
                            >
                                Search products
                            </label>
                            <div className="relative mt-2">
                                <Search
                                    aria-hidden="true"
                                    className="absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-muted"
                                />
                                <input
                                    id="shelf-search"
                                    type="search"
                                    value={searchInput}
                                    onChange={(event) =>
                                        setSearchInput(event.target.value)
                                    }
                                    placeholder="Try 'shoes' or 'watch'"
                                    className="min-h-14 w-full rounded-2xl border border-line bg-surface pr-4 pl-12 text-base text-ink placeholder:text-ink-muted focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none"
                                />
                            </div>
                        </div>

                        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <div className="flex min-w-0 items-center gap-3">
                                <ProductFiltersSheet
                                    open={filtersOpen}
                                    onOpenChange={setFiltersOpen}
                                    activeFilterCount={activeFilterCount}
                                    categories={categories}
                                    filters={{ category: filters.category }}
                                    onApply={(values) => navigate(values)}
                                />
                                <p
                                    aria-live="polite"
                                    className="min-w-0 text-sm font-semibold text-ink-muted"
                                >
                                    {loading
                                        ? "Updating the shelf…"
                                        : `${showingFrom}–${showingTo} of ${products.meta.total} products shown`}
                                </p>
                            </div>

                            <div className="flex items-center gap-2 sm:ml-auto">
                                <label
                                    htmlFor="shelf-sort"
                                    className="text-sm font-bold text-ink"
                                >
                                    Sort
                                </label>
                                <div className="relative w-full sm:w-auto">
                                    <select
                                        id="shelf-sort"
                                        value={filters.sort}
                                        onChange={(event) =>
                                            navigate({
                                                sort: event.target
                                                    .value as SortOption,
                                            })
                                        }
                                        className="min-h-11 w-full appearance-none rounded-xl border border-line bg-surface py-2 pr-10 pl-4 text-sm font-bold text-ink focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none sm:w-auto"
                                    >
                                        {Object.entries(SORT_LABELS).map(
                                            ([value, label]) => (
                                                <option
                                                    key={value}
                                                    value={value}
                                                >
                                                    {label}
                                                </option>
                                            ),
                                        )}
                                    </select>
                                    <ChevronDown
                                        aria-hidden="true"
                                        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-muted"
                                    />
                                </div>
                            </div>
                        </div>

                        {activeFilters.length > 0 && (
                            <div
                                aria-label="Active filters"
                                className="mb-5 flex flex-wrap items-center gap-2"
                            >
                                {activeFilters.map((filter) => (
                                    <button
                                        key={filter.key}
                                        type="button"
                                        onClick={filter.clear}
                                        aria-label={`Remove ${filter.label} filter`}
                                        className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-xs font-bold text-ink transition-colors hover:border-brand hover:text-brand"
                                    >
                                        <span>{filter.label}</span>
                                        <X
                                            aria-hidden="true"
                                            className="size-3.5"
                                        />
                                    </button>
                                ))}
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="min-h-11 px-2 text-xs font-extrabold text-brand underline underline-offset-4"
                                >
                                    Clear all
                                </button>
                            </div>
                        )}

                        {loading ? (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4">
                                {Array.from({ length: 8 }, (_, index) => (
                                    <ProductCardSkeleton key={index} />
                                ))}
                            </div>
                        ) : products.data.length === 0 ? (
                            <ShelfState
                                title={
                                    hasFilters
                                        ? "No products match these filters"
                                        : "The shelf is empty"
                                }
                                description={
                                    hasFilters
                                        ? "Try another department or a shorter search."
                                        : "Products will appear here once the catalogue has active items."
                                }
                                action={
                                    hasFilters ? (
                                        <button
                                            type="button"
                                            onClick={clearFilters}
                                            className="mt-6 min-h-12 rounded-xl bg-brand px-6 text-sm font-extrabold text-surface transition-colors hover:bg-brand-deep"
                                        >
                                            Reset the shelf
                                        </button>
                                    ) : undefined
                                }
                            />
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 xl:grid-cols-4">
                                    {products.data.map((product) => (
                                        <ProductCard
                                            key={product.uuid}
                                            product={product}
                                        />
                                    ))}
                                </div>

                                {products.links.length > 1 && (
                                    <nav
                                        aria-label="Product pages"
                                        className="mt-8 flex flex-wrap justify-center gap-2"
                                    >
                                        {products.links.map((link, index) => (
                                            <button
                                                key={`${link.label}-${index}`}
                                                type="button"
                                                disabled={!link.url}
                                                aria-current={
                                                    link.active
                                                        ? "page"
                                                        : undefined
                                                }
                                                onClick={() => {
                                                    if (!link.url) return;

                                                    router.visit(link.url, {
                                                        preserveState: true,
                                                        preserveScroll: true,
                                                        only: [
                                                            "products",
                                                            "filters",
                                                        ],
                                                        onStart: () =>
                                                            setLoading(true),
                                                        onFinish: () =>
                                                            setLoading(false),
                                                    });
                                                }}
                                                className={`min-h-11 rounded-xl px-4 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                                                    link.active
                                                        ? "bg-brand text-surface"
                                                        : "border border-line bg-surface text-ink hover:border-brand hover:text-brand"
                                                }`}
                                            >
                                                {cleanPaginationLabel(
                                                    link.label,
                                                )}
                                            </button>
                                        ))}
                                    </nav>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </section>

            <p className="mt-10 flex items-center gap-2 text-xs font-semibold text-ink-muted">
                <span
                    aria-hidden="true"
                    className="size-2 rounded-full bg-mint"
                />
                Catalogue from your store · Prices stay in USD until a display
                currency is chosen.
            </p>

            {showCartRail && (
                <div
                    className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface lg:hidden"
                    aria-label="Cart summary"
                >
                    <Container className="flex items-center gap-3 py-3">
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-[11px] font-extrabold tracking-wide text-ink-muted uppercase">
                                In your cart · {cartCount}{" "}
                                {cartCount === 1 ? "item" : "items"}
                            </p>
                            <p className="font-display text-lg font-extrabold text-ink tabular-nums">
                                {formatPrice(cartSubtotal, currency)}
                            </p>
                        </div>
                        <Link
                            href={cartRoute().url}
                            className="flex min-h-12 shrink-0 items-center rounded-xl bg-brand px-5 text-sm font-extrabold text-surface transition-colors hover:bg-brand-deep"
                        >
                            View Cart
                        </Link>
                    </Container>
                </div>
            )}
        </Container>
    );
}
