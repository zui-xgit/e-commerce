type CategoryTileProps = {
    name: string;
    thumbnail?: string;
    active: boolean;
    disabled?: boolean;
    tone: 'brand' | 'coral' | 'mint';
    onClick: () => void;
};

const toneClasses = {
    brand: 'bg-brand-soft text-brand-deep',
    coral: 'bg-coral-soft text-coral',
    mint: 'bg-mint-soft text-brand-deep',
} as const;

export function CategoryTile({
    name,
    thumbnail,
    active,
    disabled = false,
    tone,
    onClick,
}: CategoryTileProps) {
    const words = name.split(' ');
    const initials =
        words.length > 1
            ? words
                  .slice(0, 2)
                  .map((word) => word.charAt(0))
                  .join('')
            : name.slice(0, 2).toUpperCase();

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-pressed={active}
            title={disabled ? 'No products in this category' : undefined}
            className="group flex w-24 shrink-0 snap-start flex-col items-center gap-2 rounded-2xl p-2 text-center transition-colors duration-200 hover:bg-surface-alt focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent sm:w-28"
        >
            <span
                className={`flex size-16 items-center justify-center overflow-hidden rounded-2xl border-2 transition-colors duration-200 sm:size-20 ${
                    active
                        ? 'border-brand'
                        : 'border-transparent group-hover:border-line'
                } ${thumbnail ? 'bg-surface' : toneClasses[tone]}`}
            >
                {thumbnail ? (
                    <img
                        src={thumbnail}
                        alt=""
                        aria-hidden="true"
                        width={80}
                        height={80}
                        loading="lazy"
                        decoding="async"
                        className="size-full object-contain p-1.5"
                    />
                ) : (
                    <span className="font-display text-xl font-extrabold">
                        {initials}
                    </span>
                )}
            </span>
            <span
                className={`line-clamp-2 text-xs leading-tight font-semibold ${
                    active ? 'text-brand-deep' : 'text-ink-muted'
                }`}
            >
                {name}
            </span>
        </button>
    );
}
