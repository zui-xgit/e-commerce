// resources/js/hooks/useSiteSettings.ts

import { usePage } from "@inertiajs/react";
import type { SiteSettings } from "@/types/site-settings";
import { SharedPageProps } from "@/types/inertia-config";

export function useSiteSettings(): SiteSettings {
    return usePage<SharedPageProps>().props.settings;
}
