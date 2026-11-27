import { usePage } from "@inertiajs/react";
import type { Currency } from "@/types/site-settings";

export function formatProductPrice(value: number, currency: Currency): string {
    return new Intl.NumberFormat("en-TZ", {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
    }).format(value);
}

const discountFormatter = new Intl.NumberFormat("en-TZ", {
    maximumFractionDigits: 2,
});

export function formatDiscountPercentage(value: number): string {
    return discountFormatter.format(value);
}

export const AVAILABILITY_OPTIONS = [
    { value: "in_stock", label: "In stock" },
    { value: "out_of_stock", label: "Out of stock" },
    { value: "preorder", label: "Preorder" },
    { value: "backorder", label: "Backorder" },
] as const;

export function availabilityLabel(value: string | null): string {
    return (
        AVAILABILITY_OPTIONS.find((option) => option.value === value)?.label ??
        (value ? value.replaceAll("_", " ") : "Not set")
    );
}

export function stockLabel(product: {
    stock: number;
    availability_status: string | null;
}): string {
    if (product.stock === 0) {
        return "No stock";
    }

    if (product.stock <= 5) {
        return `${product.stock} left`;
    }

    return `${product.stock} on hand`;
}
