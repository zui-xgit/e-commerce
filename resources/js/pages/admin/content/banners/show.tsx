import { Head } from "@inertiajs/react";
import { ImageIcon, Pencil } from "lucide-react";
import { useState, type ReactNode } from "react";
import { BackButton } from "@/components/admin/back-button";
import { BannerFormDialog } from "@/components/admin/banners/banner-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import admin from "@/routes/admin";
import type { AdminBannerDetail } from "@/types/admin-banners";

function Detail({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="grid gap-1 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-4">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd className="min-w-0 text-sm font-medium">{value}</dd>
        </div>
    );
}

export default function BannerShow({ banner }: { banner: AdminBannerDetail }) {
    const [editing, setEditing] = useState(false);

    return (
        <>
            <Head title={banner.title} />

            <div className="w-full space-y-4">
                <div className="flex flex-col gap-4 border-b pb-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-3">
                        <BackButton className="mt-0.5" />
                        <div className="space-y-1">
                            <h1 className="text-xl font-semibold tracking-tight">
                                {banner.title}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                Storefront banner details and preview.
                            </p>
                        </div>
                    </div>
                    <Button onClick={() => setEditing(true)} className="w-full sm:w-auto">
                        <Pencil />
                        Edit banner
                    </Button>
                </div>

                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <Card className="gap-0 overflow-hidden py-0">
                        <CardHeader className="border-b px-6 py-4">
                            <CardTitle className="text-base">Banner image</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 sm:p-6">
                            {banner.image_url ? (
                                <div className="overflow-hidden rounded-lg border bg-muted/30">
                                    <img
                                        src={banner.image_url}
                                        alt={banner.title}
                                        className="aspect-[16/7] w-full object-cover"
                                        loading="eager"
                                        decoding="async"
                                    />
                                </div>
                            ) : (
                                <div className="flex aspect-[16/7] flex-col items-center justify-center gap-3 rounded-lg border border-dashed bg-muted/30 text-center">
                                    <div className="flex size-11 items-center justify-center rounded-lg border bg-background">
                                        <ImageIcon className="size-5 text-muted-foreground" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium">No image available</p>
                                        <p className="text-xs text-muted-foreground">
                                            Edit this banner to upload an image.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="gap-0 py-0">
                        <CardHeader className="border-b px-6 py-4">
                            <CardTitle className="text-base">Banner details</CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 py-5">
                            <dl className="space-y-4">
                                <Detail
                                    label="Status"
                                    value={
                                        <Badge variant={banner.is_active ? "default" : "secondary"}>
                                            {banner.is_active ? "Active" : "Inactive"}
                                        </Badge>
                                    }
                                />
                                <Detail
                                    label="Sort order"
                                    value={<span className="tabular-nums">{banner.sort_order}</span>}
                                />
                                <Detail label="Created" value={banner.created_at ?? "—"} />
                                <Detail label="Updated" value={banner.updated_at ?? "—"} />
                                <Detail
                                    label="UUID"
                                    value={
                                        <span className="font-mono text-xs break-all">
                                            {banner.uuid}
                                        </span>
                                    }
                                />
                            </dl>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <BannerFormDialog open={editing} onOpenChange={setEditing} banner={banner} />
        </>
    );
}

BannerShow.layout = {
    breadcrumbs: [
        {
            title: "Content",
            href: admin.dashboard().url,
        },
        {
            title: "Banners",
            href: admin.banners.index().url,
        },
        {
            title: "Details",
            href: "#",
        },
    ],
};
