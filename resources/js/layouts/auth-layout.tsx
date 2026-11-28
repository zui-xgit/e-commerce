import AuthLayoutTemplate from '@/layouts/auth/auth-simple-layout';

const DEFAULT_TITLE = 'Sign in to the store';
const DEFAULT_DESCRIPTION = 'Use your staff account to manage products and settings.';

export default function AuthLayout({
    title = DEFAULT_TITLE,
    description = DEFAULT_DESCRIPTION,
    children,
}: {
    title?: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <AuthLayoutTemplate title={title} description={description}>
            {children}
        </AuthLayoutTemplate>
    );
}
