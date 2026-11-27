export type Role = "admin" | "customer";

export type User = {
    uuid: string;
    name: string;
    email: string;
    avatar?: string;
    roles: Role[];
    permissions: string[];
    [key: string]: unknown;
};

export type Auth = {
    user: User | null;
};
