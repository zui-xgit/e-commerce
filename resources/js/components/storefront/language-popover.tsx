import { useId, useState } from 'react';
import { Check, Globe } from 'lucide-react';
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from '@/components/ui/popover';
import { useStorefrontLanguageStore } from '@/hooks/stores/use-storefront-language-store';
import { cn } from '@/lib/utils';

const languages = [
    { code: 'en', label: 'English', hint: 'Default' },
    { code: 'sw', label: 'Swahili', hint: 'Kiswahili' },
] as const;

const triggerClassName =
    'flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-line bg-surface px-2.5 text-sm font-semibold text-ink transition-colors hover:border-brand hover:bg-brand-soft hover:text-brand-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface data-[state=open]:border-brand data-[state=open]:bg-brand-soft data-[state=open]:text-brand-deep';

export function LanguagePopover() {
    const [open, setOpen] = useState(false);
    const language = useStorefrontLanguageStore((state) => state.language);
    const setLanguage = useStorefrontLanguageStore(
        (state) => state.setLanguage,
    );
    const activeLanguage =
        languages.find((item) => item.code === language) ?? languages[0];

    const uid = useId();
    const titleId = `${uid}-title`;
    const descriptionId = `${uid}-description`;
    const noteId = `${uid}-note`;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    aria-label={`Language: ${activeLanguage.label}`}
                    className={triggerClassName}
                >
                    <Globe
                        aria-hidden="true"
                        className="size-4 shrink-0 text-brand-deep"
                    />
                    <span
                        aria-hidden="true"
                        className="text-xs font-extrabold tracking-wide uppercase"
                    >
                        {activeLanguage.code.toUpperCase()}
                    </span>
                </button>
            </PopoverTrigger>

            <PopoverContent
                align="end"
                sideOffset={8}
                collisionPadding={12}
                aria-labelledby={titleId}
                aria-describedby={`${descriptionId} ${noteId}`}
                className="storefront w-56 rounded-2xl border border-line bg-surface p-2 text-ink shadow-lg"
            >
                <PopoverHeader className="gap-1 px-2 pt-2 pb-2.5">
                    <PopoverTitle
                        id={titleId}
                        className="font-display text-base leading-tight font-extrabold tracking-tight text-ink"
                    >
                        Language
                    </PopoverTitle>
                    <PopoverDescription
                        id={descriptionId}
                        className="text-xs leading-relaxed text-ink-muted"
                    >
                        English and Swahili are available.
                    </PopoverDescription>
                </PopoverHeader>

                <div
                    role="group"
                    aria-label="Choose a language"
                    className="space-y-1 border-t border-line pt-2"
                >
                    {languages.map((item) => {
                        const active = item.code === language;

                        return (
                            <button
                                key={item.code}
                                type="button"
                                aria-pressed={active}
                                onClick={() => setLanguage(item.code)}
                                className={cn(
                                    'flex min-h-11 w-full items-center gap-2 rounded-xl px-2.5 text-left text-sm font-semibold transition-colors',
                                    active
                                        ? 'bg-brand-soft text-brand-deep'
                                        : 'text-ink hover:bg-surface-alt hover:text-brand-deep',
                                )}
                            >
                                <Check
                                    aria-hidden="true"
                                    className={cn(
                                        'size-4 shrink-0 text-brand-deep',
                                        !active && 'opacity-0',
                                    )}
                                />
                                <span className="flex-1">{item.label}</span>
                                <span className="text-[11px] font-bold tracking-wide text-ink-muted uppercase">
                                    {item.hint}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <p
                    id={noteId}
                    className="mt-2 border-t border-line px-2 pt-2 text-[11px] leading-relaxed text-ink-muted"
                >
                    UI preview &mdash; selecting a language doesn&rsquo;t
                    translate the storefront yet.
                </p>
            </PopoverContent>
        </Popover>
    );
}
