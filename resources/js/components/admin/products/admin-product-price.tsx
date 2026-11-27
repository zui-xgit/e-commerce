import { Badge } from "@/components/ui/badge";
import { useSiteSettings } from "@/hooks/use-site-settings";
import {
    formatDiscountPercentage,
    formatProductPrice,
} from "@/lib/admin-products";
import { cn } from "@/lib/utils";

type PricedProduct = {
    price: number;
    discount_percentage: number;
    discounted_price: number;
};

export function AdminProductPrice({
    product,
    align = "left",
    showCurrencyLabel = false,
}: {
    product: PricedProduct;
    align?: "left" | "right";
    showCurrencyLabel?: boolean;
}) {
    const currency = useSiteSettings().currency;
    const hasDiscount = product.discount_percentage > 0;
    const price = hasDiscount ? product.discounted_price : product.price;

    return (
        <div className={cn("space-y-1", align === "right" && "text-right")}>
            <div
                className={cn(
                    "flex flex-wrap items-center gap-x-2 gap-y-1",
                    align === "right" ? "justify-end" : "justify-start",
                )}
            >
                <span className="font-medium tabular-nums">
                    {formatProductPrice(price, currency)}
                </span>
                {showCurrencyLabel && (
                    <span className="text-xs font-normal text-muted-foreground">
                        {currency}
                    </span>
                )}
                {hasDiscount && (
                    <Badge
                        variant="secondary"
                        className="px-1.5 py-0 text-[11px] font-medium tabular-nums"
                    >
                        -{formatDiscountPercentage(product.discount_percentage)}
                        %
                    </Badge>
                )}
            </div>
            {hasDiscount && (
                <div className="text-xs font-normal text-muted-foreground line-through tabular-nums">
                    {formatProductPrice(product.price, currency)}
                </div>
            )}
        </div>
    );
}
