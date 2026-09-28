"use client";

import { useMemo, useRef, useState } from "react";
import { Hash, Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type TagOption = { id: string; name: string };

/**
 * Etiket seçici: yazdıkça mevcut etiketleri önerir, Enter ile ekler (yoksa
 * yenisini oluşturur), Backspace son etiketi siler. Her etiket `tags` adlı
 * gizli alanla gönderilir (mevcutsa id, yeniyse adı).
 */
export function TagInput({
    allTags,
    value,
    onChange,
    name = "tags",
}: {
    allTags: TagOption[];
    value: TagOption[];
    onChange: (tags: TagOption[]) => void;
    name?: string;
}) {
    const [query, setQuery] = useState("");
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const trimmed = query.trim();
    const suggestions = useMemo(() => {
        const q = trimmed.toLocaleLowerCase("tr-TR");
        return allTags
            .filter((tag) => !value.some((v) => v.id === tag.id || v.name === tag.name))
            .filter((tag) => !q || tag.name.toLocaleLowerCase("tr-TR").includes(q))
            .slice(0, 8);
    }, [allTags, value, trimmed]);
    const exact = allTags.some((tag) => tag.name.toLocaleLowerCase("tr-TR") === trimmed.toLocaleLowerCase("tr-TR"));
    const options: (TagOption & { create?: boolean })[] = [...suggestions, ...(trimmed && !exact ? [{ id: trimmed, name: trimmed, create: true }] : [])];

    const add = (tag: TagOption) => {
        if (!value.some((v) => v.id === tag.id || v.name.toLocaleLowerCase("tr-TR") === tag.name.toLocaleLowerCase("tr-TR"))) {
            onChange([...value, tag]);
        }
        setQuery("");
        setActive(0);
        inputRef.current?.focus();
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
            setActive((i) => (options.length ? (i + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length : 0));
        } else if (e.key === "Enter" || e.key === ",") {
            if (!trimmed && e.key === "Enter") return;
            e.preventDefault();
            const option = options[active] ?? (trimmed ? { id: trimmed, name: trimmed } : null);
            if (option) add(option);
        } else if (e.key === "Backspace" && !query && value.length) {
            onChange(value.slice(0, -1));
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    };

    return (
        <div className="relative">
            <div
                onClick={() => inputRef.current?.focus()}
                className="adm-input flex h-auto min-h-[2.625rem] cursor-text flex-wrap items-center gap-1.5 px-2 py-1.5"
            >
                {value.map((tag) => (
                    <span
                        key={tag.name}
                        className="adm-pop-in inline-flex items-center gap-1 rounded-lg bg-[var(--adm-accent-soft)] py-1 pl-2 pr-1 text-xs font-medium text-[var(--adm-accent-text)]"
                    >
                        <Hash className="h-3 w-3 opacity-60" />
                        {tag.name}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange(value.filter((v) => v.name !== tag.name));
                            }}
                            className="rounded-md p-0.5 transition-colors hover:bg-[var(--adm-accent)] hover:text-white"
                            aria-label={`${tag.name} etiketini kaldır`}
                        >
                            <X className="h-3 w-3" />
                        </button>
                        <input type="hidden" name={name} value={tag.id} />
                    </span>
                ))}
                <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setActive(0);
                        setOpen(true);
                    }}
                    onFocus={() => setOpen(true)}
                    onBlur={() => setTimeout(() => setOpen(false), 120)}
                    onKeyDown={onKeyDown}
                    placeholder={value.length ? "" : "Etiket ekle…"}
                    className="h-7 min-w-[6rem] flex-1 bg-transparent px-1.5 text-sm outline-none placeholder:text-[var(--adm-text-3)]"
                    role="combobox"
                    aria-expanded={open && options.length > 0}
                    aria-autocomplete="list"
                />
            </div>

            {open && options.length > 0 && (
                <ul role="listbox" className="adm-popover adm-elevated absolute inset-x-0 top-full z-30 mt-1.5 max-h-56 overflow-y-auto p-1.5 [--origin:top_center]">
                    {options.map((option, i) => (
                        <li key={option.create ? `create-${option.name}` : option.id} role="option" aria-selected={i === active}>
                            <button
                                type="button"
                                onMouseDown={(e) => e.preventDefault()}
                                onMouseEnter={() => setActive(i)}
                                onClick={() => add({ id: option.id, name: option.name })}
                                className={cn("adm-menu-item", i === active && "bg-[var(--adm-surface-2)] text-[var(--adm-text)]")}
                            >
                                {option.create ? <Plus className="!text-[var(--adm-accent)]" /> : <Hash />}
                                {option.create ? (
                                    <span>
                                        Yeni etiket: <strong className="font-semibold adm-text">{option.name}</strong>
                                    </span>
                                ) : (
                                    option.name
                                )}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
