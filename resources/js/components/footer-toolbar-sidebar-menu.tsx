import { Link, router } from "@inertiajs/react";
import { Check, LogOut, Monitor, Moon, Settings, Sun, type LucideIcon } from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import type { Appearance } from "@/hooks/use-appearance";
import { useAppearance } from "@/hooks/use-appearance";
import { useMobileNavigation } from "@/hooks/use-mobile-navigation";
import { logout } from "@/routes";
import { edit as editProfile } from "@/routes/profile";

const toolbarButtonClass =
    "size-9 rounded-md bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground";

const themes: { value: Appearance; label: string; icon: LucideIcon }[] = [
    { value: "system", label: "System", icon: Monitor },
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
];

export function FooterToolbarSidebarMenu() {
    const { appearance, updateAppearance } = useAppearance();
    const [logoutOpen, setLogoutOpen] = useState(false);
    const cleanup = useMobileNavigation();
    const current = themes.find((theme) => theme.value === appearance) ?? themes[0];
    const TriggerIcon = current.icon;

    const handleLogout = () => {
        cleanup();
        router.flushAll();
        router.post(logout(), { from: "admin" });
    };

    return (
        <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-1 group-data-[collapsible=icon]:flex-col">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Change theme"
                            className={toolbarButtonClass}
                        >
                            <TriggerIcon className="size-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        side="top"
                        align="start"
                        sideOffset={8}
                        className="w-40 rounded-lg p-1 text-sm shadow-lg"
                    >
                        {themes.map(({ value, label, icon: Icon }) => {
                            const isActive = appearance === value;

                            return (
                                <DropdownMenuItem
                                    key={value}
                                    role="menuitemradio"
                                    aria-checked={isActive}
                                    onSelect={() => updateAppearance(value)}
                                    className="gap-2 rounded-md px-2 py-1.5"
                                >
                                    <Icon className="size-4 text-muted-foreground" />
                                    <span>{label}</span>
                                    {isActive && (
                                        <Check className="ml-auto size-4 text-foreground" />
                                    )}
                                </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button asChild variant="ghost" size="icon" className={toolbarButtonClass}>
                    <Link
                        href={editProfile()}
                        prefetch
                        aria-label="Settings"
                        onClick={cleanup}
                    >
                        <Settings className="size-4" />
                    </Link>
                </Button>

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Log out"
                    className={toolbarButtonClass}
                    onClick={() => setLogoutOpen(true)}
                >
                    <LogOut className="size-4" />
                </Button>
                <ConfirmDialog
                    open={logoutOpen}
                    onOpenChange={setLogoutOpen}
                    title="Log out?"
                    description="Are you sure you want to log out? You will need to sign in again to access the dashboard."
                    confirmLabel="Log out"
                    destructive
                    onConfirm={handleLogout}
                />
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

export default FooterToolbarSidebarMenu;
