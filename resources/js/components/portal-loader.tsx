import { Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';

interface PortalLoaderProps {
    loading: boolean;
    /**
     * Any CSS color. Use CSS variables from app.css so it follows your palette:
     *   storefront: "var(--brand)", "var(--coral)", "var(--ink)"
     *   shadcn:     "var(--primary)", "var(--destructive)"
     * A plain hex also works.
     */
    color?: string;
}

export const PortalLoader = ({
    loading,
    color = 'var(--brand)', // neutral default, pass color="var(--primary)" on the not-storefront pages
}: PortalLoaderProps) => {
    if (!loading || typeof document === 'undefined') {
        return null;
    }

    return createPortal(
        <div
            role="status"
            aria-live="polite"
            aria-label="Loading"
            className="fixed inset-0 z-100 flex items-center justify-center bg-gray-900/30 backdrop-blur-xs"
        >
            <Loader2
                aria-hidden="true"
                className="size-16 motion-safe:animate-spin"
                style={{ color }}
            />
        </div>,
        document.body,
    );
};
