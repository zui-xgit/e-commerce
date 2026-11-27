export const DELIVERY_COUNTRIES = [
    'Tanzania',
    'Kenya',
    'Uganda',
    'Rwanda',
    'Burundi',
    'South Sudan',
] as const;

export type DeliveryAddressValues = {
    country: string;
    name: string;
    company: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
    email: string;
};

export type DeliveryAddressErrors = Partial<
    Record<keyof DeliveryAddressValues, string>
>;

export const EMPTY_DELIVERY_ADDRESS: DeliveryAddressValues = {
    country: '',
    name: '',
    company: '',
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    email: '',
};
