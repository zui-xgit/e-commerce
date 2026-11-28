import { createInertiaApp } from "@inertiajs/react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { initializeTheme } from "@/hooks/use-appearance";
import AppLayout from "@/layouts/app-layout";
import AuthLayout from "@/layouts/auth-layout";
import SettingsLayout from "@/layouts/settings/layout";
import DashboardInnerLayout from "./layouts/dashboard-inner-layout";
import AccountLayout from "./layouts/storefront/account-layout";
import StorefrontLayout from "./layouts/storefront/main-layout";

const appName = import.meta.env.VITE_APP_NAME || "Laravel";

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name.startsWith("admin/"):
                return [AppLayout, DashboardInnerLayout];
            case name === "auth/verify-email":
                return null;
            case name === "storefront/checkout":
                return null;
            case name.startsWith("auth/"):
                return AuthLayout;
            case name.startsWith("settings/"):
                return [AppLayout, SettingsLayout];
            case name.startsWith("storefront/account"):
                return [StorefrontLayout, AccountLayout];
            case name.startsWith("storefront/order-completed"):
                return null;
            case name.startsWith("storefront/"):
                return StorefrontLayout;
            default:
                return null;
        }
    },
    strictMode: true,
    withApp(app) {
        return (
            <TooltipProvider delayDuration={0}>
                {app}
                <Toaster richColors />
            </TooltipProvider>
        );
    },
    progress: {
        color: "#4B5563",
    },
});

// This will set light / dark mode on load...
initializeTheme();
