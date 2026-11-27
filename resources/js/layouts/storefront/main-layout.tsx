import type { PropsWithChildren } from "react";
import StorefrontHeader from "@/components/storefront/storefront-header";
import StorefrontFooter from "@/components/storefront/storefront-footer";
import { BackToTop } from "@/components/storefront/back-to-top";

export default function StorefrontLayout({ children }: PropsWithChildren) {
    return (
        <>
            <div
                id="top"
                className="storefront flex min-h-screen flex-col bg-surface text-ink"
            >
                <StorefrontHeader />
                <main className="flex-1 py-6 sm:py-8">{children}</main>
                <StorefrontFooter />
            </div>
            <BackToTop />
        </>
    );
}
