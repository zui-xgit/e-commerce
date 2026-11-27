import { Auth } from "./auth";
import { SiteSettings } from "./site-settings";

export type SharedPageProps = {
    name: string;
    auth: Auth;
    sidebarOpen: boolean;
    settings: SiteSettings;
    [key: string]: unknown;
};
