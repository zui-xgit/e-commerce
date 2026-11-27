import {
    DELIVERY_COUNTRIES,
    type DeliveryAddressErrors,
    type DeliveryAddressValues,
} from '@/lib/storefront/delivery-address';
import { storefrontInputClass, Input } from '@/components/storefront/input';
import InputError from '@/components/input-error';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export function DeliveryField({
    id,
    label,
    optional = false,
    error,
    className,
    children,
}: {
    id: string;
    label: string;
    optional?: boolean;
    error?: string;
    className?: string;
    children: ReactNode;
}) {
    return (
        <div
            className={cn('grid grid-cols-1 content-start gap-1.5', className)}
        >
            {/* Fixed header and reserved error rows keep every input on the
                same baseline, with or without a badge or validation message. */}
            <div className="flex h-4 items-center gap-3">
                <Label htmlFor={id} className="text-xs font-bold text-ink">
                    {label}
                </Label>
                {optional && (
                    <span className="text-[11px] leading-none font-semibold text-green-600">
                        (Optional)
                    </span>
                )}
            </div>
            {children}
            <div className="min-h-5">
                <InputError
                    id={`${id}-error`}
                    role="alert"
                    message={error}
                    className="text-xs font-bold text-error sm:text-[11px]"
                />
            </div>
        </div>
    );
}

function fieldDescribedBy(id: string, error?: string) {
    return error ? `${id}-error` : undefined;
}

function addressFieldId(prefix: string, field: keyof DeliveryAddressValues) {
    return `${prefix}-${field.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`;
}

/**
 * The checkout and account address book render the exact same set of fields
 * so a saved address can be copied straight into checkout.
 */
export function DeliveryAddressFields({
    values,
    errors,
    onChange,
}: {
    values: DeliveryAddressValues;
    errors: DeliveryAddressErrors;
    onChange: (field: keyof DeliveryAddressValues, value: string) => void;
}) {
    const id = (field: keyof DeliveryAddressValues) =>
        addressFieldId('delivery', field);
    const errorFor = (field: keyof DeliveryAddressValues) => errors[field];
    const inputProps = (field: keyof DeliveryAddressValues) => ({
        id: id(field),
        value: values[field],
        onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
            onChange(field, event.target.value),
        'aria-describedby': fieldDescribedBy(id(field), errorFor(field)),
        invalid: Boolean(errorFor(field)),
    });

    return (
        <div className="grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2 lg:grid-cols-6">
            <DeliveryField
                id={id('country')}
                label="Country"
                error={errorFor('country')}
                className="lg:col-span-3"
            >
                <Select
                    value={values.country}
                    onValueChange={(value) => onChange('country', value)}
                >
                    <SelectTrigger
                        id={id('country')}
                        className={cn(
                            storefrontInputClass({
                                invalid: Boolean(errorFor('country')),
                            }),
                            `data-[placeholder]:text-ink-muted data-[state=open]:border-brand data-[state=open]:ring-[3px] data-[state=open]:ring-brand/20 dark:bg-surface dark:hover:bg-surface [&_svg]:opacity-100 [&_svg:not([class*='text-'])]:text-ink-muted`,
                        )}
                        aria-invalid={Boolean(errorFor('country'))}
                        aria-describedby={fieldDescribedBy(
                            id('country'),
                            errorFor('country'),
                        )}
                    >
                        <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent
                        position="item-aligned"
                        className="storefront w-[var(--radix-select-trigger-width)] rounded-2xl border-line bg-surface text-ink shadow-lg"
                    >
                        {DELIVERY_COUNTRIES.map((country) => (
                            <SelectItem
                                key={country}
                                value={country}
                                className={`min-h-11 rounded-xl pr-9 pl-3 font-semibold text-ink focus:bg-brand-soft focus:text-brand-deep data-[state=checked]:text-brand-deep [&_svg:not([class*='text-'])]:text-brand`}
                            >
                                {country}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </DeliveryField>

            <DeliveryField
                id={id('name')}
                label="Full name"
                error={errorFor('name')}
                className="lg:col-span-3"
            >
                <Input
                    {...inputProps('name')}
                    type="text"
                    autoComplete="name"
                    maxLength={120}
                    placeholder="Who should we deliver to?"
                />
            </DeliveryField>

            <DeliveryField
                id={id('company')}
                label="Company"
                optional
                error={errorFor('company')}
                className="lg:col-span-3"
            >
                <Input
                    {...inputProps('company')}
                    type="text"
                    autoComplete="organization"
                    maxLength={120}
                    placeholder="Business name, if any"
                />
            </DeliveryField>

            <DeliveryField
                id={id('city')}
                label="City"
                error={errorFor('city')}
                className="lg:col-span-3"
            >
                <Input
                    {...inputProps('city')}
                    type="text"
                    autoComplete="address-level2"
                    maxLength={80}
                    placeholder="e.g. Dar es Salaam"
                />
            </DeliveryField>

            <DeliveryField
                id={id('address')}
                label="Street address"
                error={errorFor('address')}
                className="lg:col-span-3"
            >
                <Input
                    {...inputProps('address')}
                    type="text"
                    autoComplete="street-address"
                    maxLength={160}
                    placeholder="House number, street, and area"
                />
            </DeliveryField>

            <DeliveryField
                id={id('email')}
                label="Email address"
                error={errorFor('email')}
                className="lg:col-span-3"
            >
                <Input
                    {...inputProps('email')}
                    type="email"
                    autoComplete="email"
                    maxLength={120}
                    placeholder="you@example.com"
                />
            </DeliveryField>

            <DeliveryField
                id={id('postalCode')}
                label="Postal code"
                optional
                error={errorFor('postalCode')}
                className="lg:col-span-3"
            >
                <Input
                    {...inputProps('postalCode')}
                    type="text"
                    autoComplete="postal-code"
                    maxLength={20}
                    placeholder="If you have one"
                />
            </DeliveryField>

            <DeliveryField
                id={id('phone')}
                label="Phone number"
                error={errorFor('phone')}
                className="lg:col-span-3"
            >
                <Input
                    {...inputProps('phone')}
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={30}
                    placeholder="e.g. +255 712 345 678"
                />
            </DeliveryField>
        </div>
    );
}
