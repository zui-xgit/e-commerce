import { Link } from '@inertiajs/react';
import { PolicyPage } from '@/components/storefront/policy-page';

const LAST_UPDATED = 'November 22, 2026';

export default function ShippingPolicyPage() {
    return (
        <PolicyPage
            title="Shipping policy"
            summary="Laptop City delivers across Dar es Salaam and selected regions in Tanzania. This page covers processing times, delivery estimates, fees, and what to do if there is an issue."
            lastUpdated={LAST_UPDATED}
            sections={[
                {
                    id: 'processing-times',
                    title: 'Order processing',
                    content: (
                        <>
                            <p>
                                Orders are usually processed within{' '}
                                <strong>1 to 2 business days</strong> after
                                payment confirmation. Orders placed on weekends
                                or public holidays are processed on the next
                                business day.
                            </p>
                            <p>
                                If an item is out of stock or requires extra
                                verification, we will contact you before
                                dispatch.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'delivery-areas',
                    title: 'Delivery areas and estimates',
                    content: (
                        <>
                            <p>Estimated delivery windows:</p>
                            <ul>
                                <li>
                                    <strong>Dar es Salaam:</strong> same day or
                                    next business day for eligible in-stock
                                    items.
                                </li>
                                <li>
                                    <strong>Other regions:</strong> 2 to 5
                                    business days, depending on location and
                                    courier availability.
                                </li>
                            </ul>
                            <p>
                                Delivery times are estimates and may change due
                                to weather, courier delays, or public holidays.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'fees',
                    title: 'Shipping fees',
                    content: (
                        <>
                            <p>
                                Shipping fees are calculated based on delivery
                                location, package size, and order value. Any
                                delivery charge will be shown before you confirm
                                your order.
                            </p>
                            <p>
                                Promotional free-delivery offers may apply to
                                selected products or order values when clearly
                                indicated.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'tracking-and-issues',
                    title: 'Tracking, delays, and delivery issues',
                    content: (
                        <>
                            <p>
                                Once your order is dispatched, we will share
                                delivery updates through the contact details on
                                your order. Please make sure your phone number
                                and address are accurate.
                            </p>
                            <p>
                                If your order arrives damaged, incomplete, or
                                late, contact us promptly so we can investigate.
                                For returns after delivery, review our{' '}
                                <Link href="/policies/refund">Refund policy</Link>.
                            </p>
                        </>
                    ),
                },
            ]}
        />
    );
}
