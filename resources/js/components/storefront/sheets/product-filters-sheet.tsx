import { useEffect, useState, type ReactElement } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { ProductFilters, type ProductFilterValues } from "../product-filters";
import type { StorefrontCategory } from "@/types/storefront-catalog";

export function ProductFiltersSheet({
    open,
    onOpenChange,
    activeFilterCount,
    categories,
    filters,
    onApply,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    activeFilterCount: number;
    categories: StorefrontCategory[];
    filters: ProductFilterValues;
    onApply: (values: ProductFilterValues) => void;
}) {
    const [draft, setDraft] = useState<ProductFilterValues>(filters);
    const { category } = filters;

    useEffect(() => {
        if (open) setDraft({ category });
    }, [open, category]);

    useEffect(() => {
        if (!open) return;

        const desktop = window.matchMedia("(min-width: 1024px)");
        const closeOnDesktop = () => {
            if (desktop.matches) onOpenChange(false);
        };

        closeOnDesktop();
        desktop.addEventListener("change", closeOnDesktop);

        return () => desktop.removeEventListener("change", closeOnDesktop);
    }, [open, onOpenChange]);

    const hasDraftFilters = Boolean(draft.category);

    const apply = () => {
        onApply(draft);
        onOpenChange(false);
    };

    const trigger: ReactElement = (
        <button
            type="button"
            aria-haspopup="dialog"
            className="inline-flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface px-4 text-sm font-extrabold text-ink transition-colors hover:border-brand hover:text-brand-deep focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none lg:hidden"
        >
            <SlidersHorizontal
                aria-hidden="true"
                className="size-4 text-brand"
            />
            Filters
            {activeFilterCount > 0 && (
                <span className="rounded-full bg-brand px-2 py-0.5 text-[11px] font-extrabold text-surface tabular-nums">
                    {activeFilterCount}
                </span>
            )}
        </button>
    );

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetTrigger asChild>{trigger}</SheetTrigger>

            <SheetContent
                side="bottom"
                showCloseButton={false}
                className="storefront max-h-[88dvh] w-full gap-0 overflow-hidden rounded-t-[1.75rem] border-line bg-surface p-0 text-ink shadow-xl"
            >
                <div
                    aria-hidden="true"
                    className="flex shrink-0 justify-center pt-3 pb-1"
                >
                    <span className="h-1.5 w-10 rounded-full bg-line" />
                </div>

                <SheetHeader className="shrink-0 gap-1 border-b border-line px-5 pt-3 pb-4 pr-14 text-left">
                    <SheetTitle className="font-display text-xl font-extrabold tracking-tight text-ink">
                        Narrow the shelf
                    </SheetTitle>
                    <SheetDescription className="text-sm leading-relaxed text-ink-muted">
                        Pick a department, then apply.
                    </SheetDescription>
                </SheetHeader>

                <SheetClose asChild>
                    <button
                        type="button"
                        aria-label="Close filters"
                        className="absolute top-4 right-5 flex size-10 cursor-pointer items-center justify-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-brand hover:text-brand-deep focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none"
                    >
                        <X aria-hidden="true" className="size-4" />
                    </button>
                </SheetClose>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
                    <ProductFilters
                        categories={categories}
                        value={draft}
                        onChange={(next) =>
                            setDraft((current) => ({ ...current, ...next }))
                        }
                    />
                </div>

                <div className="shrink-0 border-t border-line bg-surface px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                    <div className="flex gap-3">
                        <button
                            type="button"
                            disabled={!hasDraftFilters}
                            onClick={() => setDraft({ category: "" })}
                            className="min-h-12 flex-1 cursor-pointer rounded-xl border border-line px-4 text-sm font-extrabold text-ink transition-colors hover:border-brand hover:text-brand-deep focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={apply}
                            className="min-h-12 flex-[2] cursor-pointer rounded-xl bg-brand px-5 text-sm font-extrabold text-surface transition-colors hover:bg-brand-deep focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none"
                        >
                            Apply filters
                        </button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
