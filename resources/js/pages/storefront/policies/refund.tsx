import { Link } from '@inertiajs/react';
import { PolicyPage } from '@/components/storefront/policy-page';

const LAST_UPDATED = 'November 22, 2026';

export default function RefundPolicyPage() {
    return (
        <PolicyPage
            title="Refund policy"
            summary="We want you to feel confident buying from Laptop City. This policy explains when returns, exchanges, and refunds are available and how to start a request."
            lastUpdated={LAST_UPDATED}
            sections={[
                {
                    id: 'eligibility',
                    title: 'Return eligibility',
                    content: (
                        <>
                            <p>
                                Most unused products in original condition can
                                be returned within <strong>7 days</strong> of
                                delivery. Items must include original
                                packaging, accessories, manuals, and proof of
                                purchase.
                            </p>
                            <p>
                                Products with physical damage, missing parts,
                                unauthorized repairs, or signs of misuse may not
                                be eligible for a refund.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'non-returnable',
                    title: 'Items that may not be returnable',
                    content: (
                        <>
                            <p>
                                Some items have limited return eligibility,
                                including:
                            </p>
                            <ul>
                                <li>Software licenses or activated digital products.</li>
                                <li>Special-order or customized items.</li>
                                <li>
                                    Products marked final sale, where clearly
                                    stated before purchase.
                                </li>
                            </ul>
                        </>
                    ),
                },
                {
                    id: 'refund-process',
                    title: 'How refunds work',
                    content: (
                        <>
                            <p>
                                Once we receive and inspect a returned item, we
                                will notify you by email or phone about the
                                approval status. Approved refunds are issued to
                                the original payment method where possible.
                            </p>
                            <p>
                                Refund timing depends on the payment provider.
                                Mobile money and card refunds may take several
                                business days to appear after approval.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'exchanges',
                    title: 'Exchanges and faulty items',
                    content: (
                        <>
                            <p>
                                If you receive a faulty or incorrect item,
                                contact us as soon as possible. We will review
                                the issue and arrange a replacement, repair, or
                                refund depending on product availability and the
                                nature of the issue.
                            </p>
                            <p>
                                For delivery-related concerns, see our{' '}
                                <Link href="/policies/shipping">
                                    Shipping policy
                                </Link>
                                .
                            </p>
                        </>
                    ),
                },
                {
                    id: 'start-request',
                    title: 'Start a return request',
                    content: (
                        <>
                            <p>
                                To request a return or refund, contact our team
                                with your order number, item details, and reason
                                for the return. Reach us at{' '}
                                <a href="mailto:support@laptopcity.co.tz">
                                    support@laptopcity.co.tz
                                </a>{' '}
                                or call <a href="tel:+255748333444">0748 333 444</a>.
                            </p>
                        </>
                    ),
                },
            ]}
        />
    );
}
