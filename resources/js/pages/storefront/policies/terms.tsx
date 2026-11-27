import { Link } from '@inertiajs/react';
import { PolicyPage } from '@/components/storefront/policy-page';

const LAST_UPDATED = 'November 22, 2026';

export default function TermsPolicyPage() {
    return (
        <PolicyPage
            title="Terms of service"
            summary="These terms describe the rules for using the Laptop City website, placing orders, and interacting with our services. By using the site, you agree to these conditions."
            lastUpdated={LAST_UPDATED}
            sections={[
                {
                    id: 'using-the-site',
                    title: 'Using the website',
                    content: (
                        <>
                            <p>
                                You may use this website to browse products,
                                place orders, and manage your account for lawful
                                purposes. You agree not to misuse the site,
                                interfere with its operation, or attempt
                                unauthorized access.
                            </p>
                            <p>
                                We may update, suspend, or limit parts of the
                                site as needed to maintain service quality and
                                security.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'orders-and-pricing',
                    title: 'Orders, pricing, and availability',
                    content: (
                        <>
                            <p>
                                Product descriptions, prices, and availability
                                are subject to change. We make reasonable
                                efforts to keep information accurate, but errors
                                may occur.
                            </p>
                            <p>
                                An order is confirmed only after payment and
                                order acceptance. If we cannot fulfill an order,
                                we will contact you and arrange an appropriate
                                resolution.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'payments',
                    title: 'Payments',
                    content: (
                        <>
                            <p>
                                Payments must be made using approved payment
                                methods available at checkout. You are
                                responsible for ensuring payment details are
                                accurate and authorized.
                            </p>
                            <p>
                                For information about returns and eligible
                                refunds, see our{' '}
                                <Link href="/policies/refund">Refund policy</Link>.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'accounts',
                    title: 'Accounts and responsibilities',
                    content: (
                        <>
                            <p>
                                If you create an account, you are responsible
                                for keeping your login details secure and for
                                activity that occurs under your account.
                            </p>
                            <p>
                                Please notify us promptly if you believe your
                                account has been accessed without permission.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'contact-and-updates',
                    title: 'Policy updates and contact',
                    content: (
                        <>
                            <p>
                                We may update these terms from time to time.
                                The latest version will be posted on this page
                                with an updated date.
                            </p>
                            <p>
                                Questions about these terms can be sent to{' '}
                                <a href="mailto:support@laptopcity.co.tz">
                                    support@laptopcity.co.tz
                                </a>{' '}
                                or by calling{' '}
                                <a href="tel:+255748333444">0748 333 444</a>.
                                Also review our{' '}
                                <Link href="/policies/privacy">Privacy policy</Link>.
                            </p>
                        </>
                    ),
                },
            ]}
        />
    );
}
