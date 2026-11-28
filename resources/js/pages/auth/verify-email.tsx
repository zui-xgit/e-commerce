import { Form, Head, Link } from "@inertiajs/react";
import { LoaderCircle, MailCheck } from "lucide-react";
import AppLogoIcon from "@/components/app-logo-icon";
import { home, logout } from "@/routes";
import { send } from "@/routes/verification";

const authLinkClass =
    "font-bold text-brand underline-offset-4 transition-colors hover:text-brand-deep hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <main className="storefront flex min-h-svh flex-col bg-surface-alt px-4 py-6 text-ink sm:px-6 sm:py-10 lg:px-8">
            <Head title="Email verification" />

            <div className="flex flex-1 items-center justify-center">
                <div className="w-full max-w-[26rem]">
                    <section className="rounded-3xl border border-line bg-surface p-6 shadow-[0_18px_45px_-28px_color-mix(in_oklch,var(--brand-deep)_40%,transparent)] sm:p-8">
                        <div className="flex items-start gap-4">
                            <Link
                                href={home()}
                                aria-label="ShopHub home"
                                className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-brand-deep text-surface shadow-[0_8px_18px_-12px_var(--brand-deep)] transition-colors hover:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand sm:size-11"
                            >
                                <AppLogoIcon className="size-5 fill-current sm:size-6" />
                            </Link>

                            <div className="min-w-0 space-y-2 pt-0.5">
                                <h1 className="font-display text-xl leading-tight font-extrabold tracking-[-0.04em] text-balance text-ink sm:text-2xl">
                                    Verify your email
                                </h1>
                                <p className="text-sm leading-relaxed text-ink-muted text-pretty">
                                    One more step before your staff account can
                                    manage the store.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8">
                            <div className="mb-6 flex flex-col items-center gap-3 text-center">
                                <MailCheck
                                    aria-hidden="true"
                                    className="size-7 text-brand-deep"
                                />
                                <p className="max-w-xs text-sm leading-relaxed text-ink-muted text-pretty">
                                    Check your staff inbox for the verification
                                    link. Once verified, you can sign in to
                                    manage the store.
                                </p>
                            </div>

                            {status === "verification-link-sent" && (
                                <div
                                    role="status"
                                    className="mb-6 bg-mint-soft px-3 py-2 text-center text-sm font-semibold text-ink"
                                >
                                    A new verification link has been sent to the
                                    email address you provided during
                                    registration.
                                </div>
                            )}

                            <Form {...send.form()} className="space-y-4">
                                {({ processing }) => (
                                    <>
                                        <button
                                            type="submit"
                                            disabled={processing}
                                            data-test="resend-verification-email-button"
                                            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-extrabold text-surface shadow-[0_10px_22px_-14px_var(--brand-deep)] transition-[background-color,box-shadow] hover:bg-brand-deep hover:shadow-[0_14px_28px_-16px_var(--brand-deep)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
                                        >
                                            {processing && (
                                                <LoaderCircle
                                                    aria-hidden="true"
                                                    className="size-4 animate-spin"
                                                />
                                            )}
                                            {processing
                                                ? "Sending link..."
                                                : "Resend verification email"}
                                        </button>

                                        <p className="text-center text-sm text-ink-muted">
                                            Need to switch accounts?{" "}
                                            <Link
                                                href={logout()}
                                                className={authLinkClass}
                                            >
                                                Log out
                                            </Link>
                                        </p>
                                    </>
                                )}
                            </Form>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}
