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

export function stockLabel(product: { stock: number }): string {
    if (product.stock === 0) {
        return "No stock";
    }

    if (product.stock <= 5) {
        return `${product.stock} left`;
    }

    return `${product.stock} on hand`;
}
