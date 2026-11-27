import { Head, Link, useForm } from "@inertiajs/react";
import { LoaderCircle } from "lucide-react";
import { type FormEvent } from "react";
import { Input } from "@/components/storefront/input";
import { login } from "@/routes";
import { email } from "@/routes/password";

function FieldError({ message }: { message?: string }) {
    if (!message) return null;

    return (
        <p
            id="email-error"
            className="mt-1.5 text-xs font-semibold text-error"
        >
            {message}
        </p>
    );
}

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: "",
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(email.url());
    };

    return (
        <>
            <Head title="Forgot password" />

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
                        value={data.email}
                        onChange={(e) => setData("email", e.target.value)}
                        autoComplete="off"
                        autoFocus
                        placeholder="you@example.com"
                        invalid={!!errors.email}
                        aria-describedby={
                            errors.email ? "email-error" : undefined
                        }
                    />
                    <FieldError message={errors.email} />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    data-test="email-password-reset-link-button"
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-extrabold text-surface shadow-[0_10px_22px_-14px_var(--brand-deep)] transition-[background-color,box-shadow] hover:bg-brand-deep hover:shadow-[0_14px_28px_-16px_var(--brand-deep)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
                >
                    {processing && (
                        <LoaderCircle
                            aria-hidden="true"
                            className="size-4 animate-spin"
                        />
                    )}
                    {processing ? "Sending link..." : "Email password reset link"}
                </button>

                <p className="pt-1 text-center text-sm text-ink-muted">
                    Remembered it?{" "}
                    <Link
                        href={login()}
                        className="font-bold text-brand underline-offset-4 transition-colors hover:text-brand-deep hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                    >
                        Back to sign in
                    </Link>
                </p>
            </form>
        </>
    );
}

ForgotPassword.layout = {
    title: "Forgot your password?",
    description: "Enter your staff email to receive a password reset link.",
};
