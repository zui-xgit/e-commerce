import { Link } from "@inertiajs/react";
import { ChevronDown } from "lucide-react";
import { StorefrontBreadcrumbs } from "@/components/storefront/breadcrumbs";
import { Container } from "@/components/storefront/container";
import { Heading } from "@/components/storefront/heading";
import { PageHeader } from "@/components/storefront/page-header";
import { cn } from "@/lib/utils";

type FaqItem = {
    question: string;
    answer: string;
};

type FaqGroup = {
    id: string;
    title: string;
    description: string;
    items: FaqItem[];
};

const faqGroups: FaqGroup[] = [
    {
        id: "orders",
        title: "Orders",
        description: "Placing orders, confirmations, and changes.",
        items: [
            {
                question: "How do I place an order?",
                answer: "Browse products, add items to your cart, and follow the checkout steps. Once payment is confirmed, you will receive an order confirmation with your details.",
            },
            {
                question: "Can I change or cancel my order?",
                answer: "If your order has not been dispatched yet, contact us as soon as possible. We will do our best to update or cancel it before it leaves our store.",
            },
        ],
    },
    {
        id: "shipping",
        title: "Shipping",
        description: "Delivery areas, timing, and fees.",
        items: [
            {
                question: "Where do you deliver?",
                answer: "We deliver across Dar es Salaam and to selected regions in Tanzania. Delivery availability and timing depend on your location and the product.",
            },
            {
                question: "How long does delivery take?",
                answer: "Dar es Salaam deliveries are often same day or next business day for in-stock items. Other regions typically take 2 to 5 business days. See the Shipping policy for details.",
            },
        ],
    },
    {
        id: "returns",
        title: "Returns",
        description: "Refunds, exchanges, and faulty items.",
        items: [
            {
                question: "What is your return window?",
                answer: "Most unused items in original condition can be returned within 7 days of delivery. Some items have limited eligibility, as explained in our Refund policy.",
            },
            {
                question: "What if I receive a faulty product?",
                answer: "Contact us right away with your order number and details. We will review the issue and arrange a replacement, repair, or refund depending on the situation.",
            },
        ],
    },
    {
        id: "payments",
        title: "Payments",
        description: "Payment methods and pricing.",
        items: [
            {
                question: "Which payment methods do you accept?",
                answer: "Available payment methods are shown at checkout. As we complete the checkout experience, supported options may include mobile money and other approved methods.",
            },
            {
                question: "Are prices final?",
                answer: "Prices are shown before you confirm your order. Delivery fees, when applicable, are displayed during checkout before payment is completed.",
            },
        ],
    },
    {
        id: "account",
        title: "Account",
        description: "Accounts, privacy, and support.",
        items: [
            {
                question: "Do I need an account to shop?",
                answer: "You can browse products without an account. Creating an account makes it easier to track orders, save addresses, and manage your details.",
            },
            {
                question: "How is my information handled?",
                answer: "We use your information to process orders and provide support. Read our Privacy policy for details on what we collect and how we protect it.",
            },
        ],
    },
];

const policyLinks = [
    { href: "/policies/shipping", label: "Shipping policy" },
    { href: "/policies/refund", label: "Refund policy" },
    { href: "/policies/privacy", label: "Privacy policy" },
    { href: "/policies/terms", label: "Terms of service" },
];

const detailsClassName =
    "group rounded-2xl border border-line bg-surface open:bg-surface-alt/40";

export default function FaqPage() {
    return (
        <Container className="pb-16 sm:pb-20">
            <StorefrontBreadcrumbs className="mb-6" />

            <div className="max-w-3xl">
                <PageHeader
                    title="Answers before you buy."
                    description="Quick answers to common questions about orders, delivery, returns, payments, and your account. If you need more help, our team is a message away."
                />
            </div>

            <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-start">
                <div className="space-y-10">
                    {faqGroups.map((group) => (
                        <section
                            key={group.id}
                            aria-labelledby={`${group.id}-heading`}
                            className="scroll-mt-28"
                        >
                            <div className="mb-4">
                                <Heading
                                    id={`${group.id}-heading`}
                                    size="section"
                                >
                                    {group.title}
                                </Heading>
                                <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                                    {group.description}
                                </p>
                            </div>

                            <div className="space-y-3">
                                {group.items.map((item, index) => (
                                    <details
                                        key={item.question}
                                        className={detailsClassName}
                                    >
                                        <summary
                                            className={cn(
                                                "flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left text-sm font-bold text-ink marker:content-none sm:text-base",
                                                "[&::-webkit-details-marker]:hidden",
                                            )}
                                        >
                                            <span>{item.question}</span>
                                            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-deep transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none">
                                                <ChevronDown
                                                    aria-hidden="true"
                                                    className="size-4"
                                                />
                                            </span>
                                        </summary>
                                        <div className="px-5 pb-5 text-sm leading-7 text-ink-muted sm:text-base">
                                            <p>{item.answer}</p>
                                            {group.id === "shipping" &&
                                                index === 1 && (
                                                    <p className="mt-3">
                                                        <Link
                                                            href="/policies/shipping"
                                                            className="font-semibold text-brand underline decoration-line underline-offset-4 hover:text-brand-deep"
                                                        >
                                                            Read the Shipping
                                                            policy
                                                        </Link>
                                                    </p>
                                                )}
                                            {group.id === "returns" &&
                                                index === 0 && (
                                                    <p className="mt-3">
                                                        <Link
                                                            href="/policies/refund"
                                                            className="font-semibold text-brand underline decoration-line underline-offset-4 hover:text-brand-deep"
                                                        >
                                                            Read the Refund
                                                            policy
                                                        </Link>
                                                    </p>
                                                )}
                                            {group.id === "account" &&
                                                index === 1 && (
                                                    <p className="mt-3">
                                                        <Link
                                                            href="/policies/privacy"
                                                            className="font-semibold text-brand underline decoration-line underline-offset-4 hover:text-brand-deep"
                                                        >
                                                            Read the Privacy
                                                            policy
                                                        </Link>
                                                    </p>
                                                )}
                                        </div>
                                    </details>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                <aside className="rounded-2xl border border-line bg-surface p-6 lg:sticky lg:top-24">
                    <Heading level={2} size="card">
                        Policies &amp; support
                    </Heading>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                        Need the full details? These pages cover the fine print.
                    </p>
                    <ul className="mt-4 space-y-1">
                        {policyLinks.map((link) => (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className="flex min-h-11 items-center rounded-lg px-3 text-sm font-semibold text-ink-muted transition-colors hover:bg-brand-soft hover:text-brand-deep focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none"
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <div className="mt-5 rounded-xl bg-surface-alt p-4">
                        <p className="text-sm font-bold text-ink">
                            Still have a question?
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                            Our team can help with products, orders, and
                            delivery.
                        </p>
                        <Link
                            href="/contact"
                            className="mt-3 inline-flex min-h-11 items-center font-semibold text-brand hover:text-brand-deep"
                        >
                            Contact us
                        </Link>
                    </div>
                </aside>
            </div>
        </Container>
    );
}
