import type { StockStatus } from "@/lib/stock-status";

export type StorefrontCategory = {
    uuid: string;
    name: string;
    thumbnailUrl: string | null;
    productCount: number;
};

export type StorefrontSortOption =
    | "recommended"
    | "price-asc"
    | "price-desc"
    | "rating";

export type StorefrontProductImage = {
    uuid: string;
    url: string | null;
    alt: string | null;
};

export type StorefrontReview = {
    rating: number;
    comment: string;
    date: string;
    reviewerName: string;
    reviewerEmail?: string;
};

export type StorefrontProduct = {
    uuid: string;
    title: string;
    description: string | null;
    category: { uuid: string; name: string } | undefined;
    categoryName: string;
    price: number;
    originalPrice: number;
    discountPercentage: number;
    discountedPrice: number;
    savings: number;
    rating: number;
    stock: number;
    brand: string | null;
    sku: string;
    thumbnailUrl: string | null;
    images?: StorefrontProductImage[];
    isFeatured: boolean;
    createdAt: string | null;
};

export type StorefrontProductDetail = StorefrontProduct & {
    images: StorefrontProductImage[];
    minimumOrderQuantity: number;
    stockStatus: Exclude<StockStatus, "low_stock">;
    shippingInformation: string | null;
    returnPolicy: string | null;
    warrantyInformation: string | null;
    reviews: StorefrontReview[];
};

export type StorefrontPaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

export type PaginatedProducts = {
    data: StorefrontProduct[];
    links: StorefrontPaginationLink[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number | null;
        to: number | null;
    };
};
