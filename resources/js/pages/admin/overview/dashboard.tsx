import admin from "@/routes/admin";

export default function Dashboard({ site_name }: { site_name: string }) {
    return <div>{site_name}</div>;
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: "Dashboard",
            href: admin.dashboard(),
        },
    ],
};
