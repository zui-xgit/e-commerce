import { Link, usePage } from "@inertiajs/react";
import { ArrowRight, Banknote, Check, Phone } from "lucide-react";
import { Container } from "@/components/storefront/container";
import { Heading } from "@/components/storefront/heading";

const focusRing =
    "focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:outline-none";

export default function OrderCompleted() {
    return (
        <div className="storefront flex min-h-screen items-center justify-center bg-surface text-ink">
            <Container className="">
                <section
                    aria-labelledby="order-placed-heading"
                    className="overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_18px_50px_-28px_var(--brand-deep)]"
                >
                    <div className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
                        <div className="bg-brand-deep px-6 py-8 text-surface sm:px-10 sm:py-10 lg:px-12 lg:py-12">
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
                                id="order-placed-heading"
                                tone="surface"
                                className="mt-5 sm:mt-6"
                            >
                                Order placed.
                            </Heading>
                            <p className="mt-3 max-w-xl text-base leading-relaxed text-surface/80 sm:mt-4 sm:text-lg">
                                Thanks for shopping with ShopHub. We'll call you
                                shortly to confirm your order and arrange
                                payment.
                            </p>

                            <div className="mt-6 flex flex-wrap items-center gap-3 sm:mt-8">
                                <Link
                                    id="continue-shopping"
                                    href="/products"
                                    className={`inline-flex min-h-12 items-center gap-2 rounded-xl bg-surface px-6 text-sm font-extrabold text-brand-deep transition-colors hover:bg-brand-soft ${focusRing} focus-visible:ring-offset-brand-deep`}
                                >
                                    Continue shopping
                                    <ArrowRight
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                </Link>
                            </div>

                            <p className="mt-5 text-sm leading-relaxed text-surface/70">
                                Shopping as a guest? No account needed — we'll
                                reach you at the phone number you gave at
                                checkout.
                            </p>
                        </div>

                        <div className="bg-surface px-6 py-8 sm:px-10 sm:py-10">
                            <Heading level={2} size="compact">
                                What happens next
                            </Heading>

                            <ol className="mt-6">
                                <li className="relative flex gap-4 pb-7 before:absolute before:top-9 before:left-[15px] before:h-[calc(100%-2rem)] before:w-px before:bg-line">
                                    <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-line bg-brand-soft text-brand-deep">
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
                                            We'll confirm the details using the
                                            phone number you gave at checkout.
                                        </p>
                                    </div>
                                </li>

                                <li className="relative flex gap-4">
                                    <span className="relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-line bg-brand-soft text-brand-deep">
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
                                            arrange payment together when we're
                                            in touch.
                                        </p>
                                    </div>
                                </li>
                            </ol>

                            <div className="mt-8 rounded-2xl border border-line bg-mint-soft p-4">
                                <p className="text-sm font-extrabold text-brand-deep">
                                    Your order is saved.
                                </p>
                                <p className="mt-1 text-xs leading-relaxed text-ink">
                                    Keep an eye on your phone — a call from
                                    ShopHub is the next step.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="mt-6 flex flex-col gap-3 text-xs font-semibold text-ink-muted sm:flex-row sm:items-center sm:justify-between">
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
                            className={`rounded-sm font-bold text-brand underline decoration-line underline-offset-4 hover:text-brand-deep ${focusRing} focus-visible:ring-offset-surface`}
                        >
                            Contact us
                        </Link>
                        <Link
                            href="/faq"
                            className={`rounded-sm font-bold text-brand underline decoration-line underline-offset-4 hover:text-brand-deep ${focusRing} focus-visible:ring-offset-surface`}
                        >
                            FAQ
                        </Link>
                    </div>
                </div>
            </Container>
        </div>
    );
}
