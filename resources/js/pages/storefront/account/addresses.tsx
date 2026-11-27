import { Link, useForm, usePage } from "@inertiajs/react";
import { ArrowRight, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import InputError from "@/components/input-error";
import { AccountPageHeader } from "@/components/storefront/account-page-header";
import { StorefrontBreadcrumbs } from "@/components/storefront/breadcrumbs";
import { AddressFormDialog } from "@/components/storefront/dialogs/address-form-dialog";
import { DeleteAddressDialog } from "@/components/storefront/dialogs/delete-address-dialog";
import { Heading } from "@/components/storefront/heading";
import { Button } from "@/components/ui/button";
import {
    EMPTY_DELIVERY_ADDRESS,
    type DeliveryAddressValues,
} from "@/lib/storefront/delivery-address";

import type { SharedPageProps } from "@/types/inertia-config";
import account from "@/routes/account";

type AddressesPageProps = {
    deliveryAddress: DeliveryAddressValues | null;
};

export default function StorefrontAccountAddressesPage() {
    const { auth, deliveryAddress } = usePage<
        SharedPageProps & AddressesPageProps
    >().props;
    const form = useForm<DeliveryAddressValues>(EMPTY_DELIVERY_ADDRESS);
    const [open, setOpen] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const hasAddress = Boolean(deliveryAddress);
    const saveUrl = hasAddress
        ? account.addresses.update.url()
        : account.addresses.store.url();

    const saveMethod: "post" | "put" = hasAddress ? "put" : "post";

    useEffect(() => {
        form.setData(
            deliveryAddress ?? {
                ...EMPTY_DELIVERY_ADDRESS,
                name: auth.user?.name ?? "",
                email: auth.user?.email ?? "",
            },
        );
    }, [auth.user?.name, auth.user?.email, deliveryAddress, form.setData]);

    const openEditor = () => {
        form.clearErrors();
        setOpen(true);
    };

    const saveAddress = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.submit(saveMethod, saveUrl, {
            preserveScroll: true,
            onSuccess: () => setOpen(false),
        });
    };

    const removeAddress = () => {
        form.delete(account.addresses.destroy.url(), {
            preserveScroll: true,
            onSuccess: () => setConfirmDelete(false),
        });
    };

    return (
        <>
            <StorefrontBreadcrumbs className="mb-4 sm:mb-6" />

            <AccountPageHeader
                title="Address"
                description="The delivery details saved to your account. Checkout fills these in automatically, and you can still change them for a single order."
            >
                <span className="flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface px-4 text-xs font-extrabold text-ink-muted">
                    <span
                        aria-hidden="true"
                        className={`size-2 rounded-full ${hasAddress ? "bg-mint" : "bg-line"}`}
                    />
                    {hasAddress ? "Saved to your account" : "No address yet"}
                </span>
            </AccountPageHeader>

            {hasAddress ? (
                <section
                    aria-labelledby="address-heading"
                    className="mt-8 rounded-2xl border border-line bg-surface p-5 sm:p-6"
                >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <span className="flex size-11 items-center justify-center rounded-xl bg-brand-soft text-brand-deep">
                            <MapPin aria-hidden="true" className="size-5" />
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-mint-soft px-3 py-1.5 text-xs font-extrabold text-ink">
                                Default
                            </span>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={openEditor}
                                className="h-11 rounded-xl border-line bg-surface px-4 text-sm font-bold text-ink-muted hover:border-brand hover:bg-brand-soft hover:text-brand-deep"
                            >
                                <Pencil aria-hidden="true" className="size-4" />
                                Edit address
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setConfirmDelete(true)}
                                className="h-11 rounded-xl border-line bg-surface px-4 text-sm font-bold text-ink-muted hover:border-error hover:bg-error/10 hover:text-error"
                            >
                                <Trash2 aria-hidden="true" className="size-4" />
                                Delete
                            </Button>
                        </div>
                    </div>
                    <Heading
                        id="address-heading"
                        size="compact"
                        className="mt-4"
                    >
                        {deliveryAddress?.name}
                    </Heading>
                    <address className="mt-2 max-w-md text-sm leading-relaxed font-semibold text-ink-muted not-italic">
                        {deliveryAddress?.address}
                        <br />
                        {deliveryAddress?.city} {deliveryAddress?.postalCode}
                        <br />
                        {deliveryAddress?.country}
                        <br />
                        {deliveryAddress?.phone}
                        <br />
                        {deliveryAddress?.email}
                        {deliveryAddress?.company && (
                            <>
                                <br />
                                {deliveryAddress.company}
                            </>
                        )}
                    </address>
                </section>
            ) : (
                <section className="mt-8 rounded-2xl border border-line bg-surface-alt px-6 py-14 text-center">
                    <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                        <MapPin aria-hidden="true" className="size-7" />
                    </span>
                    <Heading level={2} size="section" className="mt-4">
                        No address saved yet
                    </Heading>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
                        Add your delivery details once and checkout will fill
                        them in for you next time.
                    </p>
                    <Button
                        type="button"
                        onClick={openEditor}
                        className="mt-6 inline-flex min-h-11 rounded-xl bg-brand px-5 text-sm font-extrabold text-surface hover:bg-brand-deep"
                    >
                        <Plus aria-hidden="true" className="size-4" />
                        Add address
                    </Button>
                </section>
            )}

            <AddressFormDialog
                open={open}
                onOpenChange={setOpen}
                title={hasAddress ? "Edit address" : "Add address"}
                submitLabel={hasAddress ? "Save changes" : "Save address"}
                values={form.data}
                errors={form.errors}
                processing={form.processing}
                onChange={(field, value) => {
                    form.setData(field, value);
                    form.clearErrors(field);
                }}
                onSubmit={saveAddress}
            />

            <DeleteAddressDialog
                open={confirmDelete}
                onOpenChange={setConfirmDelete}
                processing={form.processing}
                onConfirm={removeAddress}
            />

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
                <p className="text-xs font-semibold text-ink-muted">
                    Saved addresses are private to your account.
                </p>
                <Link
                    href="/account/orders"
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl text-sm font-extrabold text-brand transition-colors hover:text-brand-deep"
                >
                    See your orders
                    <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
            </div>
        </>
    );
}
