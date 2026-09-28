"use client";

import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Dialog({
    open,
    onOpenChange,
    title,
    description,
    children,
    width = "32rem",
    className,
    hideClose,
    hideTitle,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: React.ReactNode;
    description?: React.ReactNode;
    children?: React.ReactNode;
    width?: string;
    className?: string;
    hideClose?: boolean;
    /** Başlık yalnızca ekran okuyucular için */
    hideTitle?: boolean;
}) {
    return (
        <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
            <RadixDialog.Portal>
                <RadixDialog.Overlay className="adm-overlay adm-portal" />
                <RadixDialog.Content
                    className={cn("adm-dialog adm-elevated adm-portal rounded-[1.4rem] p-6", className)}
                    style={{ "--dialog-w": width } as React.CSSProperties}
                >
                    <RadixDialog.Title className={cn("pr-8 text-lg font-semibold tracking-tight adm-text", hideTitle && "sr-only")}>
                        {title}
                    </RadixDialog.Title>
                    {description ? (
                        <RadixDialog.Description className={cn("mt-1 text-sm adm-text-2", hideTitle && "sr-only")}>
                            {description}
                        </RadixDialog.Description>
                    ) : (
                        <RadixDialog.Description className="sr-only">{typeof title === "string" ? title : "Pencere"}</RadixDialog.Description>
                    )}
                    {children}
                    {!hideClose && (
                        <RadixDialog.Close
                            className="adm-btn adm-btn-ghost adm-btn-sm adm-btn-icon absolute right-3 top-3 [&>svg]:transition-transform [&>svg]:duration-300 hover:[&>svg]:rotate-90"
                            aria-label="Kapat"
                        >
                            <X />
                        </RadixDialog.Close>
                    )}
                </RadixDialog.Content>
            </RadixDialog.Portal>
        </RadixDialog.Root>
    );
}
