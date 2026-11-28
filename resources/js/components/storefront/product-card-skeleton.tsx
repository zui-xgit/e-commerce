export function ProductCardSkeleton() {
    return (
        <div
            aria-hidden="true"
            className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface"
        >
            <div className="aspect-square bg-brand-soft motion-safe:animate-pulse" />
            <div className="flex flex-1 flex-col gap-3 p-3 sm:p-4">
                <div className="h-3 w-20 rounded-full bg-brand-soft motion-safe:animate-pulse" />
                <div className="h-4 w-full rounded-full bg-brand-soft motion-safe:animate-pulse" />
                <div className="h-4 w-2/3 rounded-full bg-brand-soft motion-safe:animate-pulse" />
                <div className="mt-auto h-11 w-full rounded-xl bg-brand-soft motion-safe:animate-pulse" />
            </div>
        </div>
    );
}
