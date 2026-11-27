import { create } from "zustand";

export type StorefrontLanguage = "en" | "sw";

type StorefrontLanguageStore = {
    language: StorefrontLanguage;
    setLanguage: (language: StorefrontLanguage) => void;
};

/**
 * UI-only preview state. The header and footer triggers share one checkmark,
 * but nothing is translated, persisted or sent to the server yet.
 */
export const useStorefrontLanguageStore = create<StorefrontLanguageStore>()(
    (set) => ({
        language: "en",
        setLanguage: (language) => set({ language }),
    }),
);
