import { Head, useForm } from "@inertiajs/react";
import { LoaderCircle } from "lucide-react";
import { type FormEvent } from "react";
import { Input, PasswordInput } from "@/components/storefront/input";
import { update } from "@/routes/password";

type Props = {
    token: string;
    email: string;
    passwordRules: string;
};

function FieldError({ id, message }: { id: string; message?: string }) {
    if (!message) return null;

    return (
        <p id={id} className="mt-1.5 text-xs font-semibold text-error">
            {message}
        </p>
    );
}

export default function ResetPassword({ token, email, passwordRules }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token,
        email,
        password: "",
        password_confirmation: "",
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        post(update.url(), {
            onSuccess: () => reset("password", "password_confirmation"),
        });
    };

    return (
        <>
            <Head title="Reset password" />

            <form onSubmit={submit} className="space-y-4">
                <div className="space-y-1.5">
                    <label
                        htmlFor="email"
                        className="block text-sm font-bold text-ink"
                    >
                        Staff email
                    </label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        autoComplete="email"
                        value={email}
                        readOnly
                        variant="soft"
                        className="cursor-default text-ink-muted"
                        invalid={!!errors.email}
                        aria-describedby={
                            errors.email ? "email-error" : undefined
                        }
                    />
                    <FieldError id="email-error" message={errors.email} />
                </div>

                <div className="space-y-1.5">
                    <label
                        htmlFor="password"
                        className="block text-sm font-bold text-ink"
                    >
                        New password
                    </label>
                    <PasswordInput
                        id="password"
                        name="password"
                        autoComplete="new-password"
                        autoFocus
                        placeholder="Choose a new password"
                        passwordrules={passwordRules}
                        value={data.password}
                        onChange={(e) => setData("password", e.target.value)}
                        invalid={!!errors.password}
                        aria-describedby={
                            errors.password ? "password-error" : undefined
                        }
                    />
                    <FieldError
                        id="password-error"
                        message={errors.password}
                    />
                </div>

                <div className="space-y-1.5">
                    <label
                        htmlFor="password_confirmation"
                        className="block text-sm font-bold text-ink"
                    >
                        Confirm new password
                    </label>
                    <PasswordInput
                        id="password_confirmation"
                        name="password_confirmation"
                        autoComplete="new-password"
                        placeholder="Repeat your new password"
                        passwordrules={passwordRules}
                        value={data.password_confirmation}
                        onChange={(e) =>
                            setData("password_confirmation", e.target.value)
                        }
                        invalid={!!errors.password_confirmation}
                        aria-describedby={
                            errors.password_confirmation
                                ? "password-confirmation-error"
                                : undefined
                        }
                    />
                    <FieldError
                        id="password-confirmation-error"
                        message={errors.password_confirmation}
                    />
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    data-test="reset-password-button"
                    className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-extrabold text-surface shadow-[0_10px_22px_-14px_var(--brand-deep)] transition-[background-color,box-shadow] hover:bg-brand-deep hover:shadow-[0_14px_28px_-16px_var(--brand-deep)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-brand/25 disabled:cursor-not-allowed disabled:opacity-60 motion-reduce:transition-none"
                >
                    {processing && (
                        <LoaderCircle
                            aria-hidden="true"
                            className="size-4 animate-spin"
                        />
                    )}
                    {processing ? "Saving password..." : "Reset password"}
                </button>
            </form>
        </>
    );
}

ResetPassword.layout = {
    title: "Set a new password",
    description: "Choose a new password for your staff account.",
};
