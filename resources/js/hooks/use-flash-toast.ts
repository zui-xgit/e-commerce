import { router } from "@inertiajs/react";
import { useEffect } from "react";
import { toast } from "sonner";
import type { FlashToast } from "@/types/ui";
import { StorefrontToastStyle } from "@/lib/storefront/storefront-toast";

export function useFlashToast(): void {
    useEffect(() => {
        return router.on("flash", (event) => {
            const flash = (event as CustomEvent).detail?.flash;
            const data = flash?.toast as FlashToast | undefined;

            if (!data) {
                return;
            }

            const isStorefront = data.context === "storefront";

            toast[data.type](data.message, {
                className: isStorefront ? "storefront" : undefined,
                style: isStorefront ? StorefrontToastStyle : undefined,
            });
        });
    }, []);
}
