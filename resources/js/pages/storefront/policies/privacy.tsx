import { PolicyPage } from '@/components/storefront/policy-page';

const LAST_UPDATED = 'November 22, 2026';

export default function PrivacyPolicyPage() {
    return (
        <PolicyPage
            title="Privacy policy"
            summary="We collect only the information needed to run Laptop City, process your orders, and support you. This page explains what we collect, why we collect it, and the choices you have."
            lastUpdated={LAST_UPDATED}
            sections={[
                {
                    id: 'information-we-collect',
                    title: 'Information we collect',
                    content: (
                        <>
                            <p>
                                When you shop with Laptop City, we may collect
                                information you provide directly, including your
                                name, email address, phone number, delivery
                                address, and order details.
                            </p>
                            <p>
                                If you contact us or create an account, we also
                                keep the information needed to respond to your
                                request and manage your account securely.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'how-we-use-information',
                    title: 'How we use your information',
                    content: (
                        <>
                            <p>We use your information to:</p>
                            <ul>
                                <li>Process orders, payments, and deliveries.</li>
                                <li>
                                    Send order updates, receipts, and support
                                    responses.
                                </li>
                                <li>
                                    Improve our store experience, product
                                    selection, and customer service.
                                </li>
                                <li>
                                    Prevent fraud and keep accounts secure.
                                </li>
                            </ul>
                        </>
                    ),
                },
                {
                    id: 'sharing',
                    title: 'Sharing and third parties',
                    content: (
                        <>
                            <p>
                                We do not sell your personal information. We
                                only share data with trusted providers when it
                                is necessary to operate the store, such as
                                payment processing, delivery coordination, or
                                customer support tools.
                            </p>
                            <p>
                                These providers are expected to handle your data
                                carefully and use it only for the service they
                                provide to Laptop City.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'data-retention',
                    title: 'Data retention and security',
                    content: (
                        <>
                            <p>
                                We keep personal information for as long as it
                                is needed to fulfill orders, meet legal
                                obligations, resolve disputes, and maintain
                                business records.
                            </p>
                            <p>
                                We use reasonable administrative and technical
                                safeguards to protect your information. No
                                online system can be guaranteed completely
                                secure, but we work to reduce risk and respond
                                quickly to issues.
                            </p>
                        </>
                    ),
                },
                {
                    id: 'your-choices',
                    title: 'Your choices and contact',
                    content: (
                        <>
                            <p>
                                You can request access to, correction of, or
                                deletion of your personal information where
                                applicable. To make a privacy request, contact
                                us at{' '}
                                <a href="mailto:privacy@laptopcity.co.tz">
                                    privacy@laptopcity.co.tz
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
