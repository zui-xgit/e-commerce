import { useState, type ReactElement } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { ShoppingBag, X } from 'lucide-react';
import { AuthenticationContent } from '../authentication-content';

export function AuthenticationDialog({ children }: { children: ReactElement }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
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
                        className="absolute top-4 right-4 flex size-8 cursor-pointer items-center justify-center rounded-full bg-surface/10 text-surface transition-colors hover:bg-surface/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-surface sm:top-6 sm:right-6"
                    >
                        <X className="size-4" />
                    </button>

                    <div className="flex items-center gap-2.5">
                        <span className="flex size-9 items-center justify-center rounded-xl bg-surface/15 text-surface">
                            <ShoppingBag
                                aria-hidden="true"
                                className="size-5"
                            />
                        </span>
                        <span className="font-display text-lg font-extrabold tracking-tight">
                            SHOP<span className="text-mint">HUB</span>
                        </span>
                    </div>

                    <DialogHeader className="mt-5 gap-1.5 text-left">
                        <DialogTitle className="font-display text-2xl leading-tight font-extrabold tracking-tight text-surface sm:text-3xl">
                            Welcome to Shophub
                        </DialogTitle>
                        <DialogDescription className="text-sm leading-relaxed text-surface/80">
                            One tap to sign in. No password to remember.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                {open && (
                    <AuthenticationContent
                        onSuccess={() => setOpen(false)}
                        className="max-h-[calc(90dvh-180px)] overflow-y-auto px-5 py-6 sm:px-8 sm:py-8"
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
