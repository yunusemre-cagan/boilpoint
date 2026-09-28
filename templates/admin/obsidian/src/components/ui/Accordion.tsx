"use client";

import { useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AccordionItem {
    q: string;
    a: string;
}

/**
 * Yumuşak açılan akordeon.
 *
 * Neden <details> değil: tarayıcılar <details> kapalıyken içeriği tamamen
 * gizlediği için yüksekliği geçişle canlandırmak mümkün olmuyor — içerik
 * "pat" diye beliriyor. Burada grid-template-rows 0fr → 1fr geçişi kullanılır;
 * içeriğin gerçek yüksekliğini bilmeye gerek kalmadan her yerde akıcı çalışır.
 */
export function Accordion({ items, className }: { items: AccordionItem[]; className?: string }) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const baseId = useId();

    if (items.length === 0) return null;

    return (
        <div className={cn("space-y-3", className)}>
            {items.map((item, index) => {
                const isOpen = openIndex === index;
                const panelId = `${baseId}-panel-${index}`;
                const buttonId = `${baseId}-button-${index}`;

                return (
                    <div
                        key={item.q}
                        className={cn(
                            "rounded-2xl border bg-card/50 overflow-hidden transition-colors duration-300",
                            isOpen ? "border-accent/30" : "border-border/50"
                        )}
                    >
                        <h3>
                            <button
                                id={buttonId}
                                type="button"
                                aria-expanded={isOpen}
                                aria-controls={panelId}
                                onClick={() => setOpenIndex(isOpen ? null : index)}
                                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left font-semibold text-sm text-foreground hover:bg-muted/40 transition-colors"
                            >
                                <span>{item.q}</span>
                                <ChevronDown
                                    className={cn(
                                        "w-4 h-4 shrink-0 text-muted-foreground transition-transform duration-300 ease-out",
                                        isOpen && "rotate-180 text-accent"
                                    )}
                                />
                            </button>
                        </h3>

                        <div
                            id={panelId}
                            role="region"
                            aria-labelledby={buttonId}
                            className={cn(
                                "grid transition-[grid-template-rows,opacity] duration-300 ease-out motion-reduce:transition-none",
                                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                            )}
                        >
                            <div className="overflow-hidden">
                                <p className="px-6 pb-5 text-sm text-muted-foreground font-light leading-relaxed">
                                    {item.a}
                                </p>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
