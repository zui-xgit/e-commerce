import { Head, Link, useForm } from "@inertiajs/react";
import { LoaderCircle } from "lucide-react";
import { type FormEvent } from "react";
import { Input, PasswordInput } from "@/components/storefront/input";
import { register } from "@/routes";
import { store } from "@/routes/login";
import { request } from "@/routes/password";

type Props = {
    status?: string;
    canResetPassword: boolean;
};

const authLinkClass =
    "font-bold text-brand underline-offset-4 transition-colors hover:text-brand-deep hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand";

function FieldError({ id, message }: { id: string; message?: string }) {
    if (!message) return null;

    return (
        <p id={id} className="mt-1.5 text-xs font-semibold text-error">
            {message}
        </p>
    );
}

export default function Login({ status, canResetPassword }: Props) {
    const form = useForm({
        email: "",
        password: "",
        remember: false,
        portal: "admin",
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();

        form.post(store().url, {
            onSuccess: () => form.reset("password"),
        });
    };

    return (
        <>
            <Head title="Store sign in" />

            {status && (
                <div
                    role="status"
                    className="mb-6 rounded-xl border border-mint bg-mint-soft px-3 py-2 text-center text-sm font-semibold text-ink"
                >
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-5">
                <div className="space-y-1.5">
                    <label
                        htmlFor="email"
                        className="block text-sm font-bold text-ink"
                    >
                        Email address
                    </label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={form.data.email}
                        onChange={(e) => form.setData("email", e.target.value)}
                        required
                        autoFocus
                        tabIndex={1}
                        autoComplete="email"
                        placeholder="you@example.com"
                        invalid={!!form.errors.email}
                        aria-describedby={
                            form.errors.email ? "email-error" : undefined
                        }
                    />
                    <FieldError id="email-error" message={form.errors.email} />
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3">
                        <label
                            htmlFor="password"
                            className="block text-sm font-bold text-ink"
                        >
                            Password
                        </label>
                        {canResetPassword && (
                            <Link
                                href={request()}
                                className={`${authLinkClass} text-xs`}
                                tabIndex={5}
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>
                    <PasswordInput
                        id="password"
                        name="password"
                        value={form.data.password}
                        onChange={(e) =>
                            form.setData("password", e.target.value)
                        }
                        required
                        tabIndex={2}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        invalid={!!form.errors.password}
                        aria-describedby={
                            form.errors.password ? "password-error" : undefined
                        }
                    />
                    <FieldError
                        id="password-error"
                        message={form.errors.password}
                    />
                </div>

                <label
                    htmlFor="remember"
                    className="group flex w-fit cursor-pointer items-center gap-2.5 text-sm font-semibold text-ink-muted"
                >
                    <input
                        id="remember"
                        name="remember"
                        type="checkbox"
                        checked={form.data.remember}
                        onChange={(e) =>
                            form.setData("remember", e.target.checked)
                        }
                        tabIndex={3}
                        className="size-4 rounded-[5px] border-line bg-surface-alt accent-brand shadow-none focus-visible:ring-[3px] focus-visible:ring-brand/20"
                    />
                    <span className="transition-colors group-hover:text-ink">
                        Remember me
                    </span>
                </label>

                <button
                    type="submit"
                    tabIndex={4}
                    disabled={form.processing}
                    data-test="login-button"
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-extrabold text-surface shadow-[0_10px_22px_-14px_var(--brand-deep)] transition-[background-color,box-shadow] hover:bg-brand-deep hover:shadow-[0_14px_28px_-16px_var(--brand-deep)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
                >
                    {form.processing && (
                        <LoaderCircle
                            aria-hidden="true"
                            className="size-4 animate-spin"
                        />
                    )}
                    {form.processing ? "Signing in..." : "Sign in"}
                </button>
            </form>
        </>
    );
}

Login.layout = {
    title: "Sign in to the store",
    description: "Use your staff account to manage products and settings.",
};
