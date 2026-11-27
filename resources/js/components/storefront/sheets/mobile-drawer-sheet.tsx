import { Link, usePage } from "@inertiajs/react";
import { ChevronRight, Menu, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { LanguagePopover } from "../language-popover";

const drawerLinkClassName =
    "group flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-ink transition-colors hover:bg-brand-soft hover:text-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

export function MobileDrawerSheet() {
    const isMobile = useIsMobile();
    const [open, setOpen] = useState(false);
    const page = usePage();

    useEffect(() => {
        setOpen(false);
    }, [page.url, isMobile]);

    if (!isMobile) {
        return null;
    }

    const links = [
        { href: "/#categories", label: "Categories", current: false },
        { href: "/#collections", label: "Collections", current: false },
        {
            href: "/products",
            label: "Products",
            current: page.url.startsWith("/products"),
        },
        { href: "/faq", label: "FAQ", current: page.url === "/faq" },
    ];

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button
                    type="button"
                    aria-label="Open navigation menu"
                    className="relative flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-brand-soft text-brand-deep transition-colors hover:bg-brand hover:text-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface after:absolute after:-inset-0.5 after:content-[''] sm:size-11"
                >
                    <Menu
                        aria-hidden="true"
                        className="size-[18px] sm:size-5"
                    />
                </button>
            </SheetTrigger>

            <SheetContent
                side="left"
                className="storefront w-[min(20rem,86vw)] gap-0 border-r border-line bg-surface p-0 text-ink shadow-xl"
            >
                <SheetHeader className="gap-1 border-b border-line py-5 pr-14 pl-5 ">
                    <span className="mb-1 flex size-9 items-center justify-center rounded-lg bg-brand text-surface">
                        <ShoppingBag aria-hidden="true" className="size-5" />
                    </span>
                    <SheetTitle className="font-display text-lg font-extrabold tracking-tight text-ink">
                        Explore Shophub
                    </SheetTitle>
                    <SheetDescription className="text-xs leading-relaxed text-ink-muted">
                        Pick an aisle and keep browsing.
                    </SheetDescription>
                </SheetHeader>

                <nav
                    aria-label="Mobile navigation"
                    className="flex flex-col gap-1 p-3"
                >
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setOpen(false)}
                            aria-current={link.current ? "page" : undefined}
                            className={cn(
                                drawerLinkClassName,
                                link.current && "bg-brand-soft text-brand-deep",
                            )}
                        >
                            {link.label}
                            {link.current ? (
                                <span
                                    aria-hidden="true"
                                    className="ml-auto size-2 rounded-full bg-brand"
                                />
                            ) : (
                                <ChevronRight
                                    aria-hidden="true"
                                    className="ml-auto size-4 text-ink-muted"
                                />
                            )}
                        </Link>
                    ))}
                </nav>

                <div className="mt-auto border-t border-line px-5 py-5">
                    <p className="mb-2 text-[11px] font-extrabold tracking-wide text-ink-muted uppercase">
                        Language
                    </p>
                    <LanguagePopover />
                </div>
            </SheetContent>
        </Sheet>
    );
}
