import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const SCROLL_THRESHOLD = 400;

/**
 * A quiet, circular control that returns shoppers to the top of the storefront.
 * It stays above the fixed mobile action bar and steps aside while a toast owns
 * the bottom-right corner, so it never stacks on top of another floating layer.
 */
export function BackToTop() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [hasVisibleToast, setHasVisibleToast] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > SCROLL_THRESHOLD);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        // Sonner renders in a portal with the highest stack level; hiding while a
        // toast is mounted is the only way to guarantee the two never collide.
        const syncToastState = () => {
            const toaster = document.querySelector('[data-sonner-toaster]');

            setHasVisibleToast(
                Boolean(
                    toaster?.querySelector(
                        '[data-sonner-toast][data-mounted="true"]',
                    ),
                ),
            );
        };

        syncToastState();

        const observer = new MutationObserver(syncToastState);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['data-mounted'],
        });

        return () => observer.disconnect();
    }, []);

    const scrollToTop = () => {
        const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)',
        ).matches;

        window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
        });
    };

    const isVisible = isScrolled && !hasVisibleToast;

    return (
        <button
            type="button"
            aria-label="Back to top"
            onClick={scrollToTop}
            className={cn(
                'fixed right-4 bottom-24 z-40 flex size-11 cursor-pointer items-center justify-center rounded-full border border-line bg-surface text-brand-deep shadow-sm transition duration-200 ease-out',
                'hover:-translate-y-0.5 hover:border-brand hover:bg-brand hover:text-surface hover:shadow-lg',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:shadow-lg',
                'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
                'lg:right-6 lg:bottom-6',
                isVisible
                    ? 'translate-y-0 opacity-100'
                    : 'pointer-events-none translate-y-2 opacity-0',
            )}
        >
            <ArrowUp aria-hidden="true" className="size-5" />
        </button>
    );
}

export default BackToTop;
