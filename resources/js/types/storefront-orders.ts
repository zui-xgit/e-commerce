export type StorefrontOrderStatus = 'pending' | 'processed';

export type StorefrontOrderItem = {
    uuid: string;
    title: string;
    price: number;
    originalPrice: number;
    quantity: number;
    discountPercentage: number;
    discountedTotal: number;
    thumbnailUrl: string | null;
};

export type StorefrontDeliveryAddress = {
    country: string;
    name: string;
    company: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
    email: string;
};

export type StorefrontOrder = {
    uuid: string;
    orderNumber: string;
    placedOn: string;
    status: StorefrontOrderStatus;
    items: StorefrontOrderItem[];
    total: number;
    originalTotal: number;
    savings: number;
    totalProducts: number;
    totalQuantity: number;
    deliveryAddress: StorefrontDeliveryAddress | null;
};
