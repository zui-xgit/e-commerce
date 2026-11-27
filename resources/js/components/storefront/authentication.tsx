import type { ReactElement } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { AuthenticationDialog } from './dialogs/authentication-dialog';
import { AuthenticationSheet } from './sheets/authentication-sheet';

/**
 * Uses the bottom sheet on mobile and the centered dialog everywhere else.
 */
export function Authentication({ children }: { children: ReactElement }) {
    const isMobile = useIsMobile();

    return isMobile ? (
        <AuthenticationSheet>{children}</AuthenticationSheet>
    ) : (
        <AuthenticationDialog>{children}</AuthenticationDialog>
    );
}
