import { ArrowUpRight } from 'lucide-react';

type BannerTileProps = {
    image: string;
    alt: string;
    title: string;
    description: string;
    href: string;
    tone: 'brand' | 'coral' | 'mint';
    className?: string;
};

const toneClasses = {
    brand: 'bg-brand-deep text-surface',
    coral: 'bg-coral-soft text-ink',
    mint: 'bg-mint text-ink',
} as const;

export function BannerTile({
    image,
    alt,
    title,
    description,
    href,
    tone,
    className = '',
}: BannerTileProps) {
    return (
        <a
            href={href}
            className={`group flex h-full flex-col overflow-hidden rounded-3xl border border-line transition-shadow duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface motion-safe:hover:shadow-lg motion-safe:focus-within:shadow-lg ${toneClasses[tone]} ${className}`}
        >
            <div className="relative aspect-[16/10] overflow-hidden bg-surface-alt">
                <img
                    src={image}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    className="size-full object-cover transition-transform duration-500 motion-safe:group-hover:scale-105 motion-safe:group-focus-within:scale-105"
                />
            </div>

            <div className="flex flex-1 flex-col gap-2 p-5">
                <h3 className="font-display text-xl leading-tight font-extrabold tracking-tight">
                    {title}
                </h3>
                <p className="text-sm leading-snug opacity-80">{description}</p>
                <span className="mt-auto flex items-center gap-2 pt-3 text-sm font-bold">
                    Explore
                    <ArrowUpRight
                        aria-hidden="true"
                        className="size-4 transition-transform duration-300 motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-focus-within:translate-x-0.5 motion-safe:group-focus-within:-translate-y-0.5"
                    />
                </span>
            </div>
        </a>
    );
}
