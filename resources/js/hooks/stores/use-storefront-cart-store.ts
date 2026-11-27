import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type StorefrontCart = {
    uuid: string;
    quantity: number;
};

type StorefrontCartStore = {
    cart: StorefrontCart[];

    addToCart: (uuid: string, quantity?: number) => void;
    changeQuantity: (uuid: string, amount: number) => void;
    setQuantity: (uuid: string, quantity: number) => void;
    removeItem: (uuid: string) => void;
    clearCart: () => void;

    getTotalItems: () => number;
};

export const useStorefrontCartStore = create<StorefrontCartStore>()(
    persist(
        (set, get) => ({
            cart: [],

            addToCart: (uuid, quantity = 1) =>
                set((state) => {
                    const exists = state.cart.some((i) => i.uuid === uuid);

                    const cart = exists
                        ? state.cart.map((i) =>
                              i.uuid === uuid
                                  ? { ...i, quantity: i.quantity + quantity }
                                  : i,
                          )
                        : [...state.cart, { uuid, quantity }];

                    return { cart: cart.filter((i) => i.quantity > 0) };
                }),

            changeQuantity: (uuid, amount) =>
                set((state) => ({
                    cart: state.cart
                        .map((i) =>
                            i.uuid === uuid
                                ? { ...i, quantity: i.quantity + amount }
                                : i,
                        )
                        .filter((i) => i.quantity > 0),
                })),

            setQuantity: (uuid, quantity) =>
                set((state) => ({
                    cart: state.cart
                        .map((i) => (i.uuid === uuid ? { ...i, quantity } : i))
                        .filter((i) => i.quantity > 0),
                })),

            removeItem: (uuid) =>
                set((state) => ({
                    cart: state.cart.filter((i) => i.uuid !== uuid),
                })),

            clearCart: () => set({ cart: [] }),

            getTotalItems: () =>
                get().cart.reduce((sum, i) => sum + i.quantity, 0),
        }),
        {
            name: "storefront-cart",
            storage: createJSONStorage(() => localStorage),
        },
    ),
);
