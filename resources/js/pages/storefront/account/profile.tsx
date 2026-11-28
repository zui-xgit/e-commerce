import { Link, usePage } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import { AccountPageHeader } from '@/components/storefront/account-page-header';
import { StorefrontBreadcrumbs } from '@/components/storefront/breadcrumbs';
import { Heading } from '@/components/storefront/heading';
import { useInitials } from '@/hooks/use-initials';
import type { SharedPageProps } from '@/types/inertia-config';

export default function StorefrontAccountProfilePage() {
    const { auth } = usePage<SharedPageProps>().props;
    const name = auth.user?.name ?? '';
    const email = auth.user?.email ?? '';
    const getInitials = useInitials();
    const initials = getInitials(name);

    return (
        <>
            <StorefrontBreadcrumbs className="mb-4 sm:mb-6" />

            <AccountPageHeader
                title="Account details"
                description="The contact details on your account. Editing opens when the real account endpoints land."
            >
                <span className="flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-xs font-extrabold text-ink-muted">
                    <span
                        aria-hidden="true"
                        className="size-2 rounded-full bg-mint"
                    />
                    Account profile · USD shop
                </span>
            </AccountPageHeader>

            <section
                aria-labelledby="profile-heading"
                className="mt-8 overflow-hidden rounded-2xl border border-line bg-surface"
            >
                <div className="flex items-center gap-4 border-b border-line p-5">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-brand text-base font-extrabold text-surface">
                        {initials}
                    </span>
                    <div className="min-w-0">
                        <Heading
                            id="profile-heading"
                            size="compact"
                            className="truncate"
                        >
                            {name}
                        </Heading>
                        <p className="truncate text-sm text-ink-muted">
                            {email}
                        </p>
                    </div>
                </div>
                <dl className="divide-y divide-line px-5">
                    {[
                        ['Name', name],
                        ['Email address', email],
                    ].map(([label, value]) => (
                        <div
                            key={label}
                            className="flex flex-col gap-1 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
                        >
                            <dt className="text-xs font-extrabold tracking-wide text-ink-muted uppercase">
                                {label}
                            </dt>
                            <dd className="text-sm font-bold text-ink">
                                {value}
                            </dd>
                        </div>
                    ))}
                </dl>
            </section>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                <p className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
                    <span
                        aria-hidden="true"
                        className="size-2 rounded-full bg-mint"
                    />
                    Details from your signed-in account.
                </p>
                <Link
                    href="/account/orders"
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl text-sm font-extrabold text-brand transition-colors hover:text-brand-deep"
                >
                    See your orders
                    <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
            </div>
        </>
    );
}
