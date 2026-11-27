import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, MapPin, Package, UserRound } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { Container } from '@/components/storefront/container';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import type { SharedPageProps } from '@/types/inertia-config';

const accountLinks = [
    { href: '/account/orders', label: 'Orders', icon: Package },
    { href: '/account/profile', label: 'Account', icon: UserRound },
    { href: '/account/addresses', label: 'Addresses', icon: MapPin },
];

export default function AccountLayout({ children }: PropsWithChildren) {
    const page = usePage<SharedPageProps>();
    const user = page.props.auth.user;
    const getInitials = useInitials();
    const initials = user ? getInitials(user.name) : 'SH';

    const isActive = (href: string) =>
        page.url === href || page.url.startsWith(`${href}/`);

    return (
        <Container className="-mt-2 grid gap-4 lg:mt-0 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
            <nav
                aria-label="Account navigation"
                className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:hidden"
            >
                {accountLinks.map(({ href, label, icon: Icon }) => (
                    <Link
                        key={href}
                        href={href}
                        aria-current={isActive(href) ? 'page' : undefined}
                        className={cn(
                            'flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-bold transition-colors',
                            isActive(href)
                                ? 'border-brand bg-brand text-surface'
                                : 'border-line bg-surface text-ink-muted hover:border-brand hover:text-brand',
                        )}
                    >
                        <Icon aria-hidden="true" className="size-4" />
                        {label}
                    </Link>
                ))}
            </nav>

            <aside aria-label="Account sidebar" className="hidden lg:block">
                <div className="sticky top-28 rounded-2xl border border-line bg-surface p-5">
                    <h2 className="font-display text-lg font-extrabold tracking-tight text-ink">
                        Your account
                    </h2>
                    <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                        Orders, details and where we deliver.
                    </p>

                    <nav
                        aria-label="Account sections"
                        className="mt-5 space-y-1"
                    >
                        {accountLinks.map(({ href, label, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                aria-current={
                                    isActive(href) ? 'page' : undefined
                                }
                                className={cn(
                                    'flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-bold transition-colors',
                                    isActive(href)
                                        ? 'bg-brand-soft text-brand-deep'
                                        : 'text-ink-muted hover:bg-surface-alt hover:text-brand',
                                )}
                            >
                                <Icon aria-hidden="true" className="size-4" />
                                {label}
                            </Link>
                        ))}
                    </nav>

                    {user && (
                        <div className="mt-5 flex items-center gap-3 border-t border-line pt-5">
                            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand text-sm font-extrabold text-surface">
                                {initials}
                            </span>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-ink">
                                    {user.name}
                                </p>
                                <p className="truncate text-xs text-ink-muted">
                                    {user.email}
                                </p>
                            </div>
                        </div>
                    )}

                    <Link
                        href="/"
                        className="mt-5 flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-bold text-ink-muted transition-colors hover:bg-surface-alt hover:text-brand"
                    >
                        <ArrowLeft aria-hidden="true" className="size-4" />
                        Back to the shop
                    </Link>
                </div>
            </aside>

            <div className="min-w-0">{children}</div>
        </Container>
    );
}
