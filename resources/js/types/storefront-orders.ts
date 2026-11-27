export type StorefrontOrderStatus = 'pending' | 'processed';

export type StorefrontOrderItem = {
    id: number;
    title: string;
    price: number;
    quantity: number;
    discountPercentage: number;
    discountedTotal: number;
    thumbnail: string;
};

export type StorefrontOrder = {
    id: number;
    placedOn: string;
    status: StorefrontOrderStatus;
    items: StorefrontOrderItem[];
    total: number;
    discountedTotal: number;
    totalProducts: number;
    totalQuantity: number;
    userId: number;
};

export type StorefrontAddress = {
    name: string;
    line: string;
    city: string;
    region: string;
    postalCode: string;
    country: string;
    phone: string;
};
