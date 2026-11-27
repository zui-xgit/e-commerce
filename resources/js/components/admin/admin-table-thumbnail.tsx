import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminTableThumbnailProps = {
    src?: string | null;
    alt?: string;
    fallbackIcon: LucideIcon;
    className?: string;
};

export function AdminTableThumbnail({
    src,
    alt = "",
    fallbackIcon: FallbackIcon,
    className,
}: AdminTableThumbnailProps) {
    return (
        <div
            className={cn(
                "flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/60",
                className,
            )}
        >
            {src ? (
                <img
                    src={src}
                    alt={alt}
                    width={64}
                    height={64}
                    loading="lazy"
                    className="size-full object-cover object-center"
                />
            ) : (
                <FallbackIcon
                    className="size-6 text-muted-foreground"
                    aria-hidden="true"
                />
            )}
        </div>
    );
}
