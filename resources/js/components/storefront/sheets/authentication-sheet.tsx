import { useState, type ReactElement } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingBag, X } from "lucide-react";
import { AuthenticationContent } from "../authentication-content";

export function AuthenticationSheet({ children }: { children: ReactElement }) {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>

            <SheetContent
                side="bottom"
                showCloseButton={false}
                className="storefront max-h-[92dvh] w-full gap-0 overflow-hidden rounded-t-3xl border-line bg-surface p-0 text-ink shadow-xl"
            >
                <div
                    aria-hidden="true"
                    className="flex shrink-0 justify-center bg-brand-deep pt-3 pb-1"
                >
                    <span className="h-1.5 w-10 rounded-full bg-surface/30" />
                </div>

                <div className="relative shrink-0 border-b border-line bg-brand-deep px-5 pt-3 pb-6 text-surface">
                    <button
                        type="button"
                        onClick={() => setOpen(false)}
                        aria-label="Close sheet"
                        className="absolute top-3 right-4 flex size-9 cursor-pointer items-center justify-center rounded-full bg-surface/10 text-surface transition-colors hover:bg-surface/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-surface"
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

                    <SheetHeader className="mt-4 gap-1.5 text-left">
                        <SheetTitle className="font-display text-2xl leading-tight font-extrabold tracking-tight text-surface">
                            Welcome to Shophub
                        </SheetTitle>
                        <SheetDescription className="text-sm leading-relaxed text-surface/80">
                            One tap to sign in. No password to remember.
                        </SheetDescription>
                    </SheetHeader>
                </div>

                {open && (
                    <AuthenticationContent
                        onSuccess={() => setOpen(false)}
                        className="max-h-[calc(92dvh-210px)] min-h-0 overflow-y-auto overscroll-contain px-5 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
                    />
                )}
            </SheetContent>
        </Sheet>
    );
}
