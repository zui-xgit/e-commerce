import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { BannerTile } from '@/components/storefront/banner-tile';
import { CategoryTile } from '@/components/storefront/category-tile';
import { Container } from '@/components/storefront/container';
import { Heading } from '@/components/storefront/heading';
import { HeroBanner } from '@/components/storefront/hero-banner';
import { ProductCard } from '@/components/storefront/product-card';
import { ProductCardSkeleton } from '@/components/storefront/product-card-skeleton';
import { SectionHeading } from '@/components/storefront/section-heading';
import { home as homeRoute } from '@/routes';
import productsRoute from '@/routes/products';
import bannerImages from '@/assets/banners';
import type { StorefrontBanner } from '@/types/storefront-banners';
import type {
    PaginatedProducts,
    StorefrontCategory,
    StorefrontProduct,
} from '@/types/storefront-catalog';

type SortOption =
    | 'newest'
    | 'recommended'
    | 'price-asc'
    | 'price-desc'
    | 'rating';

type HomeProps = {
    banners: StorefrontBanner[];
    categories: StorefrontCategory[];
    featured: StorefrontProduct[];
    products: PaginatedProducts;
    filters: { category: string; sort: SortOption };
    counts: { products: number; categories: number; featured: number };
};

const SORT_LABELS: Record<SortOption, string> = {
    newest: 'Newest first',
    recommended: 'Recommended',
    'price-asc': 'Price: low to high',
    'price-desc': 'Price: high to low',
    rating: 'Top rated',
};

function cleanPaginationLabel(label: string) {
    return label.replace(/&laquo;|&raquo;/g, '').trim();
}

export default function Home() {
    const { banners, categories, featured, products, filters, counts } =
        usePage<HomeProps>().props;

    const [loading, setLoading] = useState(false);
    const productsRef = useRef<HTMLElement>(null);
    const categoriesRef = useRef<HTMLDivElement>(null);
    const [canScrollCategoriesLeft, setCanScrollCategoriesLeft] =
        useState(false);
    const [canScrollCategoriesRight, setCanScrollCategoriesRight] =
        useState(false);

    const activeCategory = filters.category || null;
    const sort = filters.sort || 'newest';

    const categoryTiles = useMemo(
        () =>
            [...categories]
                .filter((category) => category.productCount > 0)
                .sort((a, b) => b.productCount - a.productCount)
                .slice(0, 8),
        [categories],
    );

    const navigate = (next: {
        category?: string | null;
        sort?: SortOption;
        page?: number;
    }) => {
        const category =
            next.category === undefined ? activeCategory : next.category;
        const nextSort = next.sort ?? sort;
        const query: Record<string, string> = {};

        if (category) query.category = category;
        if (nextSort !== 'newest') query.sort = nextSort;
        if (next.page && next.page > 1) query.page = String(next.page);

        router.get(
            homeRoute.url({
                query: Object.keys(query).length > 0 ? query : undefined,
            }),
            {},
            {
                preserveState: true,
                preserveScroll: true,
                only: ['products', 'filters'],
                onStart: () => setLoading(true),
                onFinish: () => setLoading(false),
            },
        );
    };

    const selectCategory = (
        uuid: string | null,
        options?: { scroll?: boolean },
    ) => {
        navigate({ category: uuid });

        if (options?.scroll) {
            productsRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            });
        }
    };

    const updateCategoryScrollState = () => {
        const element = categoriesRef.current;

        if (!element) return;

        setCanScrollCategoriesLeft(element.scrollLeft > 1);
        setCanScrollCategoriesRight(
            element.scrollLeft + element.clientWidth < element.scrollWidth - 1,
        );
    };

    useEffect(() => {
        updateCategoryScrollState();

        window.addEventListener('resize', updateCategoryScrollState);

        return () => {
            window.removeEventListener('resize', updateCategoryScrollState);
        };
    }, [categoryTiles.length]);

    const scrollCategories = (direction: -1 | 1) => {
        const element = categoriesRef.current;

        if (!element) return;

        const tile = element.querySelector<HTMLElement>('button');
        const step = tile
            ? tile.getBoundingClientRect().width + 12
            : element.clientWidth * 0.8;

        element.scrollBy({
            left: direction * step * 3,
            behavior: 'smooth',
        });
    };

    const activeCategoryLabel = activeCategory
        ? (categories.find((category) => category.uuid === activeCategory)
              ?.name ?? 'this department')
        : 'all departments';

    const showingFrom = products.meta.from ?? 0;
    const showingTo = products.meta.to ?? 0;

    return (
        <>
            <HeroBanner
                banners={banners}
                categoryCount={counts.categories}
                productCount={counts.products}
                onBrowse={() =>
                    productsRef.current?.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start',
                    })
                }
            />

            <Container>
                <section
                    id="categories"
                    className="scroll-mt-24 pt-12 sm:pt-16"
                >
                    <SectionHeading
                        title="Start with a category"
                        description="Pick a department and the shelf below narrows with you."
                        className="mb-6"
                        action={
                            <button
                                type="button"
                                onClick={() => selectCategory(null)}
                                className="inline-flex min-h-11 items-center gap-2 self-start rounded-xl border border-line px-4 text-sm font-bold text-ink transition-colors hover:border-brand hover:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none"
                            >
                                Show everything
                                <ArrowRight
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            </button>
                        }
                    />

                    <div className="group relative">
                        <button
                            type="button"
                            aria-label="Scroll categories backwards"
                            aria-controls="category-carousel"
                            onClick={() => scrollCategories(-1)}
                            disabled={!canScrollCategoriesLeft}
                            className="absolute top-1/2 left-0 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface text-ink shadow-md transition duration-200 hover:border-brand hover:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none disabled:cursor-not-allowed disabled:text-ink-muted disabled:shadow-none md:pointer-events-none md:grid md:opacity-0 md:group-focus-within:pointer-events-auto md:group-focus-within:opacity-100 md:group-hover:pointer-events-auto md:group-hover:opacity-100"
                        >
                            <ChevronLeft
                                aria-hidden="true"
                                className="size-5"
                            />
                        </button>

                        <div
                            id="category-carousel"
                            ref={categoriesRef}
                            onScroll={updateCategoryScrollState}
                            className="no-scrollbar -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 sm:gap-3 md:mx-0 md:px-14"
                        >
                            {categoryTiles.length > 0 ? (
                                categoryTiles.map((category, index) => (
                                    <CategoryTile
                                        key={category.uuid}
                                        name={category.name}
                                        thumbnail={category.thumbnailUrl ?? ''}
                                        active={
                                            activeCategory === category.uuid
                                        }
                                        tone={
                                            (
                                                [
                                                    'brand',
                                                    'coral',
                                                    'mint',
                                                ] as const
                                            )[index % 3]
                                        }
                                        onClick={() =>
                                            selectCategory(category.uuid, {
                                                scroll: true,
                                            })
                                        }
                                    />
                                ))
                            ) : (
                                <p className="px-4 py-4 text-sm text-ink-muted">
                                    No active categories have products yet.
                                </p>
                            )}
                        </div>

                        <button
                            type="button"
                            aria-label="Scroll categories forwards"
                            aria-controls="category-carousel"
                            onClick={() => scrollCategories(1)}
                            disabled={!canScrollCategoriesRight}
                            className="absolute top-1/2 right-0 z-10 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-surface text-ink shadow-md transition duration-200 hover:border-brand hover:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none disabled:cursor-not-allowed disabled:text-ink-muted disabled:shadow-none md:pointer-events-none md:grid md:opacity-0 md:group-focus-within:pointer-events-auto md:group-focus-within:opacity-100 md:group-hover:pointer-events-auto md:group-hover:opacity-100"
                        >
                            <ChevronRight
                                aria-hidden="true"
                                className="size-5"
                            />
                        </button>
                    </div>
                </section>
            </Container>

            <Container>
                <section
                    id="collections"
                    className="scroll-mt-24 pt-12 sm:pt-16"
                >
                    <SectionHeading
                        title="Three ways in"
                        description="Jump straight to a corner of the shop."
                        className="mb-6"
                    />
                    <div className="grid gap-4 sm:grid-cols-3">
                        <BannerTile
                            image={bannerImages.banner2}
                            alt="Category collection banner"
                            title="Every department"
                            description="Pick a category and keep the shelf in view."
                            href="#categories"
                            tone="brand"
                        />
                        <BannerTile
                            image={bannerImages.banner3}
                            alt="Featured products banner"
                            title="Top-rated finds"
                            description="Sort the shelf by rating and see what rises."
                            href={
                                productsRoute.index({
                                    query: { sort: 'rating' },
                                }).url
                            }
                            tone="coral"
                        />
                        <BannerTile
                            image={bannerImages.banner4}
                            alt="Everyday essentials banner"
                            title="Everyday picks"
                            description={`Browse all ${counts.products} products in one go.`}
                            href={productsRoute.index().url}
                            tone="mint"
                        />
                    </div>
                </section>
            </Container>

            <Container>
                <section className="pt-12 sm:pt-16">
                    <SectionHeading
                        title="Featured picks"
                        description="Products marked as featured in the catalogue."
                        className="mb-6"
                        action={
                            <Link
                                href={productsRoute.index().url}
                                className="inline-flex min-h-11 items-center gap-2 self-start rounded-xl text-sm font-extrabold text-brand transition-colors hover:text-brand-deep"
                            >
                                See the whole shelf
                                <ArrowRight
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            </Link>
                        }
                    />

                    {featured.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-5">
                            {featured.map((product) => (
                                <ProductCard
                                    key={product.uuid}
                                    product={product}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-3xl border border-line bg-surface-alt p-10 text-center">
                            <Heading level={3} size="card">
                                No featured picks yet
                            </Heading>
                            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
                                Nothing is marked as featured in the catalogue.
                                The newest products are waiting just below.
                            </p>
                        </div>
                    )}
                </section>
            </Container>

            <Container>
                <section
                    ref={productsRef}
                    id="products"
                    className="scroll-mt-24 pt-12 sm:pt-16"
                >
                    <SectionHeading
                        title="New on the shelf"
                        description={`Showing ${showingFrom}–${showingTo} of ${products.meta.total} products in ${activeCategoryLabel}. Prices in USD.`}
                        className="mb-6"
                    />

                    <div className="mb-6 flex flex-col gap-4">
                        <p className="sr-only" aria-live="polite">
                            {loading
                                ? 'Loading products.'
                                : `Showing ${showingFrom}–${showingTo} of ${products.meta.total} products in ${activeCategoryLabel}.`}
                        </p>

                        <div
                            className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
                            role="group"
                            aria-label="Filter products by category"
                        >
                            <button
                                type="button"
                                onClick={() => selectCategory(null)}
                                aria-pressed={activeCategory === null}
                                className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none ${
                                    activeCategory === null
                                        ? 'bg-brand text-surface'
                                        : 'border border-line bg-surface text-ink-muted hover:text-brand'
                                }`}
                            >
                                All products
                            </button>
                            {categoryTiles.map((category) => (
                                <button
                                    key={category.uuid}
                                    type="button"
                                    onClick={() =>
                                        selectCategory(category.uuid)
                                    }
                                    aria-pressed={
                                        activeCategory === category.uuid
                                    }
                                    className={`min-h-11 shrink-0 rounded-full px-4 text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none ${
                                        activeCategory === category.uuid
                                            ? 'bg-brand text-surface'
                                            : 'border border-line bg-surface text-ink-muted hover:text-brand'
                                    }`}
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-3 self-end">
                            <label
                                htmlFor="sort-products"
                                className="text-sm font-bold text-ink-muted"
                            >
                                Sort by
                            </label>
                            <div className="relative">
                                <select
                                    id="sort-products"
                                    value={sort}
                                    onChange={(event) =>
                                        navigate({
                                            sort: event.target
                                                .value as SortOption,
                                        })
                                    }
                                    className="min-h-11 appearance-none rounded-xl border border-line bg-surface py-2 pr-10 pl-4 text-sm font-semibold text-ink focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none"
                                >
                                    {Object.entries(SORT_LABELS).map(
                                        ([value, label]) => (
                                            <option key={value} value={value}>
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

                    {loading ? (
                        <div>
                            <p
                                role="status"
                                className="mb-3 text-sm font-semibold text-ink-muted"
                            >
                                Loading the shelf…
                            </p>
                            <div
                                aria-label="Loading products"
                                className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5"
                            >
                                {Array.from({ length: 4 }, (_, index) => (
                                    <ProductCardSkeleton key={index} />
                                ))}
                            </div>
                        </div>
                    ) : products.data.length === 0 ? (
                        <div className="rounded-3xl border border-line bg-surface-alt p-10 text-center">
                            <Heading level={3} size="card">
                                {activeCategory || sort !== 'newest'
                                    ? 'Nothing matched that'
                                    : 'The shelf is empty'}
                            </Heading>
                            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
                                {activeCategory || sort !== 'newest'
                                    ? 'Try another department or reset the sort order.'
                                    : 'Products will appear here once the catalogue has active items.'}
                            </p>
                            {(activeCategory || sort !== 'newest') && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate({
                                            category: null,
                                            sort: 'newest',
                                        })
                                    }
                                    className="mt-5 min-h-11 rounded-xl bg-brand px-5 text-sm font-bold text-surface transition-colors hover:bg-brand-deep focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-alt focus-visible:outline-none"
                                >
                                    Show everything
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
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
                                                link.active ? 'page' : undefined
                                            }
                                            onClick={() => {
                                                if (!link.url) return;

                                                router.visit(link.url, {
                                                    preserveState: true,
                                                    preserveScroll: true,
                                                    only: [
                                                        'products',
                                                        'filters',
                                                    ],
                                                    onStart: () =>
                                                        setLoading(true),
                                                    onFinish: () =>
                                                        setLoading(false),
                                                });
                                            }}
                                            className={`min-h-11 rounded-xl px-4 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                                                link.active
                                                    ? 'bg-brand text-surface'
                                                    : 'border border-line bg-surface text-ink hover:border-brand hover:text-brand'
                                            }`}
                                        >
                                            {cleanPaginationLabel(link.label)}
                                        </button>
                                    ))}
                                </nav>
                            )}
                        </>
                    )}
                </section>
            </Container>

            <Container>
                <section className="pt-12 sm:pt-16">
                    <div className="relative overflow-hidden rounded-[2rem] bg-ink">
                        <img
                            src={bannerImages.banner5}
                            alt="Closing collection banner"
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 size-full object-cover opacity-25"
                        />
                        <div className="relative flex flex-col gap-5 p-8 sm:p-14">
                            <SectionHeading
                                title="Good things, all together."
                                description="Every item here comes from your store catalogue. Prices stay in USD until a display currency is chosen."
                                tone="surface"
                                className="max-w-2xl"
                            />
                            <a
                                href="#top"
                                className="inline-flex min-h-11 w-fit items-center gap-2 rounded-xl bg-mint px-5 text-sm font-extrabold text-ink transition-colors hover:bg-mint/90 focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 focus-visible:ring-offset-ink focus-visible:outline-none"
                            >
                                Back to the top
                                <ArrowRight
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            </a>
                        </div>
                    </div>
                </section>
            </Container>
        </>
    );
}
