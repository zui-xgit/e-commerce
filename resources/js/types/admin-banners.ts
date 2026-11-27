export type AdminBanner = {
    uuid: string;
    title: string;
    image_url: string | null;
    sort_order: number;
    is_active: boolean;
    created_at: string | null;
};

export type AdminBannerDetail = AdminBanner & {
    updated_at: string | null;
};

export type BannerFilters = {
    search: string;
    status: string;
    sort: string;
};

export type BannerCounts = {
    all: number;
    active: number;
    inactive: number;
};

export type PaginatedBanners = {
    data: AdminBanner[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
};

export type BannersIndexProps = {
    banners: PaginatedBanners;
    filters: BannerFilters;
    counts: BannerCounts;
};
