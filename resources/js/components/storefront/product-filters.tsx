import { cn } from "@/lib/utils";
import type { StorefrontCategory } from "@/types/storefront-catalog";

export type ProductFilterValues = {
    category: string;
};

const optionClassName =
    "flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border px-4 text-left text-sm font-bold transition-colors focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none";

export function ProductFilters({
    categories,
    value,
    onChange,
    className,
}: {
    categories: StorefrontCategory[];
    value: ProductFilterValues;
    onChange: (next: Partial<ProductFilterValues>) => void;
    className?: string;
}) {
    return (
        <div className={cn("flex flex-col gap-6", className)}>
            <fieldset>
                <legend className="text-sm font-bold text-ink">
                    Department
                </legend>
                <div className="mt-3 flex flex-col gap-2">
                    <button
                        type="button"
                        onClick={() => onChange({ category: "" })}
                        aria-pressed={value.category === ""}
                        className={cn(
                            optionClassName,
                            value.category === ""
                                ? "border-brand bg-brand text-surface"
                                : "border-line bg-surface text-ink-muted hover:border-brand hover:text-brand-deep",
                        )}
                    >
                        <span>All departments</span>
                        <span
                            aria-hidden="true"
                            className="rounded-full bg-surface/15 px-2 py-0.5 text-[11px] font-extrabold tabular-nums"
                        >
                            All
                        </span>
                    </button>

                    {categories.map((category) => {
                        const isSelected = value.category === category.uuid;

                        return (
                            <button
                                key={category.uuid}
                                type="button"
                                onClick={() =>
                                    onChange({ category: category.uuid })
                                }
                                aria-pressed={isSelected}
                                className={cn(
                                    optionClassName,
                                    isSelected
                                        ? "border-brand bg-brand text-surface"
                                        : "border-line bg-surface text-ink-muted hover:border-brand hover:text-brand-deep",
                                )}
                            >
                                <span className="min-w-0 truncate">
                                    {category.name}
                                </span>
                                <span
                                    aria-hidden="true"
                                    className="shrink-0 rounded-full bg-surface-alt px-2 py-0.5 text-[11px] font-extrabold text-ink-muted tabular-nums"
                                >
                                    {category.productCount}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </fieldset>
        </div>
    );
}
