import { Role } from "@/types";
import { SharedPageProps } from "@/types/inertia-config";
import { usePage } from "@inertiajs/react";

export function useCan() {
    const { auth } = usePage<SharedPageProps>().props;
    const user = auth.user;
    // Each user has exactly one role; null for guests
    const isUser = !!user;
    const role: Role | null = user?.roles[0] ?? null;

    return {
        isUser,
        role,
        hasRole: (role: Role): boolean => !!user?.roles.includes(role),
        hasAnyRole: (roles: Role[]): boolean =>
            !!user && roles.some((role) => user.roles.includes(role)),
    };
}
