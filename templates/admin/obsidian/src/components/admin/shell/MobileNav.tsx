"use client";

import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useAdminUI } from "./AdminUIContext";
import { SidebarContent } from "./Sidebar";

/** Dar ekranlarda soldan kayarak açılan menü. */
export function MobileNav() {
    const { mobileNavOpen, setMobileNavOpen } = useAdminUI();

    return (
        <RadixDialog.Root open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <RadixDialog.Portal>
                <RadixDialog.Overlay className="adm-overlay adm-portal lg:hidden" />
                <RadixDialog.Content className="adm-drawer adm-portal flex flex-col border-r border-[var(--adm-border)] bg-[var(--adm-surface)] shadow-[var(--adm-shadow-lg)] lg:hidden">
                    <RadixDialog.Title className="sr-only">Yönetim menüsü</RadixDialog.Title>
                    <RadixDialog.Description className="sr-only">Panel sayfaları arasında gezinin</RadixDialog.Description>
                    <RadixDialog.Close
                        className="adm-btn adm-btn-ghost adm-btn-sm adm-btn-icon absolute right-3 top-4 z-10 [&>svg]:transition-transform [&>svg]:duration-300 hover:[&>svg]:rotate-90"
                        aria-label="Menüyü kapat"
                    >
                        <X />
                    </RadixDialog.Close>
                    <SidebarContent expanded mobile onNavigate={() => setMobileNavOpen(false)} />
                </RadixDialog.Content>
            </RadixDialog.Portal>
        </RadixDialog.Root>
    );
}
