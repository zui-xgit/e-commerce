import { useHttp } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";
import CartProductController from "@/actions/App/Http/Controllers/Storefront/CartProductController";
import { useStorefrontCartStore } from "@/hooks/stores/use-storefront-cart-store";
import type { StorefrontProduct } from "@/types/storefront-catalog";

export type StorefrontCartItem = {
    product: StorefrontProduct;
    quantity: number;
};

type CartProductsForm = {
    uuids: string[];
};

/**
 * Combines the UUID-only store entries with live catalogue data.
 */
export function useStorefrontCart() {
    const cart = useStorefrontCartStore((state) => state.cart);
    const removeItem = useStorefrontCartStore((state) => state.removeItem);
    const setQuantity = useStorefrontCartStore((state) => state.setQuantity);

    // A sorted snapshot of the UUID set: unchanged by quantity edits, so it
    // only triggers a request when the actual set of products changes.
    const uuidKey = useStorefrontCartStore((state) =>
        JSON.stringify(state.cart.map((item) => item.uuid).sort()),
    );

    const [products, setProducts] = useState<StorefrontProduct[]>([]);
    const [hasError, setHasError] = useState(false);
    const requestId = useRef(0);

    const { get, setData, processing } = useHttp<
        CartProductsForm,
        StorefrontProduct[]
    >({ uuids: [] });

    useEffect(() => {
        const uuids = JSON.parse(uuidKey) as string[];
        const id = ++requestId.current;

        setData({ uuids });
        setProducts([]);
        setHasError(false);

        if (uuids.length === 0) {
            return;
        }

        void get(CartProductController.url(), {
            onSuccess: (response) => {
                if (id !== requestId.current || !Array.isArray(response)) {
                    return;
                }

                const fetched = response.filter((product) =>
                    uuids.includes(product.uuid),
                );
                const returned = new Set(
                    fetched.map((product) => product.uuid),
                );

                setProducts(fetched);
                setHasError(false);

                uuids.forEach((uuid) => {
                    if (!returned.has(uuid)) {
                        removeItem(uuid);
                    }
                });

                // Stock may have dropped since the item was added. Bring any
                // over-stock quantity down to the exact current stock; a
                // stock of 0 removes the item from the cart.
                const stockByUuid = new Map(
                    fetched.map((product) => [product.uuid, product.stock]),
                );

                useStorefrontCartStore.getState().cart.forEach((item) => {
                    const stock = stockByUuid.get(item.uuid);

                    if (stock !== undefined && item.quantity > stock) {
                        setQuantity(item.uuid, stock);
                    }
                });
            },
            onError: () => {
                if (id === requestId.current) {
                    setHasError(true);
                }
            },
        }).catch(() => {
            // A failed request leaves the store intact; the next UUID change retries.
            if (id === requestId.current) {
                setHasError(true);
            }
        });

        return () => {
            // Invalidates any in-flight response from this effect.
            requestId.current++;
        };
    }, [uuidKey, get, setData, removeItem, setQuantity]);

    const productsByUuid = new Map(
        products.map((product) => [product.uuid, product]),
    );

    const items: StorefrontCartItem[] = cart.flatMap(({ uuid, quantity }) => {
        const product = productsByUuid.get(uuid);

        return product ? [{ product, quantity }] : [];
    });

    const isLoading =
        processing || (cart.length > 0 && items.length === 0 && !hasError);

    return { items, isLoading, hasError };
}
