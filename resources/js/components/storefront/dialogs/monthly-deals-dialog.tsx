import {
    useId,
    useRef,
    useState,
    type FormEvent,
    type ReactElement,
} from 'react';
import { ArrowRight, Check, Mail, X } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

const inputClassName =
    'h-14 rounded-2xl border-line bg-surface-alt px-4 text-base text-ink placeholder:text-ink-muted focus-visible:border-brand focus-visible:ring-[3px] focus-visible:ring-brand/20';

const submitClassName =
    'flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-coral px-5 text-sm font-extrabold text-surface transition-[filter,box-shadow] hover:brightness-95 hover:shadow-lg motion-reduce:transition-none';

export function MonthlyDealsDialog({ children }: { children: ReactElement }) {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const uid = useId();
    const emailId = `${uid}-email`;
    const noteId = `${uid}-note`;
    const errorId = `${uid}-error`;

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);
        if (nextOpen) {
            setEmail('');
            setSubmittedEmail(null);
            setError(null);
        }
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const value = email.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            setError(
                'Enter a valid email address so we know where to send it.',
            );
            inputRef.current?.focus();
            return;
        }

        setError(null);
        setSubmittedEmail(value);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>

            <DialogContent
                showCloseButton={false}
                className="storefront block max-h-[90dvh] w-[94vw] max-w-md overflow-hidden rounded-2xl border border-line bg-surface p-0 text-ink shadow-xl sm:max-w-lg"
            >
                <div className="relative border-b border-line bg-brand-deep px-5 py-6 text-surface sm:px-8">
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        aria-label="Close dialog"
                        className="absolute top-4 right-4 flex size-8 cursor-pointer items-center justify-center rounded-full bg-surface/10 text-surface transition-colors hover:bg-surface/20 focus-visible:ring-2 focus-visible:ring-surface sm:top-6 sm:right-6"
                    >
                        <X aria-hidden="true" className="size-4" />
                    </button>

                    <div className="flex items-center gap-3">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-mint text-ink">
                            <Mail aria-hidden="true" className="size-5" />
                        </span>
                        <DialogHeader className="gap-1 text-left">
                            <DialogTitle className="font-display text-2xl leading-tight font-extrabold tracking-tight text-surface sm:text-3xl">
                                Monthly deals
                            </DialogTitle>
                            <DialogDescription className="text-sm leading-relaxed text-surface/80">
                                One short email each month with fresh picks from
                                the catalogue.
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                </div>

                <div className="max-h-[calc(90dvh-180px)] overflow-y-auto px-5 py-6 sm:px-8 sm:py-7">
                    {submittedEmail ? (
                        <div
                            role="status"
                            className="rounded-2xl border border-line bg-mint-soft p-5"
                        >
                            <span className="flex size-10 items-center justify-center rounded-full bg-success text-surface">
                                <Check aria-hidden="true" className="size-5" />
                            </span>
                            <p className="mt-4 font-display text-xl leading-tight font-extrabold tracking-tight text-ink">
                                Preview signup complete
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                                We&rsquo;d send one deals email a month to{' '}
                                <span className="font-bold text-ink">
                                    {submittedEmail}
                                </span>
                                . Nothing was sent or stored.
                            </p>
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-extrabold text-surface transition-colors hover:bg-brand-deep"
                            >
                                Back to shopping
                                <ArrowRight
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            </button>
                        </div>
                    ) : (
                        <form
                            onSubmit={handleSubmit}
                            noValidate
                            className="space-y-4"
                        >
                            <div>
                                <Label
                                    htmlFor={emailId}
                                    className="text-sm font-bold text-ink"
                                >
                                    Email address
                                </Label>
                                <Input
                                    ref={inputRef}
                                    id={emailId}
                                    type="email"
                                    value={email}
                                    onChange={(event) => {
                                        setEmail(event.target.value);
                                        if (error) setError(null);
                                    }}
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                    aria-invalid={Boolean(error)}
                                    aria-describedby={error ? errorId : noteId}
                                    className={cn(
                                        inputClassName,
                                        error && 'border-error',
                                    )}
                                />
                                {error && (
                                    <p
                                        id={errorId}
                                        role="alert"
                                        className="mt-1.5 text-xs font-semibold text-error"
                                    >
                                        {error}
                                    </p>
                                )}
                            </div>

                            <button type="submit" className={submitClassName}>
                                Sign up for monthly deals
                                <ArrowRight
                                    aria-hidden="true"
                                    className="size-4"
                                />
                            </button>

                            <p
                                id={noteId}
                                className="text-center text-xs leading-relaxed text-ink-muted"
                            >
                                Preview only &mdash; no email is sent or stored.
                            </p>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
