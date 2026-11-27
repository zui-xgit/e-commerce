import { useEffect, useMemo, useRef, useState, type TouchEvent } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Container } from '@/components/storefront/container';
import { Heading } from '@/components/storefront/heading';
import { cn } from '@/lib/utils';
import type { StorefrontBanner } from '@/types/storefront-banners';

const AUTOPLAY_DELAY = 6000;
const SWIPE_THRESHOLD = 48;

type HeroBannerProps = {
    banners: StorefrontBanner[];
    categoryCount: number;
    productCount: number;
    onBrowse: () => void;
    className?: string;
};

export function HeroBanner({
    banners,
    categoryCount,
    productCount,
    onBrowse,
    className,
}: HeroBannerProps) {
    const [activeBanner, setActiveBanner] = useState(0);
    const [isBannerHovered, setIsBannerHovered] = useState(false);
    const [isBannerFocused, setIsBannerFocused] = useState(false);
    const touchStart = useRef<{ x: number; y: number } | null>(null);

    const slides = useMemo(
        () =>
            banners
                .filter((banner) => banner.image_url)
                .map((banner) => ({
                    uuid: banner.uuid,
                    image: banner.image_url as string,
                    alt: `${banner.title} banner`,
                })),
        [banners],
    );
    const slideCount = slides.length;

    useEffect(() => {
        setActiveBanner((current) => (current < slideCount ? current : 0));
    }, [slideCount]);

    const goToBanner = (direction: -1 | 1) => {
        if (slideCount === 0) {
            return;
        }

        setActiveBanner(
            (current) => (current + direction + slideCount) % slideCount,
        );
    };

    useEffect(() => {
        if (slideCount <= 1 || isBannerHovered || isBannerFocused) {
            return;
        }

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        const timer = window.setTimeout(() => {
            setActiveBanner((current) => (current + 1) % slideCount);
        }, AUTOPLAY_DELAY);

        return () => window.clearTimeout(timer);
    }, [activeBanner, isBannerFocused, isBannerHovered, slideCount]);

    const handleTouchStart = (event: TouchEvent<HTMLElement>) => {
        if (
            event.touches.length !== 1 ||
            (event.target as HTMLElement).closest('button, a')
        ) {
            touchStart.current = null;
            return;
        }

        const touch = event.touches[0];
        touchStart.current = { x: touch.clientX, y: touch.clientY };
    };

    const handleTouchEnd = (event: TouchEvent<HTMLElement>) => {
        const start = touchStart.current;
        touchStart.current = null;

        if (!start || event.changedTouches.length !== 1) {
            return;
        }

        const touch = event.changedTouches[0];
        const deltaX = touch.clientX - start.x;
        const deltaY = touch.clientY - start.y;

        if (
            Math.abs(deltaX) < SWIPE_THRESHOLD ||
            Math.abs(deltaX) < Math.abs(deltaY) * 1.2
        ) {
            return;
        }

        goToBanner(deltaX < 0 ? 1 : -1);
    };

    return (
        <Container className={cn('pt-6 sm:pt-8', className)}>
            <section
                id="hero-carousel"
                aria-roledescription="carousel"
                aria-label="Featured collections"
                onMouseEnter={() => setIsBannerHovered(true)}
                onMouseLeave={() => setIsBannerHovered(false)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchCancel={() => {
                    touchStart.current = null;
                }}
                onFocusCapture={(event) => {
                    if (
                        (event.target as HTMLElement).matches(':focus-visible')
                    ) {
                        setIsBannerFocused(true);
                    }
                }}
                onBlurCapture={(event) => {
                    if (
                        !event.currentTarget.contains(
                            event.relatedTarget as Node | null,
                        )
                    ) {
                        setIsBannerFocused(false);
                    }
                }}
                className="group relative touch-pan-y overflow-hidden rounded-[2rem] bg-brand-deep shadow-lg"
            >
                {slides.map((slide, index) => (
                    <img
                        key={slide.uuid}
                        src={slide.image}
                        alt={slide.alt}
                        aria-hidden={index !== activeBanner}
                        fetchPriority={index === 0 ? 'high' : undefined}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                        className={`absolute inset-0 size-full object-cover transition-opacity duration-700 ease-out motion-reduce:transition-none ${
                            index === activeBanner ? 'opacity-100' : 'opacity-0'
                        }`}
                    />
                ))}

                <div
                    aria-hidden="true"
                    className="absolute inset-0 bg-gradient-to-r from-brand-deep/95 via-brand-deep/70 to-brand-deep/20"
                />

                {slideCount > 1 && (
                    <>
                        <button
                            type="button"
                            aria-label="Previous banner"
                            aria-controls="hero-carousel"
                            onClick={() => goToBanner(-1)}
                            className="absolute top-1/2 left-3 z-20 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-surface/40 bg-surface/90 text-ink shadow-md transition duration-200 hover:border-brand hover:text-brand focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 focus-visible:ring-offset-brand-deep focus-visible:outline-none sm:pointer-events-none sm:grid sm:opacity-0 sm:group-focus-within:pointer-events-auto sm:group-focus-within:opacity-100 sm:group-hover:pointer-events-auto sm:group-hover:opacity-100"
                        >
                            <ChevronLeft
                                aria-hidden="true"
                                className="size-5"
                            />
                        </button>
                        <button
                            type="button"
                            aria-label="Next banner"
                            aria-controls="hero-carousel"
                            onClick={() => goToBanner(1)}
                            className="absolute top-1/2 right-3 z-20 hidden size-11 -translate-y-1/2 place-items-center rounded-full border border-surface/40 bg-surface/90 text-ink shadow-md transition duration-200 hover:border-brand hover:text-brand focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 focus-visible:ring-offset-brand-deep focus-visible:outline-none sm:pointer-events-none sm:grid sm:opacity-0 sm:group-focus-within:pointer-events-auto sm:group-focus-within:opacity-100 sm:group-hover:pointer-events-auto sm:group-hover:opacity-100"
                        >
                            <ChevronRight
                                aria-hidden="true"
                                className="size-5"
                            />
                        </button>
                    </>
                )}

                <div className="relative z-10 flex min-h-[540px] flex-col justify-center p-6 sm:p-10 lg:min-h-[560px] lg:p-12">
                    <div className="max-w-2xl">
                        <Heading level={1} size="display" tone="surface">
                            Shop the{' '}
                            <span className="text-mint">good stuff.</span>
                        </Heading>
                        <p className="mt-5 max-w-md text-base leading-relaxed text-surface/80">
                            {productCount} products. {categoryCount} categories.
                            One bright, easy place to find what you need.
                        </p>

                        <div className="mt-8 flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={onBrowse}
                                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-coral px-7 text-sm font-extrabold text-surface transition-colors hover:bg-coral/90 focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 focus-visible:ring-offset-brand-deep focus-visible:outline-none"
                            >
                                Browse the shelf
                                <ArrowRight
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            </button>
                        </div>

                        <p className="mt-6 flex items-center gap-2 text-xs font-semibold text-surface/70">
                            <span
                                aria-hidden="true"
                                className="size-2 rounded-full bg-mint"
                            />
                            Catalogue from your store · Prices in USD
                        </p>
                    </div>
                </div>

                {slideCount > 0 && (
                    <p className="sr-only" aria-live="polite">
                        Showing banner {activeBanner + 1} of {slideCount}:{' '}
                        {slides[activeBanner]?.alt}
                    </p>
                )}

                {slideCount > 1 && (
                    <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1">
                        {slides.map((slide, index) => (
                            <button
                                key={slide.uuid}
                                type="button"
                                aria-label={`Go to banner ${index + 1}`}
                                aria-current={index === activeBanner}
                                onClick={() => setActiveBanner(index)}
                                className="grid size-11 place-items-center rounded-full focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 focus-visible:ring-offset-brand-deep focus-visible:outline-none"
                            >
                                <span
                                    aria-hidden="true"
                                    className={`h-2.5 rounded-full transition-all duration-300 ${
                                        index === activeBanner
                                            ? 'w-7 bg-mint'
                                            : 'w-2.5 bg-surface/60 hover:bg-surface'
                                    }`}
                                />
                            </button>
                        ))}
                    </div>
                )}

                <div className="absolute right-6 bottom-6 z-10 hidden size-24 -rotate-6 flex-col items-center justify-center rounded-full bg-mint text-ink shadow-lg sm:flex">
                    <strong className="font-display text-3xl leading-none font-extrabold">
                        {categoryCount || 24}
                    </strong>
                    <span className="mt-1 text-[11px] font-extrabold tracking-wide uppercase">
                        categories
                    </span>
                </div>
            </section>
        </Container>
    );
}
