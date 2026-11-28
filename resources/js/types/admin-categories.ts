export type AdminCategory = {
    uuid: string;
    name: string;
    thumbnail_url: string | null;
    sort_order: number;
    is_active: boolean;
    products_count: number;
    created_at: string | null;
};

export type CategoryFilters = {
    search: string;
    status: string;
    sort: string;
};

export type CategoryCounts = {
    all: number;
    active: number;
    inactive: number;
};

export type PaginatedCategories = {
    data: AdminCategory[];
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

export type CategoriesIndexProps = {
    categories: PaginatedCategories;
    filters: CategoryFilters;
    counts: CategoryCounts;
};

export type AdminCategoryDetail = AdminCategory & {
    products: {
        uuid: string;
        title: string;
        sku: string;
        thumbnail_url: string | null;
        price: number;
        stock: number;
        is_active: boolean;
    }[];
};
