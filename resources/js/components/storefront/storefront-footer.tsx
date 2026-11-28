import { Link, usePage } from "@inertiajs/react";
import { ArrowRight, ShoppingBag } from "lucide-react";
import icons from "@/assets/icons";
import { useCan } from "@/hooks/use-can";
import type { SharedPageProps } from "@/types/inertia-config";
import { Authentication } from "./authentication";
import { Container } from "./container";
import { LanguagePopover } from "./language-popover";
import { MonthlyDealsDialog } from "./dialogs/monthly-deals-dialog";

const linkClassName =
    "flex min-h-11 w-fit items-center rounded-sm text-sm font-semibold text-ink-muted transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-alt";

const socialLinks = [
    {
        label: "Facebook",
        href: "https://www.facebook.com/",
        icon: icons.facebook,
    },
    {
        label: "Instagram",
        href: "https://www.instagram.com/",
        icon: icons.instagram,
    },
    {
        label: "LinkedIn",
        href: "https://www.linkedin.com/",
        icon: icons.linkedin,
    },
];

export default function StorefrontFooter() {
    const { auth } = usePage<SharedPageProps>().props;
    const { hasRole } = useCan();
    const isCustomer = Boolean(auth.user) && hasRole("customer");
    const isAdmin = Boolean(auth.user) && hasRole("admin");

    return (
        <footer className="mt-12 border-t border-line bg-surface-alt sm:mt-16">
            <Container className="pt-8 sm:pt-10">
                <div className="flex flex-col gap-4 rounded-2xl border border-line bg-mint-soft p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div>
                        <h2 className="font-display text-xl leading-tight font-extrabold tracking-tight text-ink sm:text-2xl">
                            Monthly deals, minus the noise.
                        </h2>
                        <p className="mt-1 max-w-md text-sm leading-relaxed text-ink-muted">
                            One short email a month with fresh picks from the
                            catalogue.
                        </p>
                    </div>
                    <MonthlyDealsDialog>
                        <button
                            type="button"
                            aria-label="Sign up for monthly deals"
                            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-coral px-5 text-sm font-extrabold text-surface transition-[filter,box-shadow] hover:shadow-lg hover:brightness-95 motion-reduce:transition-none sm:w-auto"
                        >
                            Sign up for deals
                            <ArrowRight aria-hidden="true" className="size-4" />
                        </button>
                    </MonthlyDealsDialog>
                </div>
            </Container>

            <Container className="grid gap-8 pt-8 pb-10 sm:grid-cols-2 sm:gap-6 sm:pt-10 sm:pb-12 lg:grid-cols-5">
                <div className="sm:col-span-2 lg:col-span-1">
                    <Link
                        href="/"
                        className="flex w-fit items-center gap-2 rounded-sm focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-alt focus-visible:outline-none"
                    >
                        <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-surface">
                            <ShoppingBag
                                aria-hidden="true"
                                className="size-4"
                            />
                        </span>
                        <span className="font-display text-lg font-extrabold tracking-tight">
                            SHOP<span className="text-brand">HUB</span>
                        </span>
                    </Link>
                    <p className="mt-3 max-w-xs text-xs leading-relaxed text-ink-muted">
                        Laptop City, established in 2012 in Dar es Salaam.
                        Dependable tech, honest advice, and support you can
                        reach.
                    </p>
                    <div className="mt-4">
                        <p className="text-xs font-extrabold tracking-wide text-ink uppercase">
                            Follow us
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                            {socialLinks.map(({ label, href, icon }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={label}
                                    className="flex size-11 items-center justify-center rounded-lg border border-line bg-surface transition-[border-color,box-shadow] hover:border-brand hover:shadow-sm focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface-alt focus-visible:outline-none"
                                >
                                    <img
                                        src={icon}
                                        alt=""
                                        aria-hidden="true"
                                        className="size-5 shrink-0 object-contain"
                                    />
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <nav aria-label="Quick links">
                    <p className="text-xs font-extrabold tracking-wide text-ink uppercase">
                        Quick links
                    </p>
                    <div className="mt-2 flex flex-col items-start gap-1">
                        <Link href="/products" className={linkClassName}>
                            Shop all
                        </Link>
                        <Link href="/cart" className={linkClassName}>
                            Your cart
                        </Link>
                        <Link href="/about" className={linkClassName}>
                            About us
                        </Link>
                        <Link href="/contact" className={linkClassName}>
                            Contact
                        </Link>
                        <Link href="/faq" className={linkClassName}>
                            FAQ
                        </Link>
                    </div>
                </nav>

                <nav aria-label="Policies">
                    <p className="text-xs font-extrabold tracking-wide text-ink uppercase">
                        Policies
                    </p>
                    <div className="mt-2 flex flex-col items-start gap-1">
                        <Link
                            href="/policies/privacy"
                            className={linkClassName}
                        >
                            Privacy policy
                        </Link>
                        <Link href="/policies/refund" className={linkClassName}>
                            Refund policy
                        </Link>
                        <Link
                            href="/policies/shipping"
                            className={linkClassName}
                        >
                            Shipping policy
                        </Link>
                        <Link href="/policies/terms" className={linkClassName}>
                            Terms of service
                        </Link>
                    </div>
                </nav>

                <nav aria-label="Company">
                    <p className="text-xs font-extrabold tracking-wide text-ink uppercase">
                        Company
                    </p>
                    <div className="mt-2 flex flex-col items-start gap-1">
                        <Link href="/about" className={linkClassName}>
                            Our story
                        </Link>
                        <Link href="/contact" className={linkClassName}>
                            Contact us
                        </Link>
                        <a href="tel:+255748333444" className={linkClassName}>
                            0748 333 444
                        </a>
                    </div>
                </nav>

                <nav aria-label="Account links">
                    <p className="text-xs font-extrabold tracking-wide text-ink uppercase">
                        Account
                    </p>
                    <div className="mt-2 flex flex-col items-start gap-1">
                        {isCustomer ? (
                            <>
                                <Link
                                    href="/account/orders"
                                    className={linkClassName}
                                >
                                    Orders
                                </Link>
                                <Link
                                    href="/account/profile"
                                    className={linkClassName}
                                >
                                    Profile
                                </Link>
                                <Link
                                    href="/account/addresses"
                                    className={linkClassName}
                                >
                                    Addresses
                                </Link>
                            </>
                        ) : isAdmin ? (
                            <Link
                                href="/admin/dashboard"
                                className={linkClassName}
                            >
                                Admin dashboard
                            </Link>
                        ) : (
                            <Authentication>
                                <button
                                    type="button"
                                    aria-label="Log in or register"
                                    className={`${linkClassName} cursor-pointer`}
                                >
                                    Log in or register
                                </button>
                            </Authentication>
                        )}
                    </div>
                </nav>
            </Container>

            <Container className="flex flex-col gap-2 border-t border-line py-5 text-xs font-semibold text-ink-muted sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-center gap-2">
                    <span
                        aria-hidden="true"
                        className="size-2 rounded-full bg-mint"
                    />
                    Catalogue from your store · Prices in USD
                </p>
                <div className="flex items-center gap-3">
                    <p>Shophub market preview</p>
                    <LanguagePopover />
                </div>
            </Container>
        </footer>
    );
}
