import { Head, Link, useForm } from "@inertiajs/react";
import {
    ExternalLink,
    Globe2,
    ImageIcon,
    LoaderCircle,
    Mail,
    Save,
    Search,
    Settings2,
    Share2,
    Store,
    Undo2,
    Wrench,
    X,
    type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import InputError from "@/components/input-error";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import admin from "@/routes/admin";
import type {
    SettingDefinition,
    SiteSettingsProps,
} from "@/types/site-settings";
import Heading from "@/components/heading";
import { home } from "@/routes";

type FormValues = Record<string, string | boolean | File | null | string[]>;
type FormValue = FormValues[string];

const cloneFormValues = (values: FormValues): FormValues =>
    Object.fromEntries(
        Object.entries(values).map(([key, value]) => [
            key,
            Array.isArray(value) ? [...value] : value,
        ]),
    );

const valuesEqual = (current: FormValue, saved: FormValue) => {
    if (Array.isArray(current) && Array.isArray(saved)) {
        return (
            current.length === saved.length &&
            current.every((value, index) => value === saved[index])
        );
    }

    return current === saved;
};

const groupIcons: Record<string, LucideIcon> = {
    identity: Store,
    contact: Mail,
    localization: Globe2,
    seo: Search,
    social: Share2,
    maintenance: Wrench,
};

const tabListClassName = cn(
    "flex h-auto w-full min-w-0 justify-start gap-1 overflow-x-auto overscroll-x-contain rounded-lg border bg-card p-1.5 text-foreground shadow-xs lg:flex-col lg:overflow-visible",
    "group-data-[orientation=horizontal]/tabs:h-auto",
);

const tabTriggerClassName = cn(
    "flex h-auto min-h-11 w-auto flex-none shrink-0 items-center justify-start gap-2 rounded-md border-0 px-3 py-2 text-sm font-normal text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none sm:min-h-9 lg:w-full",
    "data-[state=active]:bg-accent data-[state=active]:font-medium data-[state=active]:text-accent-foreground",
    "group-data-[variant=default]/tabs-list:data-[state=active]:shadow-none",
);

export default function SiteSettings({
    groups,
    definitions,
    settings,
    previews,
}: SiteSettingsProps) {
    const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
    const [clearedFiles, setClearedFiles] = useState<string[]>([]);
    const previewUrlsRef = useRef(previewUrls);

    const form = useForm<FormValues>({
        ...(settings as FormValues),
        clear_files: [],
    });

    const savedValues = useRef<FormValues>(
        cloneFormValues({ ...(settings as FormValues), clear_files: [] }),
    );

    const groupFields = groups.map((group) => ({
        group,
        fields: Object.values(definitions).filter(
            (definition) => definition.group === group.key,
        ),
    }));

    useEffect(() => {
        previewUrlsRef.current = previewUrls;
    }, [previewUrls]);

    useEffect(
        () => () => {
            Object.values(previewUrlsRef.current).forEach((url) =>
                URL.revokeObjectURL(url),
            );
        },
        [],
    );

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        form.put(admin.siteSettings.update().url, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                const nextValues = { ...form.data, clear_files: [] };

                form.setData(nextValues);
                form.setDefaults();
                savedValues.current = cloneFormValues(nextValues);
                setClearedFiles([]);
                setPreviewUrls({});
            },
        });
    };

    const ignoreChanges = () => {
        Object.values(previewUrls).forEach((url) => URL.revokeObjectURL(url));

        setPreviewUrls({});
        setClearedFiles([]);
        form.reset();

        document
            .querySelectorAll<HTMLInputElement>(
                "#site-settings-form input[type='file']",
            )
            .forEach((input) => {
                input.value = "";
            });
    };

    const updateClearedFiles = (key: string, shouldClear: boolean) => {
        const next = shouldClear
            ? Array.from(new Set([...clearedFiles, key]))
            : clearedFiles.filter((clearedKey) => clearedKey !== key);

        setClearedFiles(next);
        form.setData("clear_files", next);
    };

    const handleFileChange = (
        definition: SettingDefinition,
        file: File | null,
    ) => {
        const previousUrl = previewUrls[definition.key];

        if (previousUrl) {
            URL.revokeObjectURL(previousUrl);
        }

        setPreviewUrls((current) => {
            const next = { ...current };

            if (previousUrl) {
                delete next[definition.key];
            }

            if (file) {
                next[definition.key] = URL.createObjectURL(file);
            }

            return next;
        });

        form.setData(definition.key, file);
        updateClearedFiles(definition.key, false);
    };

    const fieldHasUnsavedChanges = (definition: SettingDefinition) => {
        if (
            definition.type === "file" &&
            clearedFiles.includes(definition.key)
        ) {
            return true;
        }

        return !valuesEqual(
            form.data[definition.key],
            savedValues.current[definition.key],
        );
    };

    const removeFile = (definition: SettingDefinition) => {
        const input = document.getElementById(
            definition.key,
        ) as HTMLInputElement | null;

        if (input) {
            input.value = "";
        }

        handleFileChange(definition, null);
        updateClearedFiles(definition.key, true);
    };

    const renderField = (definition: SettingDefinition) => {
        const value = form.data[definition.key];
        const error = form.errors[definition.key];
        const unsavedMessage = fieldHasUnsavedChanges(definition)
            ? "Unsaved changes."
            : undefined;

        if (definition.type === "boolean") {
            return (
                <div
                    key={definition.key}
                    className={cn(
                        "flex min-w-0 items-start gap-3 rounded-md border p-3 sm:p-4",
                        error && "border-destructive",
                    )}
                >
                    <Checkbox
                        id={definition.key}
                        className="mt-0.5 size-5 shrink-0 sm:size-4"
                        checked={Boolean(value)}
                        onCheckedChange={(checked) =>
                            form.setData(definition.key, checked === true)
                        }
                    />
                    <div className="min-w-0 space-y-1">
                        <Label
                            htmlFor={definition.key}
                            className="cursor-pointer"
                        >
                            {definition.label}
                        </Label>
                        {definition.help && (
                            <p className="text-xs text-muted-foreground">
                                {definition.help}
                            </p>
                        )}
                        <InputError message={error ?? unsavedMessage} />
                    </div>
                </div>
            );
        }

        if (definition.type === "file") {
            const preview = clearedFiles.includes(definition.key)
                ? null
                : (previewUrls[definition.key] ?? previews[definition.key]);

            return (
                <div key={definition.key} className="min-w-0 space-y-2">
                    <Label htmlFor={definition.key}>{definition.label}</Label>
                    <div className="flex flex-col gap-3 rounded-md border border-dashed p-3 sm:flex-row sm:items-center">
                        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted/50 sm:size-16">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt={`${definition.label} preview`}
                                    className="size-full object-contain"
                                />
                            ) : (
                                <ImageIcon className="size-6 text-muted-foreground" />
                            )}
                        </div>
                        <div className="min-w-0 flex-1 space-y-2">
                            <Input
                                id={definition.key}
                                type="file"
                                accept={definition.accept}
                                onChange={(event) =>
                                    handleFileChange(
                                        definition,
                                        event.target.files?.[0] ?? null,
                                    )
                                }
                                className="h-auto cursor-pointer py-2"
                            />
                            {preview && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFile(definition)}
                                    className="min-h-11 w-full sm:min-h-0 sm:w-auto"
                                >
                                    <X />
                                    Remove
                                </Button>
                            )}
                        </div>
                    </div>
                    {definition.help && (
                        <p className="text-xs text-muted-foreground">
                            {definition.help}
                        </p>
                    )}
                    <InputError message={error ?? unsavedMessage} />
                </div>
            );
        }

        return (
            <div key={definition.key} className="grid min-w-0 gap-2">
                <Label htmlFor={definition.key}>{definition.label}</Label>

                {definition.type === "select" ? (
                    <Select
                        value={typeof value === "string" ? value : ""}
                        onValueChange={(next) =>
                            form.setData(definition.key, next)
                        }
                    >
                        <SelectTrigger
                            id={definition.key}
                            className="w-full min-w-0"
                        >
                            <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                            {Object.entries(definition.options ?? {}).map(
                                ([optionValue, optionLabel]) => (
                                    <SelectItem
                                        key={optionValue}
                                        value={optionValue}
                                    >
                                        {optionLabel}
                                    </SelectItem>
                                ),
                            )}
                        </SelectContent>
                    </Select>
                ) : definition.type === "text" ? (
                    <Textarea
                        id={definition.key}
                        rows={4}
                        value={typeof value === "string" ? value : ""}
                        placeholder={definition.placeholder}
                        onChange={(event) =>
                            form.setData(definition.key, event.target.value)
                        }
                    />
                ) : (
                    <Input
                        id={definition.key}
                        type={
                            definition.type === "email"
                                ? "email"
                                : definition.type === "url"
                                  ? "url"
                                  : "text"
                        }
                        value={typeof value === "string" ? value : ""}
                        placeholder={definition.placeholder}
                        onChange={(event) =>
                            form.setData(definition.key, event.target.value)
                        }
                    />
                )}

                {definition.help && (
                    <p className="text-xs text-muted-foreground">
                        {definition.help}
                    </p>
                )}
                <InputError message={error ?? unsavedMessage} />
            </div>
        );
    };

    return (
        <>
            <Head title="Site settings" />

            <div className="w-full min-w-0 space-y-4 sm:space-y-6">
                <div className="flex flex-col gap-3 border-b pb-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pb-4">
                    <div className="min-w-0 [&>header]:mb-0">
                        <Heading
                            title="Site settings"
                            description="Manage how your store looks, communicates and behaves across every page."
                        />
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        className="min-h-11 w-full shrink-0 sm:min-h-0 sm:w-auto"
                        asChild
                    >
                        <Link
                            href={home()}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            View storefront
                            <ExternalLink />
                        </Link>
                    </Button>
                </div>

                <Tabs
                    defaultValue={groups[0]?.key ?? "identity"}
                    className="grid min-w-0 items-start gap-4 sm:gap-6 lg:grid-cols-[220px_minmax(0,1fr)]"
                >
                    <div className="min-w-0 lg:sticky lg:top-6">
                        <TabsList
                            aria-label="Setting groups"
                            className={tabListClassName}
                        >
                            {groupFields.map(({ group, fields }) => {
                                const Icon = groupIcons[group.key] ?? Settings2;

                                return (
                                    <TabsTrigger
                                        key={group.key}
                                        value={group.key}
                                        className={tabTriggerClassName}
                                    >
                                        <Icon className="size-4 shrink-0" />
                                        <span className="min-w-0 flex-1 whitespace-nowrap text-left">
                                            {group.label}
                                        </span>
                                        <span className="hidden text-xs text-muted-foreground tabular-nums sm:inline">
                                            {fields.length}
                                        </span>
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                        <p className="mt-3 hidden px-2 text-xs text-muted-foreground lg:block">
                            Changes apply across the whole store.
                        </p>
                    </div>

                    <Card className="min-w-0 gap-0 py-0">
                        <form
                            id="site-settings-form"
                            onSubmit={submit}
                            noValidate
                        >
                            {groupFields.map(({ group, fields }) => (
                                <TabsContent key={group.key} value={group.key}>
                                    <CardHeader className="border-b px-4 py-4 sm:px-6 sm:py-5">
                                        <CardTitle className="text-lg">
                                            {group.label}
                                        </CardTitle>
                                        <CardDescription>
                                            {group.description}
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="space-y-5 px-4 py-5 sm:space-y-6 sm:px-6 sm:py-6">
                                        {fields.map(renderField)}
                                    </CardContent>
                                </TabsContent>
                            ))}

                            <Separator className="hidden sm:block" />

                            <CardFooter className="sticky bottom-0 z-10 flex-col items-stretch gap-3 border-t bg-muted px-4 py-4 sm:static sm:flex-row sm:items-center sm:justify-between sm:border-t-0 sm:bg-muted/30 sm:px-6">
                                <p
                                    className={cn(
                                        "text-xs",
                                        form.isDirty
                                            ? "text-destructive"
                                            : "text-muted-foreground",
                                    )}
                                >
                                    {form.isDirty
                                        ? "You have unsaved changes."
                                        : "All changes saved."}
                                </p>
                                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:justify-end">
                                    {form.isDirty && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            disabled={form.processing}
                                            onClick={ignoreChanges}
                                            className="min-h-11 w-full sm:min-h-0 sm:w-auto"
                                        >
                                            <Undo2 />
                                            Ignore changes
                                        </Button>
                                    )}
                                    <Button
                                        type="submit"
                                        disabled={form.processing}
                                        className="min-h-11 w-full sm:min-h-0 sm:w-auto"
                                    >
                                        {form.processing ? (
                                            <LoaderCircle className="animate-spin" />
                                        ) : (
                                            <Save />
                                        )}
                                        {form.processing
                                            ? "Saving…"
                                            : "Save changes"}
                                    </Button>
                                </div>
                            </CardFooter>
                        </form>
                    </Card>
                </Tabs>
            </div>
        </>
    );
}

SiteSettings.layout = {
    breadcrumbs: [
        {
            title: "Site settings",
            href: admin.siteSettings.edit(),
        },
    ],
};
