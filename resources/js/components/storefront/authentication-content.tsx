import { useState, type FormEvent } from "react";
import { request } from "@/routes/password";
import { store as loginStore } from "@/routes/login";
import { store as registerStore } from "@/routes/register";

import { Link, useForm } from "@inertiajs/react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Input, PasswordInput } from "@/components/storefront/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import icons from "@/assets/icons";
import { PortalLoader } from "../portal-loader";
import oauth from "@/routes/oauth";

type AuthMode = "login" | "register";

const storefrontSubmitClassName =
    "mt-2 min-h-12 w-full rounded-xl bg-brand px-5 text-sm font-extrabold text-surface shadow-none transition-[background-color,box-shadow] hover:bg-brand-deep hover:shadow-lg focus-visible:border-brand focus-visible:ring-brand/20 motion-reduce:transition-none disabled:opacity-70";

function SocialButton({
    loading,
    onClick,
}: {
    loading: boolean;
    onClick: () => void;
}) {
    return (
        <a
            href={oauth.google().url}
            aria-disabled={loading}
            tabIndex={loading ? -1 : 0}
            onClick={(e) => {
                if (loading) {
                    e.preventDefault();
                    return;
                }
                onClick();
            }}
            className={cn(
                "flex min-h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-line bg-surface-alt px-4 text-base font-bold text-ink transition-[background-color,border-color,box-shadow] hover:border-brand hover:bg-brand-soft hover:shadow-md motion-reduce:transition-none",
                loading && "pointer-events-none cursor-not-allowed opacity-70",
            )}
        >
            <img
                src={icons.google}
                alt=""
                aria-hidden="true"
                className="size-5 shrink-0 object-contain"
            />
            <span>{loading ? "Redirecting..." : "Continue with Google"}</span>
        </a>
    );
}

function Field({
    id,
    label,
    trailing,
    children,
}: {
    id: string;
    label: string;
    trailing?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-3">
                <Label htmlFor={id} className="text-sm font-bold text-ink">
                    {label}
                </Label>
                {trailing}
            </div>
            {children}
        </div>
    );
}

/**
 * Shared authentication body used by the dialog and the bottom sheet.
 * Each wrapper owns its own header/container styling and closes itself via
 * `onSuccess`; unmounting the content resets the forms and the active mode.
 */
export function AuthenticationContent({
    onSuccess,
    className,
}: {
    onSuccess?: () => void;
    className?: string;
}) {
    const [mode, setMode] = useState<AuthMode>("login");
    const [showEmailForm, setShowEmailForm] = useState(false);
    const [socialLoading, setSocialLoading] = useState(false);

    const loginForm = useForm({
        email: "",
        password: "",
        remember: false,
        portal: "customer",
    });

    const registerForm = useForm({
        name: "",
        email: "",
        password: "",
        password_confirmation: "",
    });

    const selectMode = (next: AuthMode) => {
        if (next !== mode) {
            setMode(next);
            loginForm.clearErrors();
            registerForm.clearErrors();
        }
    };

    const submitLogin = (e: FormEvent) => {
        e.preventDefault();
        loginForm.post(loginStore().url, {
            preserveScroll: true,
            onSuccess: () => onSuccess?.(),
            onFinish: () => loginForm.reset("password"),
        });
    };

    const submitRegister = (e: FormEvent) => {
        e.preventDefault();
        registerForm.post(registerStore().url, {
            preserveScroll: true,
            onSuccess: () => onSuccess?.(),
            onFinish: () => {
                registerForm.reset("password");
                registerForm.reset("password_confirmation");
            },
        });
    };

    const processing =
        loginForm.processing || registerForm.processing || socialLoading;

    return (
        <>
            <PortalLoader loading={processing} />

            <div className={className}>
                {/* Hero: social auth */}
                <div className="space-y-3">
                    <SocialButton
                        loading={socialLoading}
                        onClick={() => setSocialLoading(true)}
                    />
                </div>

                {/* Email fallback, collapsed by default */}
                <div className="mt-6">
                    <button
                        type="button"
                        onClick={() => setShowEmailForm((v) => !v)}
                        aria-expanded={showEmailForm}
                        aria-controls="email-auth-panel"
                        className="flex w-full items-center justify-between rounded-xl px-1 py-2 text-sm font-semibold text-ink-muted transition-colors hover:text-brand-deep"
                    >
                        <span>Or continue with email</span>
                        <ChevronDown
                            aria-hidden="true"
                            className={cn(
                                "size-4 transition-transform duration-200",
                                showEmailForm && "rotate-180",
                            )}
                        />
                    </button>

                    {showEmailForm && (
                        <div id="email-auth-panel" className="mt-4">
                            {mode === "login" && (
                                <>
                                    <form
                                        onSubmit={submitLogin}
                                        className="space-y-4"
                                    >
                                        <Field
                                            id="login-email"
                                            label="Email address"
                                        >
                                            <Input
                                                id="login-email"
                                                variant="soft"
                                                type="email"
                                                value={loginForm.data.email}
                                                onChange={(e) =>
                                                    loginForm.setData(
                                                        "email",
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                                autoComplete="email"
                                                placeholder="you@example.com"
                                                invalid={
                                                    !!loginForm.errors.email
                                                }
                                            />
                                            {loginForm.errors.email && (
                                                <p className="mt-1 text-xs text-error">
                                                    {loginForm.errors.email}
                                                </p>
                                            )}
                                        </Field>

                                        <Field
                                            id="login-password"
                                            label="Password"
                                            trailing={
                                                <Link
                                                    href={request()}
                                                    className="text-xs font-extrabold text-brand hover:text-brand-deep hover:underline"
                                                >
                                                    Forgot password?
                                                </Link>
                                            }
                                        >
                                            <PasswordInput
                                                id="login-password"
                                                variant="soft"
                                                value={loginForm.data.password}
                                                onChange={(e) =>
                                                    loginForm.setData(
                                                        "password",
                                                        e.target.value,
                                                    )
                                                }
                                                required
                                                autoComplete="current-password"
                                                placeholder="Enter your password"
                                                invalid={
                                                    !!loginForm.errors.password
                                                }
                                            />
                                            {loginForm.errors.password && (
                                                <p className="mt-1 text-xs text-error">
                                                    {loginForm.errors.password}
                                                </p>
                                            )}
                                        </Field>

                                        <label
                                            htmlFor="login-remember"
                                            className="flex w-fit cursor-pointer items-center gap-2 text-sm font-semibold text-ink-muted"
                                        >
                                            <Checkbox
                                                id="login-remember"
                                                checked={
                                                    loginForm.data.remember
                                                }
                                                onCheckedChange={(checked) =>
                                                    loginForm.setData(
                                                        "remember",
                                                        !!checked,
                                                    )
                                                }
                                                className="size-4 rounded-[5px] border-line bg-surface-alt focus-visible:border-brand focus-visible:ring-brand/20 data-[state=checked]:border-brand data-[state=checked]:bg-brand data-[state=checked]:text-surface"
                                            />
                                            Remember me
                                        </label>

                                        <Button
                                            type="submit"
                                            disabled={loginForm.processing}
                                            className={storefrontSubmitClassName}
                                        >
                                            {loginForm.processing
                                                ? "Logging in..."
                                                : "Log in"}
                                            {!loginForm.processing && (
                                                <ArrowRight
                                                    aria-hidden="true"
                                                    className="size-4"
                                                />
                                            )}
                                        </Button>

                                        <p className="text-center text-xs text-ink-muted">
                                            New to Shophub?{" "}
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    selectMode("register")
                                                }
                                                className="font-extrabold text-brand hover:text-brand-deep hover:underline"
                                            >
                                                Create an account
                                            </button>
                                        </p>
                                    </form>
                                </>
                            )}

                            {mode === "register" && (
                                <form
                                    onSubmit={submitRegister}
                                    className="space-y-4"
                                >
                                    <Field id="register-name" label="Full name">
                                        <Input
                                            id="register-name"
                                            variant="soft"
                                            type="text"
                                            value={registerForm.data.name}
                                            onChange={(e) =>
                                                registerForm.setData(
                                                    "name",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            autoComplete="name"
                                            placeholder="Your name"
                                            invalid={!!registerForm.errors.name}
                                        />
                                        {registerForm.errors.name && (
                                            <p className="mt-1 text-xs text-error">
                                                {registerForm.errors.name}
                                            </p>
                                        )}
                                    </Field>

                                    <Field
                                        id="register-email"
                                        label="Email address"
                                    >
                                        <Input
                                            id="register-email"
                                            variant="soft"
                                            type="email"
                                            value={registerForm.data.email}
                                            onChange={(e) =>
                                                registerForm.setData(
                                                    "email",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            autoComplete="email"
                                            placeholder="you@example.com"
                                            invalid={
                                                !!registerForm.errors.email
                                            }
                                        />
                                        {registerForm.errors.email && (
                                            <p className="mt-1 text-xs text-error">
                                                {registerForm.errors.email}
                                            </p>
                                        )}
                                    </Field>

                                    <Field
                                        id="register-password"
                                        label="Password"
                                    >
                                        <PasswordInput
                                            id="register-password"
                                            variant="soft"
                                            value={registerForm.data.password}
                                            onChange={(e) =>
                                                registerForm.setData(
                                                    "password",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            autoComplete="new-password"
                                            placeholder="Create a password"
                                            invalid={
                                                !!registerForm.errors.password
                                            }
                                        />
                                        {registerForm.errors.password && (
                                            <p className="mt-1 text-xs text-error">
                                                {registerForm.errors.password}
                                            </p>
                                        )}
                                    </Field>

                                    <Field
                                        id="register-confirmation"
                                        label="Confirm password"
                                    >
                                        <PasswordInput
                                            id="register-confirmation"
                                            variant="soft"
                                            value={
                                                registerForm.data
                                                    .password_confirmation
                                            }
                                            onChange={(e) =>
                                                registerForm.setData(
                                                    "password_confirmation",
                                                    e.target.value,
                                                )
                                            }
                                            required
                                            autoComplete="new-password"
                                            placeholder="Repeat your password"
                                            invalid={
                                                !!registerForm.errors
                                                    .password_confirmation
                                            }
                                        />
                                    </Field>

                                    <Button
                                        type="submit"
                                        disabled={registerForm.processing}
                                        className={storefrontSubmitClassName}
                                    >
                                        {registerForm.processing
                                            ? "Creating account..."
                                            : "Create account"}
                                        {!registerForm.processing && (
                                            <ArrowRight
                                                aria-hidden="true"
                                                className="size-4"
                                            />
                                        )}
                                    </Button>

                                    <p className="text-center text-xs leading-relaxed text-ink-muted">
                                        By creating an account, you agree to our{" "}
                                        <Link
                                            href="/policies/terms"
                                            className="font-extrabold text-brand hover:text-brand-deep hover:underline"
                                        >
                                            Terms
                                        </Link>{" "}
                                        and{" "}
                                        <Link
                                            href="/policies/privacy"
                                            className="font-extrabold text-brand hover:text-brand-deep hover:underline"
                                        >
                                            Privacy policy
                                        </Link>
                                        .
                                    </p>

                                    <p className="text-center text-xs text-ink-muted">
                                        Already have an account?{" "}
                                        <button
                                            type="button"
                                            onClick={() => selectMode("login")}
                                            className="font-extrabold text-brand hover:text-brand-deep hover:underline"
                                        >
                                            Log in
                                        </button>
                                    </p>
                                </form>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
