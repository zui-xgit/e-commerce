import type { PropsWithChildren, ReactNode } from 'react';
import { PageHeader } from '@/components/storefront/page-header';
import { cn } from '@/lib/utils';

export function AccountPageHeader({
    title,
    description,
    hideDescriptionOnMobile = false,
    children,
}: PropsWithChildren<{
    title: ReactNode;
    description: ReactNode;
    hideDescriptionOnMobile?: boolean;
}>) {
    return (
        <PageHeader
            title={title}
            description={description}
            variant="compact"
            action={children}
            descriptionClassName={cn(
                hideDescriptionOnMobile && 'hidden sm:block',
            )}
        />
    );
}
