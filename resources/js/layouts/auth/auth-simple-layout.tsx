import { Link } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";
import AppLogoIcon from "@/components/app-logo-icon";
import { home } from "@/routes";
import type { AuthLayoutProps } from "@/types";

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <main className="storefront flex min-h-svh flex-col bg-surface-alt px-4 py-6 text-ink sm:px-6 sm:py-10 lg:px-8">
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
                                    {title}
                                </h1>
                                {description && (
                                    <p className="text-sm leading-relaxed text-ink-muted text-pretty">
                                        {description}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-8">{children}</div>
                    </section>
                </div>
            </div>
        </main>
    );
}
