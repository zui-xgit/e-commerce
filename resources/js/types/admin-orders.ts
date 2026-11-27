export type AdminOrderStatus = 'pending' | 'processed' | 'cancelled';

export type OrderStatusFilter = AdminOrderStatus | 'all';

export type OrderSort = 'newest' | 'oldest' | 'total_desc' | 'total_asc';

export type AdminOrderFilters = {
    search: string;
    status: OrderStatusFilter;
    customer: string;
    sort: OrderSort;
};

export type AdminOrderCustomerOption = {
    uuid: string;
    name: string;
    email: string;
};

export type AdminOrderCounts = Record<OrderStatusFilter, number>;

export type AdminOrderListItem = {
    uuid: string;
    orderNumber: string;
    status: AdminOrderStatus;
    customerName: string;
    customerEmail: string;
    phone: string;
    isGuest: boolean;
    itemCount: number;
    totalQuantity: number;
    total: number;
    shortfallUnits: number;
    placedAt: string;
};

export type AdminOrderItem = {
    uuid: string;
    title: string;
    brand: string | null;
    price: number;
    quantity: number;
    confirmedQuantity: number;
    shortfall: number;
    availableStock: number | null;
    lineTotal: number;
};

export type AdminOrderDelivery = {
    name: string;
    company: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string;
    email: string;
};

export type AdminOrderDetail = {
    uuid: string;
    orderNumber: string;
    status: AdminOrderStatus;
    placedAt: string;
    total: number;
    fulfilledTotal: number;
    shortfallUnits: number;
    items: AdminOrderItem[];
    customer: {
        name: string;
        email: string;
        phone: string;
        isGuest: boolean;
    };
    delivery: AdminOrderDelivery | null;
    confirmedAt: string | null;
    confirmedBy: string | null;
    cancelledAt: string | null;
    cancelledBy: string | null;
    cancellationReason: string | null;
};

export type AdminOrdersIndexProps = {
    orders: {
        data: AdminOrderListItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: { url: string | null; label: string; active: boolean }[];
    };
    customers: AdminOrderCustomerOption[];
    filters: AdminOrderFilters;
    counts: AdminOrderCounts;
};

export type PaginatedLinks = AdminOrdersIndexProps['orders']['links'];
