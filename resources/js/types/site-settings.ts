export type SettingType =
    | "string"
    | "email"
    | "url"
    | "text"
    | "select"
    | "file"
    | "boolean";

export type SettingGroup = {
    key: string;
    label: string;
    description: string;
};

export type SettingDefinition = {
    key: string;
    label: string;
    group: string;
    type: SettingType;
    help?: string;
    placeholder?: string;
    accept?: string;
    default?: string | boolean | null;
    options?: Record<string, string>;
};

export type SiteSettingValue = string | boolean | null;

export type SiteSettingsProps = {
    groups: SettingGroup[];
    definitions: Record<string, SettingDefinition>;
    settings: Record<string, SiteSettingValue>;
    previews: Record<string, string | null>;
};

export type Currency = "TZS" | "KES" | "UGX" | "USD";

export interface SiteSettings {
    site_name: string;
    site_tagline: string | null;
    site_logo: string | null;
    site_favicon: string | null;
    contact_email: string;
    contact_phone: string | null;
    contact_address: string | null;
    business_hours: string | null;
    timezone: string;
    currency: Currency;
    meta_title: string | null;
    meta_description: string | null;
    meta_keywords: string | null;
    og_image: string | null;
    facebook_url: string | null;
    instagram_url: string | null;
    twitter_url: string | null;
    youtube_url: string | null;
    tiktok_url: string | null;
    whatsapp_number: string | null;
}
