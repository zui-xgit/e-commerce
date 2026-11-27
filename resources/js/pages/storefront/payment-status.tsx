import { Container } from '@/components/storefront/container';
import { PageHeader } from '@/components/storefront/page-header';

export default function StorefrontPaymentStatusPage() {
    return (
        <Container className="py-8">
            <PageHeader
                title="Payment status"
                description="Payment status placeholder."
            />
        </Container>
    );
}
