import admin from "@/routes/admin";

export default function Overview({ site_name }: { site_name: string }) {
    return <div>{site_name}</div>;
}

Overview.layout = {
    breadcrumbs: [
        {
            title: "Overview",
            href: admin.overview(),
        },
    ],
};
