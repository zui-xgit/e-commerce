import { Link } from "@inertiajs/react";
import {
    CreditCard,
    FileText,
    ImageIcon,
    Images,
    LayoutGrid,
    Package,
    ShoppingBag,
    SlidersHorizontal,
    Store,
    Tags,
    UserCog,
    Users,
} from "lucide-react";
import AppLogo from "@/components/app-logo";
import { FooterToolbarSidebarMenu } from "@/components/footer-toolbar-sidebar-menu";
import { NavMain } from "@/components/nav-main";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { NavItem } from "@/types";
import admin from "@/routes/admin";

const topItems: NavItem[] = [
    {
        title: "Dashboard",
        href: admin.dashboard(),
        icon: LayoutGrid,
    },
];

const storeItems: NavItem[] = [
    { title: "Orders", href: admin.orders.index().url, icon: ShoppingBag },
    { title: "Categories", href: admin.categories.index().url, icon: Tags },
    { title: "Products", href: admin.products.index().url, icon: Package },
];

const peopleItems: NavItem[] = [
    { title: "Customers", href: "#", icon: Users },
    { title: "Staff", href: "#", icon: UserCog },
];

const contentItems: NavItem[] = [
    { title: "Banners", href: admin.banners.index().url, icon: ImageIcon },
    { title: "Media", href: "#", icon: Images },
];

const settingsItems: NavItem[] = [
    {
        title: "Site",
        href: admin.siteSettings.edit().url,
        icon: Store,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={admin.dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain groupLable="Top" items={topItems} />
                <NavMain groupLable="Store" items={storeItems} />
                <NavMain groupLable="People" items={peopleItems} />
                <NavMain groupLable="Content" items={contentItems} />
                <NavMain groupLable="Settings" items={settingsItems} />
            </SidebarContent>

            <SidebarFooter>
                <FooterToolbarSidebarMenu />
                {/* <NavUser /> */}
            </SidebarFooter>
        </Sidebar>
    );
}
