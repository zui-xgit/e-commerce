import { Link, usePage } from '@inertiajs/react';
import { Fragment, useMemo } from 'react';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';

type TrailItem = {
    label: string;
    href?: string;
};

type StorefrontBreadcrumbsProps = {
    currentLabel?: string;
    className?: string;
    id?: string;
};

const HOME: TrailItem = { label: 'Home', href: '/' };
const PRODUCTS: TrailItem = { label: 'Products', href: '/products' };
const ORDERS: TrailItem = { label: 'Orders', href: '/account/orders' };

type TrailRoute = {
    pattern: RegExp;
    build: (params: string[], currentLabel?: string) => TrailItem[];
};

const POLICIES: TrailItem = { label: 'Policies' };

const TRAIL_ROUTES: TrailRoute[] = [
    {
        pattern: /^\/$/,
        build: () => [{ label: 'Home' }],
    },
    {
        pattern: /^\/cart$/,
        build: () => [HOME, { label: 'Cart' }],
    },
    {
        pattern: /^\/checkout$/,
        build: () => [HOME, { label: 'Checkout' }],
    },
    {
        pattern: /^\/about$/,
        build: () => [HOME, { label: 'About' }],
    },
    {
        pattern: /^\/contact$/,
        build: () => [HOME, { label: 'Contact' }],
    },
    {
        pattern: /^\/faq$/,
        build: () => [HOME, { label: 'FAQ' }],
    },
    {
        pattern: /^\/products$/,
        build: () => [HOME, { label: 'Products' }],
    },
    {
        pattern: /^\/products\/([^/]+)$/,
        build: (params, currentLabel) => [
            HOME,
            PRODUCTS,
            {
                label:
                    currentLabel ?? `Product #${decodeURIComponent(params[0])}`,
            },
        ],
    },
    {
        pattern: /^\/policies\/privacy$/,
        build: () => [HOME, POLICIES, { label: 'Privacy policy' }],
    },
    {
        pattern: /^\/policies\/refund$/,
        build: () => [HOME, POLICIES, { label: 'Refund policy' }],
    },
    {
        pattern: /^\/policies\/shipping$/,
        build: () => [HOME, POLICIES, { label: 'Shipping policy' }],
    },
    {
        pattern: /^\/policies\/terms$/,
        build: () => [HOME, POLICIES, { label: 'Terms of service' }],
    },
    {
        pattern: /^\/account\/orders$/,
        build: () => [HOME, { label: 'Orders' }],
    },
    {
        pattern: /^\/account\/orders\/([^/]+)$/,
        build: (params, currentLabel) => [
            HOME,
            ORDERS,
            {
                label:
                    currentLabel ?? `Order #${decodeURIComponent(params[0])}`,
            },
        ],
    },
    {
        pattern: /^\/account\/addresses$/,
        build: () => [HOME, { label: 'Addresses' }],
    },
    {
        pattern: /^\/account\/profile$/,
        build: () => [HOME, { label: 'Account details' }],
    },
];

function buildTrail(path: string, currentLabel?: string): TrailItem[] {
    for (const route of TRAIL_ROUTES) {
        const match = route.pattern.exec(path);

        if (match) {
            return route.build(match.slice(1), currentLabel);
        }
    }

    return [HOME, { label: currentLabel ?? 'Page' }];
}

export function StorefrontBreadcrumbs({
    currentLabel,
    className,
    id,
}: StorefrontBreadcrumbsProps) {
    const page = usePage();
    const trail = useMemo(() => {
        const rawPath = page.url.split(/[?#]/, 1)[0] || '/';
        const path =
            rawPath.length > 1 ? rawPath.replace(/\/+$/, '') : rawPath;
        const label = currentLabel?.trim() || undefined;

        return buildTrail(path, label);
    }, [page.url, currentLabel]);

    return (
        <Breadcrumb id={id} className={cn('min-w-0', className)}>
            <BreadcrumbList className="flex-nowrap gap-1.5 text-xs font-bold text-ink-muted sm:gap-2 sm:text-sm">
                {trail.map((item, index) => {
                    const isLast = index === trail.length - 1;

                    return (
                        <Fragment key={`${item.href ?? 'current'}-${item.label}-${index}`}>
                            <BreadcrumbItem className="min-w-0">
                                {!isLast && item.href ? (
                                    <BreadcrumbLink
                                        asChild
                                        className="truncate rounded-sm px-0.5 py-0.5 text-ink-muted transition-colors hover:text-brand focus-visible:text-brand"
                                    >
                                        <Link href={item.href}>{item.label}</Link>
                                    </BreadcrumbLink>
                                ) : (
                                    <BreadcrumbPage
                                        title={item.label}
                                        className="max-w-[min(16rem,55vw)] truncate font-extrabold text-brand sm:max-w-sm"
                                    >
                                        {item.label}
                                    </BreadcrumbPage>
                                )}
                            </BreadcrumbItem>
                            {!isLast && (
                                <BreadcrumbSeparator className="shrink-0 text-line [&>svg]:size-3.5" />
                            )}
                        </Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
