import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, Banknote, Check, Phone } from 'lucide-react';
import { Container } from '@/components/storefront/container';
import { Heading } from '@/components/storefront/heading';
import account from '@/routes/account';
import type { SharedPageProps } from '@/types/inertia-config';

const focusRing =
    'focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none';

function OrderCompletedTopBar() {
    return (
        <div className="border-b border-line bg-surface-alt/80">
            <Container className="flex min-h-16 items-center justify-between gap-3 py-3">
                <Link
                    href="/"
                    className={`flex min-h-11 items-center gap-2.5 rounded-xl ${focusRing} focus-visible:ring-offset-surface-alt`}
                >
                    <span
                        aria-hidden="true"
                        className="flex size-9 items-center justify-center rounded-xl bg-brand font-display text-lg font-extrabold text-surface"
                    >
                        S
                    </span>
                    <span className="font-display text-lg font-extrabold tracking-tight text-ink">
                        ShopHub
                    </span>
                </Link>
                <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-bold text-ink-muted">
                    <span
                        aria-hidden="true"
                        className="size-2 rounded-full bg-mint"
                    />
                    Order placed
                </span>
            </Container>
        </div>
    );
}

export default function OrderCompleted() {
    const { auth } = usePage<SharedPageProps>().props;
    const user = auth.user;

    return (
        <div className="storefront flex min-h-dvh flex-col bg-surface text-ink">
            <Head title="Order placed" />

            <OrderCompletedTopBar />

            <main className="flex flex-1 items-start">
                <Container className="py-5 sm:py-8 lg:py-10">
                    <section
                        aria-labelledby="order-placed-heading"
                        className="overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_24px_60px_-32px_var(--brand-deep)]"
                    >
                        <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
                            <div className="bg-brand-deep px-5 py-7 text-surface sm:px-8 sm:py-10 lg:px-12 lg:py-14">
                                <span className="flex size-12 items-center justify-center rounded-2xl bg-mint text-brand-deep shadow-[0_12px_30px_-16px_var(--mint)] sm:size-14">
                                    <Check
                                        aria-hidden="true"
                                        className="size-7"
                                        strokeWidth={3}
                                    />
                                </span>

                                <Heading
                                    level={1}
                                    size="page"
                                    tone="surface"
                                    id="order-placed-heading"
                                    className="mt-5 sm:mt-6"
                                >
                                    Order placed.
                                </Heading>

                                <p className="mt-3 max-w-xl text-base leading-relaxed text-surface/85 sm:mt-4 sm:text-lg">
                                    Thanks for shopping with ShopHub. We'll call
                                    you shortly to confirm your order and
                                    arrange payment.
                                </p>

                                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-semibold text-surface/80">
                                    <span className="inline-flex items-center gap-2">
                                        <span
                                            aria-hidden="true"
                                            className="size-2 rounded-full bg-mint"
                                        />
                                        No payment was taken
                                    </span>
                                    <span
                                        aria-hidden="true"
                                        className="hidden h-4 w-px bg-surface/25 sm:block"
                                    />
                                    <span>A call comes next</span>
                                </div>

                                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <Link
                                        id="continue-shopping"
                                        href="/products"
                                        className={`inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-surface px-6 text-sm font-extrabold text-brand-deep transition-colors hover:bg-brand-soft sm:w-auto ${focusRing} focus-visible:ring-offset-brand-deep`}
                                    >
                                        Continue shopping
                                        <ArrowRight
                                            aria-hidden="true"
                                            className="size-4"
                                        />
                                    </Link>
                                </div>

                                <p className="mt-5 text-sm leading-relaxed text-surface/70">
                                    {user
                                        ? 'Signed in? This order is in your order history.'
                                        : "Shopping as a guest? No account needed — we'll reach you at the phone number you gave at checkout."}
                                </p>
                            </div>

                            <aside
                                aria-labelledby="what-happens-next-heading"
                                className="bg-surface px-5 py-7 sm:px-8 sm:py-10 lg:px-10 lg:py-14"
                            >
                                <Heading
                                    level={2}
                                    size="compact"
                                    id="what-happens-next-heading"
                                >
                                    What happens next
                                </Heading>

                                <ol className="mt-5 grid gap-5 sm:mt-6 sm:grid-cols-2 lg:grid-cols-1">
                                    <li className="flex gap-3">
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-mint-soft text-brand-deep">
                                            <Phone
                                                aria-hidden="true"
                                                className="size-4"
                                            />
                                        </span>
                                        <div>
                                            <h3 className="text-sm font-extrabold text-ink">
                                                We'll call you
                                            </h3>
                                            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                                                We'll confirm the details using
                                                the phone number you gave at
                                                checkout.
                                            </p>
                                        </div>
                                    </li>

                                    <li className="flex gap-3">
                                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-coral-soft text-brand-deep">
                                            <Banknote
                                                aria-hidden="true"
                                                className="size-4"
                                            />
                                        </span>
                                        <div>
                                            <h3 className="text-sm font-extrabold text-ink">
                                                Payment comes later
                                            </h3>
                                            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                                                Nothing was charged here. We'll
                                                arrange payment together when
                                                we're in touch.
                                            </p>
                                        </div>
                                    </li>
                                </ol>

                                <div className="mt-6 rounded-2xl border border-line bg-mint-soft p-4">
                                    <p className="text-sm font-extrabold text-brand-deep">
                                        Your order is saved.
                                    </p>
                                    <p className="mt-1 text-xs leading-relaxed text-ink">
                                        Keep an eye on your phone — a call from
                                        ShopHub is the next step.
                                    </p>
                                </div>

                                {user && (
                                    <Link
                                        href={account.orders.index.url()}
                                        className={`mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-5 text-sm font-extrabold text-brand-deep transition-colors hover:border-brand hover:bg-brand-soft ${focusRing}`}
                                    >
                                        View your orders
                                        <ArrowRight
                                            aria-hidden="true"
                                            className="size-4"
                                        />
                                    </Link>
                                )}
                            </aside>
                        </div>
                    </section>

                    <div className="mt-5 flex flex-col gap-3 text-xs font-semibold text-ink-muted sm:flex-row sm:items-center sm:justify-between sm:text-sm">
                        <p className="flex items-center gap-2">
                            <span
                                aria-hidden="true"
                                className="size-2 rounded-full bg-mint"
                            />
                            No account needed to order from ShopHub.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link
                                href="/contact"
                                className={`inline-flex min-h-11 items-center rounded-sm font-bold text-brand underline decoration-line underline-offset-4 hover:text-brand-deep ${focusRing}`}
                            >
                                Contact us
                            </Link>
                            <Link
                                href="/faq"
                                className={`inline-flex min-h-11 items-center rounded-sm font-bold text-brand underline decoration-line underline-offset-4 hover:text-brand-deep ${focusRing}`}
                            >
                                FAQ
                            </Link>
                        </div>
                    </div>
                </Container>
            </main>
        </div>
    );
}
