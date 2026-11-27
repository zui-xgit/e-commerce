import { Head, router } from "@inertiajs/react";
import { LoaderCircle, Mail, RotateCw, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Container } from "@/components/storefront/container";
import { Heading } from "@/components/storefront/heading";
import { cn } from "@/lib/utils";

const slats = Array.from({ length: 9 }, (_, index) => index);

function ClosedStall({ settled }: { settled: boolean }) {
    return (
        <svg
            viewBox="0 0 520 420"
            role="img"
            aria-label="The Shophub market stall with its striped shutter lowered and a back soon ticket hanging from it"
            className="mx-auto w-full max-w-[520px] overflow-visible"
        >
            <defs>
                <clipPath id="stall-awning">
                    <rect x="28" y="42" width="464" height="84" rx="18" />
                </clipPath>
            </defs>

            <rect
                x="32"
                y="42"
                width="456"
                height="332"
                rx="24"
                className="fill-brand-deep"
            />

            <g clipPath="url(#stall-awning)">
                {Array.from({ length: 8 }, (_, index) => (
                    <rect
                        key={index}
                        x={28 + index * 58}
                        y="42"
                        width="58"
                        height="84"
                        className={
                            index % 2 === 0 ? "fill-coral" : "fill-surface"
                        }
                    />
                ))}
            </g>
            {Array.from({ length: 8 }, (_, index) => (
                <circle
                    key={index}
                    cx={57 + index * 58}
                    cy="126"
                    r="18"
                    className={index % 2 === 0 ? "fill-coral" : "fill-surface"}
                />
            ))}

            <g
                className={cn(
                    "transition-transform duration-700 ease-out motion-reduce:transform-none motion-reduce:transition-none",
                    settled ? "translate-y-0" : "-translate-y-4",
                )}
            >
                <rect
                    x="72"
                    y="140"
                    width="376"
                    height="188"
                    rx="12"
                    className="fill-brand"
                />
                {slats.map((index) => (
                    <rect
                        key={index}
                        x="82"
                        y={150 + index * 19}
                        width="356"
                        height="10"
                        rx="5"
                        fill="var(--brand-deep)"
                        opacity={index % 2 === 0 ? 0.75 : 0.45}
                    />
                ))}
                <rect
                    x="64"
                    y="324"
                    width="392"
                    height="16"
                    rx="8"
                    className="fill-coral"
                />
            </g>

            <g
                transform="rotate(-5 372 286)"
                className={cn(
                    "transition-[transform,opacity] duration-700 ease-out motion-reduce:transform-none motion-reduce:transition-none",
                    settled
                        ? "translate-y-0 opacity-100"
                        : "translate-y-2 opacity-90",
                )}
            >
                <line
                    x1="340"
                    y1="206"
                    x2="340"
                    y2="250"
                    className="stroke-line"
                    strokeWidth="3"
                />
                <line
                    x1="418"
                    y1="206"
                    x2="418"
                    y2="250"
                    className="stroke-line"
                    strokeWidth="3"
                />
                <circle
                    cx="340"
                    cy="206"
                    r="5"
                    className="fill-surface stroke-line"
                    strokeWidth="2"
                />
                <circle
                    cx="418"
                    cy="206"
                    r="5"
                    className="fill-surface stroke-line"
                    strokeWidth="2"
                />
                <rect
                    x="308"
                    y="248"
                    width="142"
                    height="76"
                    rx="14"
                    className="fill-mint"
                />
                <text
                    x="379"
                    y="283"
                    textAnchor="middle"
                    className="fill-ink font-display text-2xl font-extrabold tracking-tight"
                >
                    BACK SOON
                </text>
                <text
                    x="379"
                    y="305"
                    textAnchor="middle"
                    className="fill-ink-muted text-[11px] font-extrabold tracking-[0.18em] uppercase"
                >
                    Shophub
                </text>
            </g>

            <rect
                x="24"
                y="358"
                width="472"
                height="16"
                rx="8"
                className="fill-brand-deep"
            />
            <rect
                x="56"
                y="374"
                width="408"
                height="10"
                rx="5"
                className="fill-line"
            />
        </svg>
    );
}

export default function MaintenanceModePage() {
    const [settled, setSettled] = useState(false);
    const [isRetrying, setIsRetrying] = useState(false);

    useEffect(() => {
        setSettled(true);
    }, []);

    const handleRetry = () => {
        if (isRetrying) return;

        setIsRetrying(true);
        router.reload({
            onFinish: () => setIsRetrying(false),
        });
    };

    return (
        <div className="storefront flex min-h-dvh flex-col bg-surface text-ink">
            <Head title="Briefly closed" />

            <div className="bg-brand-deep text-surface">
                <Container className="flex min-h-14 items-center justify-between gap-3 sm:min-h-16">
                    <div className="flex items-center gap-2">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-mint text-brand-deep">
                            <ShoppingBag
                                aria-hidden="true"
                                className="size-4"
                            />
                        </span>
                        <span className="font-display text-sm font-extrabold tracking-tight sm:text-base">
                            SHOP<span className="text-mint">HUB</span>
                        </span>
                    </div>
                    <p
                        role="status"
                        className="flex items-center gap-2 text-[11px] font-bold tracking-wide uppercase sm:text-xs"
                    >
                        <span
                            aria-hidden="true"
                            className="size-2 rounded-full bg-mint"
                        />
                        Temporarily closed
                    </p>
                </Container>
            </div>

            <main className="flex flex-1 items-center">
                <Container className="grid gap-10 py-10 sm:py-14 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-16 lg:py-16">
                    <div className="order-2 lg:order-1">
                        <Heading level={1} size="display">
                            We're restocking the shelves.
                        </Heading>
                        <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted sm:mt-6 sm:text-lg">
                            Shophub is briefly closed while we make a few
                            improvements. Shopping is paused, so no new orders
                            or payments are being taken right now.
                        </p>

                        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <button
                                type="button"
                                onClick={handleRetry}
                                disabled={isRetrying}
                                aria-busy={isRetrying}
                                className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-coral px-6 text-sm font-extrabold text-surface transition-[filter,box-shadow] hover:brightness-95 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none disabled:cursor-wait disabled:opacity-80 motion-reduce:transition-none"
                            >
                                {isRetrying ? (
                                    <LoaderCircle
                                        aria-hidden="true"
                                        className="size-4 animate-spin motion-reduce:animate-none"
                                    />
                                ) : (
                                    <RotateCw
                                        aria-hidden="true"
                                        className="size-4"
                                    />
                                )}
                                {isRetrying ? "Checking…" : "Try again"}
                            </button>
                            <a
                                href="mailto:hello@shophub.test"
                                className="flex min-h-12 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-6 text-sm font-extrabold text-ink transition-[border-color,box-shadow] hover:border-brand hover:shadow-sm focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none motion-reduce:transition-none"
                            >
                                <Mail aria-hidden="true" className="size-4" />
                                Email support
                            </a>
                        </div>

                        <p className="mt-8 flex items-center gap-2 border-t border-line pt-6 text-sm font-semibold text-ink-muted">
                            <span
                                aria-hidden="true"
                                className="size-2 shrink-0 rounded-full bg-mint"
                            />
                            Your cart and account are right where you left them.
                        </p>
                        <p className="mt-3 text-sm text-ink-muted">
                            Prefer to talk?{" "}
                            <a
                                href="tel:+255748333444"
                                className="font-bold text-brand-deep underline decoration-brand/40 underline-offset-4 transition-colors hover:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none"
                            >
                                0748 333 444
                            </a>
                        </p>
                    </div>

                    <div className="order-1 lg:order-2">
                        <ClosedStall settled={settled} />
                    </div>
                </Container>
            </main>
        </div>
    );
}
