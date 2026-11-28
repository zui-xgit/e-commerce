import { Link, usePage } from "@inertiajs/react";
import {
    ChevronDown,
    LogOut,
    Mail,
    MapPin,
    Package,
    Search,
    ShoppingBag,
    ShoppingCart,
    UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useStorefrontCartStore } from "@/hooks/stores/use-storefront-cart-store";
import { useCan } from "@/hooks/use-can";
import { useInitials } from "@/hooks/use-initials";
import { storefrontToast } from "@/lib/storefront/storefront-toast";
import { logout } from "@/routes";
import { SharedPageProps } from "@/types/inertia-config";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Authentication } from "./authentication";
import { CartPopover } from "./cart-popover";
import { LanguagePopover } from "./language-popover";
import { MobileDrawerSheet } from "./sheets/mobile-drawer-sheet";
import { MonthlyDealsDialog } from "./dialogs/monthly-deals-dialog";
import { Container } from "./container";
import { cn } from "@/lib/utils";
import icons from "@/assets/icons";
import account from "@/routes/account";
import { StorefrontHeaderSearchDialog } from "./dialogs/storefront-header-search-dialog";

const menuItemClassName =
    "flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-ink transition-colors hover:bg-brand-soft hover:text-brand-deep focus:bg-brand-soft focus:text-brand-deep";

function StorefrontAccountMenu() {
    const { auth } = usePage<SharedPageProps>().props;
    const user = auth.user;
    const getInitials = useInitials();
    const initials = getInitials(user?.name ?? "");
    const { role } = useCan();

    if (!user) return null;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    aria-label="Account menu"
                    className="group relative flex h-10 cursor-pointer items-center gap-1 rounded-xl border border-line bg-surface pr-1.5 pl-1 text-sm font-semibold text-ink transition-all after:absolute after:-inset-0.5 after:content-[''] hover:border-brand hover:bg-brand-soft/60 hover:text-brand-deep focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none data-[state=open]:border-brand data-[state=open]:bg-brand-soft sm:h-11 sm:gap-2 sm:pr-2.5 sm:pl-1.5 sm:after:hidden"
                >
                    <span className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-brand-soft sm:size-8">
                        <img
                            src={icons.user}
                            alt=""
                            aria-hidden="true"
                            className="size-4 object-contain sm:size-5"
                        />
                    </span>
                    <ChevronDown
                        aria-hidden="true"
                        className="hidden size-3.5 shrink-0 text-ink-muted transition-transform group-data-[state=open]:rotate-180 min-[360px]:block sm:size-4"
                    />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-64 rounded-2xl border border-line bg-surface p-0 text-ink shadow-lg"
            >
                {/* Identity block */}
                <div className="flex items-start gap-3 px-4 py-4">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand text-sm font-extrabold text-surface">
                        {initials}
                    </span>
                    <div className="grid min-w-0 flex-1 gap-0.5">
                        <span className="truncate text-sm leading-tight font-bold">
                            {user.name}
                        </span>
                        <span className="truncate text-xs text-ink-muted">
                            {user.email}
                        </span>
                        <span className="mt-1.5 inline-flex w-fit items-center gap-1 rounded-md border border-brand/20 bg-brand-soft px-1.5 py-0.5 text-[11px] font-extrabold tracking-wide text-brand-deep uppercase">
                            <UserRound aria-hidden="true" className="size-3" />
                            {role}
                        </span>
                    </div>
                </div>

                <DropdownMenuSeparator className="m-0 bg-line" />

                {/* Action items */}
                <div className="p-1.5">
                    <DropdownMenuItem asChild>
                        <Link
                            href="/account/orders"
                            className={menuItemClassName}
                        >
                            <Package aria-hidden="true" className="size-4" />
                            Orders
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                        <Link
                            href="/account/profile"
                            className={menuItemClassName}
                        >
                            <UserRound aria-hidden="true" className="size-4" />
                            Account
                        </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                        <Link
                            href="/account/addresses"
                            className={menuItemClassName}
                        >
                            <MapPin aria-hidden="true" className="size-4" />
                            Addresses
                        </Link>
                    </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator className="m-0 bg-line" />

                <div className="p-1.5">
                    <DropdownMenuItem asChild className="w-full">
                        <Link
                            href={logout()}
                            method="post"
                            as="button"
                            className={cn(
                                menuItemClassName,
                                "text-error hover:bg-error/10 hover:text-error",
                            )}
                        >
                            <LogOut aria-hidden="true" className="size-4" />
                            Log out
                        </Link>
                    </DropdownMenuItem>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default function StorefrontHeader() {
    const [isHydrated, setIsHydrated] = useState(false);
    const cartTotalItems = useStorefrontCartStore((state) =>
        state.getTotalItems(),
    );
    const page = usePage<SharedPageProps>();
    const { hasRole, isUser } = useCan();

    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const getTotalItems = isHydrated ? cartTotalItems : 0;

    const handleEmptyCartClick = () => {
        storefrontToast("No cart items yet");
    };

    const cartButton = (
        <button
            type="button"
            aria-label={`Open cart, ${getTotalItems} ${getTotalItems === 1 ? "item" : "items"}`}
            onClick={getTotalItems === 0 ? handleEmptyCartClick : undefined}
            className="relative flex size-10 cursor-pointer items-center justify-center rounded-xl bg-brand-soft text-brand-deep transition-colors after:absolute after:-inset-0.5 after:content-[''] hover:bg-brand hover:text-surface focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none sm:size-11 sm:after:hidden"
        >
            <ShoppingCart
                aria-hidden="true"
                className="size-[18px] sm:size-5"
            />
            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-coral text-[11px] font-extrabold text-surface tabular-nums">
                {getTotalItems}
            </span>
        </button>
    );

    return (
        <>
            <div className="bg-brand-deep text-surface">
                <Container>
                    <div className="flex h-11 items-center justify-between gap-3 text-[11px] font-semibold tracking-wide uppercase sm:h-8 sm:gap-4">
                        <span>Shophub · Market preview</span>
                        <div className="flex items-center gap-3 sm:gap-4">
                            <span className="hidden lg:inline">
                                Catalogue from your store · Prices in USD
                            </span>
                            <MonthlyDealsDialog>
                                <button
                                    type="button"
                                    aria-label="Sign up for monthly deals"
                                    className="relative inline-flex min-h-8 items-center gap-1.5 rounded-sm transition-colors after:absolute after:-inset-x-1 after:-inset-y-1.5 after:content-[''] hover:text-mint focus-visible:ring-2 focus-visible:ring-mint"
                                >
                                    <Mail
                                        aria-hidden="true"
                                        className="size-3.5"
                                    />
                                    Monthly deals
                                </button>
                            </MonthlyDealsDialog>
                        </div>
                    </div>
                </Container>
            </div>

            <header className="sticky top-0 z-50 border-b border-line bg-surface">
                <Container>
                    <div className="flex h-16 items-center gap-2 sm:h-[72px] sm:gap-4">
                        <MobileDrawerSheet />

                        <Link
                            href="/"
                            className="flex items-center gap-1.5 rounded-xl focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none sm:gap-2"
                            aria-label="Shophub home"
                        >
                            <span className="flex size-8 items-center justify-center rounded-lg bg-brand text-surface sm:size-9 sm:rounded-xl">
                                <ShoppingBag
                                    aria-hidden="true"
                                    className="size-4 sm:size-5"
                                />
                            </span>
                            <span className="font-display text-sm font-extrabold tracking-tight sm:text-xl">
                                SHOP<span className="text-brand">HUB</span>
                            </span>
                        </Link>

                        <nav
                            aria-label="Main navigation"
                            className="ml-4 hidden items-center gap-5 text-sm font-semibold text-ink-muted lg:flex"
                        >
                            <Link
                                href="/#categories"
                                className="rounded-sm transition-colors hover:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none"
                            >
                                Categories
                            </Link>
                            <Link
                                href="/#collections"
                                className="rounded-sm transition-colors hover:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none"
                            >
                                Collections
                            </Link>
                            <Link
                                href="/products"
                                aria-current={
                                    page.url.startsWith("/products")
                                        ? "page"
                                        : undefined
                                }
                                className={cn(
                                    "rounded-sm transition-colors hover:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none",
                                    page.url.startsWith("/products") &&
                                        "text-brand",
                                )}
                            >
                                Products
                            </Link>
                            <Link
                                href="/faq"
                                aria-current={
                                    page.url === "/faq" ? "page" : undefined
                                }
                                className={cn(
                                    "rounded-sm transition-colors hover:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none",
                                    page.url === "/faq" && "text-brand",
                                )}
                            >
                                FAQ
                            </Link>

                            {!hasRole("admin") && hasRole("customer") && (
                                <Link
                                    href={account.orders.index()}
                                    aria-current={
                                        page.url.startsWith("/account")
                                            ? "page"
                                            : undefined
                                    }
                                    className={cn(
                                        "rounded-sm transition-colors hover:text-brand focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none",
                                        page.url.startsWith("/account") &&
                                            "text-brand",
                                    )}
                                >
                                    Orders
                                </Link>
                            )}
                        </nav>

                        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
                            <StorefrontHeaderSearchDialog>
                                <button
                                    type="button"
                                    aria-label="Search products"
                                    className="relative flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand-deep transition-colors after:absolute after:-inset-0.5 after:content-[''] hover:bg-brand hover:text-surface focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none sm:hidden sm:size-11 sm:after:hidden"
                                >
                                    <Search
                                        aria-hidden="true"
                                        className="size-[18px] sm:size-5"
                                    />
                                </button>
                            </StorefrontHeaderSearchDialog>

                            <StorefrontHeaderSearchDialog>
                                <button
                                    type="button"
                                    aria-label="Search products"
                                    className="hidden h-11 w-56 cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface-alt px-3 text-left text-sm font-medium text-ink-muted transition-colors hover:border-brand hover:bg-surface focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none sm:flex lg:w-72"
                                >
                                    <Search
                                        aria-hidden="true"
                                        className="size-4 shrink-0 text-brand-deep"
                                    />
                                    <span className="flex-1 truncate">
                                        Search products…
                                    </span>
                                </button>
                            </StorefrontHeaderSearchDialog>

                            <div className="hidden sm:block">
                                <LanguagePopover />
                            </div>

                            {isUser && hasRole("customer") ? (
                                <StorefrontAccountMenu />
                            ) : (
                                <>
                                    {!hasRole("admin") && (
                                        <Authentication>
                                            <button
                                                type="button"
                                                aria-label="Log in or create an account"
                                                className="relative flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl border border-line bg-surface px-2.5 text-sm font-semibold text-ink transition-all after:absolute after:-inset-0.5 after:content-[''] hover:border-brand hover:bg-brand-soft hover:text-brand-deep focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none sm:h-11 sm:px-4 sm:after:hidden"
                                            >
                                                <UserRound
                                                    aria-hidden="true"
                                                    className="size-[18px] sm:size-5"
                                                />
                                            </button>
                                        </Authentication>
                                    )}
                                </>
                            )}

                            <div className="relative">
                                {getTotalItems > 0 ? (
                                    <CartPopover>{cartButton}</CartPopover>
                                ) : (
                                    cartButton
                                )}
                            </div>
                        </div>
                    </div>
                </Container>
            </header>
        </>
    );
}
