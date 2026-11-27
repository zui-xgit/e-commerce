import { Currency } from "@/types/site-settings";

export function formatPrice(value: number, currency: Currency) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
    }).format(value);
}
