import type { ReactNode } from 'react';
import { StorefrontBreadcrumbs } from '@/components/storefront/breadcrumbs';
import { Container } from '@/components/storefront/container';
import { Heading } from '@/components/storefront/heading';
import { PageHeader } from '@/components/storefront/page-header';
import { cn } from '@/lib/utils';

export type PolicySection = {
    id: string;
    title: string;
    content: ReactNode;
};

type PolicyPageProps = {
    title: string;
    summary: string;
    lastUpdated: string;
    sections: PolicySection[];
    children?: ReactNode;
};

const tocLinkClassName =
    'flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-ink-muted transition-colors hover:bg-brand-soft hover:text-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface';

export function PolicyPage({
    title,
    summary,
    lastUpdated,
    sections,
    children,
}: PolicyPageProps) {
    return (
        <Container className="pb-16 sm:pb-20">
            <StorefrontBreadcrumbs className="mb-6" />

            <header className="max-w-3xl">
                <PageHeader title={title} description={summary} />
                <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-surface-alt px-4 py-2 text-xs font-bold text-ink-muted">
                    <span
                        aria-hidden="true"
                        className="size-2 rounded-full bg-mint"
                    />
                    Last updated {lastUpdated}
                </p>
            </header>

            <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:items-start lg:gap-12">
                {sections.length > 0 && (
                    <nav
                        aria-label={`${title} sections`}
                        className="rounded-2xl border border-line bg-surface p-4 lg:sticky lg:top-24"
                    >
                        <p className="px-3 text-xs font-extrabold tracking-wide text-ink uppercase">
                            On this page
                        </p>
                        <ul className="mt-2 space-y-1">
                            {sections.map((section) => (
                                <li key={section.id}>
                                    <a
                                        href={`#${section.id}`}
                                        className={tocLinkClassName}
                                    >
                                        {section.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                )}

                <div
                    className={cn(
                        'min-w-0',
                        sections.length === 0 && 'lg:col-span-2',
                    )}
                >
                    <div className="space-y-10">
                        {sections.map((section, index) => (
                            <section
                                key={section.id}
                                id={section.id}
                                aria-labelledby={`${section.id}-heading`}
                                className={cn(
                                    'scroll-mt-28 border-b border-line pb-10 last:border-b-0 last:pb-0',
                                    index === 0 && 'pt-0',
                                )}
                            >
                                <Heading
                                    id={`${section.id}-heading`}
                                    size="section"
                                >
                                    {section.title}
                                </Heading>
                                <div className="mt-4 space-y-4 text-sm leading-7 text-ink-muted sm:text-base sm:leading-8 [&_a]:font-semibold [&_a]:text-brand [&_a]:underline [&_a]:decoration-line [&_a]:underline-offset-4 [&_a]:transition-colors hover:[&_a]:text-brand-deep [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-5 [&_strong]:font-semibold [&_strong]:text-ink [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
                                    {section.content}
                                </div>
                            </section>
                        ))}
                    </div>
                    {children}
                </div>
            </div>
        </Container>
    );
}
