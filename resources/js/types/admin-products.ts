import type { StockStatus } from "@/lib/stock-status";

export type ProductCategory = {
    uuid: string;
    name: string;
};

export type AdminProductImage = {
    uuid: string;
    url: string | null;
    alt: string | null;
    sort_order: number;
};

export type AdminProduct = {
    uuid: string;
    title: string;
    sku: string;
    brand: string | null;
    description: string | null;
    category: ProductCategory | null;
    thumbnail_url: string | null;
    price: number;
    discount_percentage: number;
    discounted_price: number;
    rating: number;
    stock: number;
    minimum_order_quantity: number;
    stock_status: StockStatus;
    is_active: boolean;
    is_featured: boolean;
    shipping_information: string | null;
    return_policy: string | null;
    warranty_information: string | null;
    images_count: number;
    images: AdminProductImage[];
    created_at: string | null;
};

export type AdminProductDetail = AdminProduct;

export type ProductFilters = {
    search: string;
    category: string;
    status: string;
    sort: string;
};

export type ProductCounts = {
    all: number;
    active: number;
    out_of_stock: number;
    low_stock: number;
};

export type PaginatedProducts = {
    data: AdminProduct[];
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

export type ProductsIndexProps = {
    products: PaginatedProducts;
    categories: ProductCategory[];
    filters: ProductFilters;
    counts: ProductCounts;
};
