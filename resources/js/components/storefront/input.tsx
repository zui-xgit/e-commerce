import { Eye, EyeOff } from 'lucide-react';
import type { ComponentProps, Ref } from 'react';
import { useState } from 'react';
import { Input as BaseInput } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type StorefrontInputVariant = 'surface' | 'soft' | 'bare';

type StorefrontInputProps = Omit<ComponentProps<'input'>, 'size'> & {
    /** Applies the storefront error state and sets `aria-invalid`. */
    invalid?: boolean;
    /**
     * `surface` sits on white cards, `soft` on tinted surfaces, and `bare`
     * for inputs embedded inside another control (like a quantity stepper).
     */
    variant?: StorefrontInputVariant;
};

/**
 * One source of truth for storefront field chrome: 48px tall, 12px radius,
 * hairline border, brand focus ring. Shared with non-input controls such as
 * the checkout country `SelectTrigger`.
 */
export function storefrontInputClass({
    invalid = false,
    variant = 'surface',
}: {
    invalid?: boolean;
    variant?: StorefrontInputVariant;
} = {}) {
    return cn(
        'h-12 w-full min-w-0 rounded-xl border-line bg-surface px-3 text-base text-ink shadow-none transition-[border-color,box-shadow] selection:bg-brand selection:text-surface placeholder:text-ink-muted hover:border-brand focus-visible:border-brand focus-visible:ring-[3px] focus-visible:ring-brand/20 focus-visible:outline-none! disabled:cursor-not-allowed disabled:opacity-60 data-[size=default]:h-12 sm:text-sm',
        variant === 'soft' && 'bg-surface-alt',
        variant === 'bare' &&
            'rounded-none border-0 bg-transparent px-0 text-center font-bold tabular-nums shadow-none hover:border-transparent focus-visible:border-transparent focus-visible:ring-0',
        invalid &&
            'border-error hover:border-error focus-visible:border-error focus-visible:ring-error/20 aria-invalid:border-error aria-invalid:ring-error/20',
    );
}

export function Input({
    className,
    invalid,
    variant = 'surface',
    'aria-invalid': ariaInvalid,
    ...props
}: StorefrontInputProps) {
    const isInvalid = invalid ?? ariaInvalid === true;

    return (
        <BaseInput
            aria-invalid={isInvalid}
            className={cn(
                storefrontInputClass({ invalid: isInvalid, variant }),
                className,
            )}
            {...props}
        />
    );
}

export type StorefrontPasswordInputProps = Omit<
    StorefrontInputProps,
    'type'
> & {
    ref?: Ref<HTMLInputElement>;
};

export function PasswordInput({
    className,
    ref,
    ...props
}: StorefrontPasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="relative">
            <Input
                type={showPassword ? 'text' : 'password'}
                className={cn('pr-10', className)}
                ref={ref}
                {...props}
            />
            <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center rounded-r-xl px-3 text-ink-muted transition-colors hover:text-brand-deep focus-visible:ring-[3px] focus-visible:ring-brand/20 focus-visible:outline-none"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                tabIndex={-1}
            >
                {showPassword ? (
                    <EyeOff aria-hidden="true" className="size-4" />
                ) : (
                    <Eye aria-hidden="true" className="size-4" />
                )}
            </button>
        </div>
    );
}
