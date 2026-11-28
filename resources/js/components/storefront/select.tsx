import {
    Select as BaseSelect,
    SelectContent as BaseSelectContent,
    SelectGroup,
    SelectItem as BaseSelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger as BaseSelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";

/**
 * Storefront skin for the shadcn Select: structure, radius, padding, shadow,
 * and transitions stay untouched. The trigger fills its field so form controls
 * line up; colors, border color, focus, placeholder, and error states use
 * storefront tokens.
 */
export function storefrontSelectTriggerClass({
    invalid = false,
}: {
    invalid?: boolean;
} = {}) {
    return cn(
        'w-full border-line bg-surface text-ink data-[placeholder]:text-ink-muted data-[state=open]:border-brand data-[state=open]:ring-[3px] data-[state=open]:ring-brand/20 [&_svg:not([class*="text-"])]:text-ink-muted! hover:border-brand focus-visible:border-brand focus-visible:ring-brand/20 focus-visible:outline-none! dark:bg-surface dark:hover:bg-surface',
        invalid &&
            "border-error hover:border-error focus-visible:border-error focus-visible:ring-error/20 aria-invalid:border-error aria-invalid:ring-error/20 dark:aria-invalid:ring-error/20",
    );
}

export function Select(props: ComponentProps<typeof BaseSelect>) {
    return <BaseSelect {...props} />;
}

export { SelectGroup, SelectLabel, SelectSeparator, SelectValue };

export type StorefrontSelectTriggerProps = ComponentProps<
    typeof BaseSelectTrigger
> & {
    /** Applies the storefront error state and sets `aria-invalid`. */
    invalid?: boolean;
};

export function SelectTrigger({
    className,
    invalid,
    "aria-invalid": ariaInvalid,
    ...props
}: StorefrontSelectTriggerProps) {
    const isInvalid = invalid ?? ariaInvalid === true;

    return (
        <BaseSelectTrigger
            aria-invalid={isInvalid}
            className={cn(
                storefrontSelectTriggerClass({ invalid: isInvalid }),
                className,
            )}
            {...props}
        />
    );
}

export function SelectContent({
    className,
    ...props
}: ComponentProps<typeof BaseSelectContent>) {
    return (
        <BaseSelectContent
            className={cn(
                "storefront border-line bg-surface text-ink",
                className,
            )}
            {...props}
        />
    );
}

export function SelectItem({
    className,
    ...props
}: ComponentProps<typeof BaseSelectItem>) {
    return (
        <BaseSelectItem
            className={cn(
                'text-ink focus:bg-brand-soft focus:text-brand-deep [&_svg:not([class*="text-"])]:text-brand data-[state=checked]:text-brand-deep',
                className,
            )}
            {...props}
        />
    );
}
