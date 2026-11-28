import type { CSSProperties } from "react";
import { toast } from "sonner";

export const StorefrontToastStyle = {
    "--normal-bg": "var(--surface)",
    "--normal-text": "var(--ink)",
    "--normal-border": "var(--line)",
} as CSSProperties;

/**
 * Sonner's default theme reads shadcn variables. Storefront surfaces use the
 * market-aisle tokens instead, so their toasts speak the same colour language.
 */
export function storefrontToast(message: string) {
    return toast(message, {
        className: "storefront",
        style: StorefrontToastStyle,
    });
}
