import { Link } from "@inertiajs/react";
import { ArrowRight, Clock3, ShieldCheck, Wrench } from "lucide-react";
import { StorefrontBreadcrumbs } from "@/components/storefront/breadcrumbs";
import { Container } from "@/components/storefront/container";
import { Heading } from "@/components/storefront/heading";
import { PageHeader } from "@/components/storefront/page-header";
import { SectionHeading } from "@/components/storefront/section-heading";

const values = [
    {
        title: "Genuine products",
        description:
            "We source laptops, accessories, and parts from trusted suppliers so you know exactly what you are buying.",
        icon: ShieldCheck,
    },
    {
        title: "Local support",
        description:
            "Based in Dar es Salaam, our team helps you choose the right device and supports you after purchase.",
        icon: Wrench,
    },
    {
        title: "Built for everyday work",
        description:
            "From students to businesses, we focus on reliable tech that fits real budgets and real deadlines.",
        icon: Clock3,
    },
];

export default function AboutPage() {
    return (
        <Container className="pb-16 sm:pb-20">
            <StorefrontBreadcrumbs className="mb-6" />

            <section className="grid gap-8 rounded-[2rem] border border-line bg-surface p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-end">
                <div className="max-w-3xl">
                    <PageHeader
                        title="Tech you can trust, from a team that knows Dar."
                        description="Established in 2012 in Dar es Salaam, Tanzania, Laptop City has helped students, professionals, and businesses find dependable laptops and accessories without the guesswork."
                    />
                </div>

                <div className="rounded-2xl bg-brand-deep p-6 text-surface">
                    <p className="text-xs font-bold tracking-wide text-surface/70 uppercase">
                        Since 2012
                    </p>
                    <p className="mt-3 font-display text-3xl font-extrabold tracking-tight">
                        Dar es Salaam, Tanzania
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-surface/80">
                        Serving customers with practical advice, honest pricing,
                        and support that continues after the sale.
                    </p>
                </div>
            </section>

            <section className="mt-12 sm:mt-16">
                <SectionHeading
                    title="What we sell"
                    description="A focused range of devices and essentials for work, school, and everyday use."
                    className="mb-6"
                />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {[
                        {
                            title: "Laptops",
                            description:
                                "New and reliable devices for study, business, and creative work.",
                        },
                        {
                            title: "Accessories",
                            description:
                                "Chargers, bags, mice, keyboards, and the extras that complete your setup.",
                        },
                        {
                            title: "Storage & components",
                            description:
                                "SSDs, RAM, and upgrades that help your machine keep up.",
                        },
                        {
                            title: "Support",
                            description:
                                "Guidance before you buy and help when you need it after.",
                        },
                    ].map((item) => (
                        <article
                            key={item.title}
                            className="rounded-2xl border border-line bg-surface p-5"
                        >
                            <Heading level={3} size="card">
                                {item.title}
                            </Heading>
                            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                                {item.description}
                            </p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="mt-12 sm:mt-16">
                <SectionHeading
                    title="Why choose us"
                    description="We keep the experience simple: clear advice, dependable products, and people you can reach."
                    className="mb-6"
                />
                <div className="grid gap-4 md:grid-cols-3">
                    {values.map(({ title, description, icon: Icon }) => (
                        <article
                            key={title}
                            className="rounded-2xl border border-line bg-surface p-6"
                        >
                            <span className="flex size-12 items-center justify-center rounded-xl bg-brand-soft text-brand-deep">
                                <Icon aria-hidden="true" className="size-6" />
                            </span>
                            <Heading level={3} size="card" className="mt-4">
                                {title}
                            </Heading>
                            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                                {description}
                            </p>
                        </article>
                    ))}
                </div>
            </section>

            <section className="mt-12 rounded-[2rem] bg-brand-deep px-6 py-8 text-surface sm:mt-16 sm:px-8 sm:py-10">
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                    <div className="max-w-2xl">
                        <SectionHeading
                            title="Need help finding the right laptop?"
                            description="Tell us what you need it for, and we will help you pick a setup that fits your work and budget."
                            tone="surface"
                        />
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/contact"
                            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-coral px-6 text-sm font-extrabold text-surface transition-colors hover:bg-coral/90 focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 focus-visible:ring-offset-brand-deep focus-visible:outline-none"
                        >
                            Contact us
                            <ArrowRight aria-hidden="true" className="size-4" />
                        </Link>
                        <Link
                            href="/products"
                            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-surface/25 px-6 text-sm font-bold text-surface transition-colors hover:bg-surface/10 focus-visible:ring-2 focus-visible:ring-mint focus-visible:ring-offset-2 focus-visible:ring-offset-brand-deep focus-visible:outline-none"
                        >
                            Browse products
                        </Link>
                    </div>
                </div>
            </section>
        </Container>
    );
}
