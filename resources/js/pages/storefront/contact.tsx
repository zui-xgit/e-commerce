import { useForm } from '@inertiajs/react';
import { Clock3, Mail, MapPin, Phone } from 'lucide-react';
import type { ChangeEvent, FormEvent } from 'react';
import { StorefrontBreadcrumbs } from '@/components/storefront/breadcrumbs';
import { Container } from '@/components/storefront/container';
import { Heading } from '@/components/storefront/heading';
import { PageHeader } from '@/components/storefront/page-header';
import { SectionHeading } from '@/components/storefront/section-heading';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { storefrontToast } from '@/lib/storefront/storefront-toast';
import { cn } from '@/lib/utils';

type ContactFormData = {
    email: string;
    message: string;
};

const initialData: ContactFormData = {
    email: '',
    message: '',
};

const fieldClassName =
    'min-h-12 rounded-xl border-line bg-surface text-ink placeholder:text-ink-muted/80 focus-visible:border-brand focus-visible:ring-brand/20';

function FieldError({ id, message }: { id: string; message?: string }) {
    if (!message) {
        return null;
    }

    return (
        <p
            id={id}
            className="mt-2 text-sm font-medium text-error"
            role="status"
        >
            {message}
        </p>
    );
}

export default function ContactPage() {
    const form = useForm<ContactFormData>(initialData);

    const validate = () => {
        form.clearErrors();
        const errors: Partial<Record<keyof ContactFormData, string>> = {};
        const email = form.data.email.trim();
        const message = form.data.message.trim();

        if (!email) {
            errors.email = 'Please enter your email address.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = 'Enter a valid email address.';
        }
        if (!message) {
            errors.message = 'Please tell us how we can help.';
        } else if (message.length < 10) {
            errors.message = 'Your message should be at least 10 characters.';
        }

        if (Object.keys(errors).length > 0) {
            form.setError(errors);
            return false;
        }

        return true;
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!validate()) return;

        storefrontToast('Message sent. We will get back to you shortly.');
        form.setData(initialData);
        form.clearErrors();
    };

    const setField = (
        field: keyof ContactFormData,
        event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        form.setData(field, event.target.value);
        if (form.errors[field]) {
            form.clearErrors(field);
        }
    };

    return (
        <Container className="pb-16 sm:pb-20">
            <StorefrontBreadcrumbs className="mb-6" />

            <div className="max-w-3xl">
                <PageHeader
                    title="We’re here to help."
                    description="Have a question about a product, an order, or delivery? Send us a message or reach us directly. Our team in Dar es Salaam is ready to help."
                />
            </div>

            <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-8">
                <aside className="space-y-4">
                    <section className="rounded-2xl border border-line bg-surface p-6">
                        <Heading level={2} size="card">
                            Contact details
                        </Heading>
                        <dl className="mt-5 space-y-4 text-sm">
                            <div className="flex gap-3">
                                <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-deep">
                                    <Phone
                                        aria-hidden="true"
                                        className="size-5"
                                    />
                                </span>
                                <div>
                                    <dt className="font-bold text-ink">
                                        Phone
                                    </dt>
                                    <dd className="mt-1 text-ink-muted">
                                        <a
                                            href="tel:+255748333444"
                                            className="font-semibold text-brand hover:text-brand-deep"
                                        >
                                            0748 333 444
                                        </a>
                                    </dd>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-deep">
                                    <Mail
                                        aria-hidden="true"
                                        className="size-5"
                                    />
                                </span>
                                <div>
                                    <dt className="font-bold text-ink">
                                        Email
                                    </dt>
                                    <dd className="mt-1 text-ink-muted">
                                        <a
                                            href="mailto:support@laptopcity.co.tz"
                                            className="font-semibold text-brand hover:text-brand-deep"
                                        >
                                            support@laptopcity.co.tz
                                        </a>
                                    </dd>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-deep">
                                    <MapPin
                                        aria-hidden="true"
                                        className="size-5"
                                    />
                                </span>
                                <div>
                                    <dt className="font-bold text-ink">
                                        Location
                                    </dt>
                                    <dd className="mt-1 leading-relaxed text-ink-muted">
                                        Samora Avenue, Dar es Salaam, Tanzania
                                    </dd>
                                </div>
                            </div>
                        </dl>
                    </section>

                    <section className="rounded-2xl border border-line bg-surface-alt p-6">
                        <div className="flex items-center gap-2">
                            <Clock3
                                aria-hidden="true"
                                className="size-5 text-brand"
                            />
                            <Heading level={2} size="card">
                                Business hours
                            </Heading>
                        </div>
                        <dl className="mt-4 space-y-3 text-sm">
                            <div className="flex items-center justify-between gap-4 border-b border-line pb-3">
                                <dt className="text-ink-muted">
                                    Monday – Friday
                                </dt>
                                <dd className="font-semibold text-ink">
                                    9:00 AM – 6:00 PM
                                </dd>
                            </div>
                            <div className="flex items-center justify-between gap-4 border-b border-line pb-3">
                                <dt className="text-ink-muted">Saturday</dt>
                                <dd className="font-semibold text-ink">
                                    10:00 AM – 4:00 PM
                                </dd>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <dt className="text-ink-muted">Sunday</dt>
                                <dd className="font-semibold text-ink">
                                    Closed
                                </dd>
                            </div>
                        </dl>
                    </section>
                </aside>

                <section
                    aria-labelledby="contact-form-heading"
                    className="rounded-2xl border border-line bg-surface p-6 sm:p-8"
                >
                    <SectionHeading
                        id="contact-form-heading"
                        title="Send a message"
                        description="Fill out the form below and we’ll respond as soon as possible during business hours."
                    />

                    <form
                        className="mt-6 space-y-5"
                        onSubmit={handleSubmit}
                        noValidate
                    >
                        <div>
                            <Label
                                htmlFor="contact-email"
                                className="text-sm font-bold text-ink"
                            >
                                Email address
                            </Label>
                            <Input
                                id="contact-email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                value={form.data.email}
                                onChange={(e) => setField('email', e)}
                                aria-invalid={Boolean(form.errors.email)}
                                aria-describedby={
                                    form.errors.email
                                        ? 'contact-email-error'
                                        : undefined
                                }
                                className={cn(
                                    fieldClassName,
                                    form.errors.email && 'border-error',
                                )}
                                placeholder="you@example.com"
                            />
                            <FieldError
                                id="contact-email-error"
                                message={form.errors.email}
                            />
                        </div>

                        <div>
                            <Label
                                htmlFor="contact-message"
                                className="text-sm font-bold text-ink"
                            >
                                Message
                            </Label>
                            <textarea
                                id="contact-message"
                                name="message"
                                rows={6}
                                value={form.data.message}
                                onChange={(e) => setField('message', e)}
                                aria-invalid={Boolean(form.errors.message)}
                                aria-describedby={
                                    form.errors.message
                                        ? 'contact-message-error'
                                        : undefined
                                }
                                className={cn(
                                    'w-full rounded-xl border border-line bg-surface px-3 py-3 text-base text-ink transition-[color,box-shadow] outline-none placeholder:text-ink-muted/80 focus-visible:border-brand focus-visible:ring-[3px] focus-visible:ring-brand/20 md:text-sm',
                                    form.errors.message && 'border-error',
                                )}
                                placeholder="Tell us what you need help with..."
                            />
                            <FieldError
                                id="contact-message-error"
                                message={form.errors.message}
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-1">
                            <button
                                type="submit"
                                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-brand px-6 text-sm font-extrabold text-surface transition-colors hover:bg-brand-deep focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none"
                            >
                                Send message
                            </button>
                            <p className="text-xs leading-relaxed text-ink-muted">
                                We usually reply within one business day.
                            </p>
                        </div>
                    </form>
                </section>
            </div>
        </Container>
    );
}
