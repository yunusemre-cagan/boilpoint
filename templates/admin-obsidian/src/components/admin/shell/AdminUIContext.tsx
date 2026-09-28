"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { SIDEBAR_COOKIE, type AdminCounts, type SidebarMode } from "./nav";

export type AdminUser = { name: string | null; email: string | null };

type AdminUIValue = {
    sidebarMode: SidebarMode;
    setSidebarMode: (mode: SidebarMode) => void;
    mobileNavOpen: boolean;
    setMobileNavOpen: (open: boolean) => void;
    commandOpen: boolean;
    setCommandOpen: (open: boolean) => void;
    counts: AdminCounts;
    user: AdminUser;
};

const AdminUIContext = createContext<AdminUIValue | null>(null);

export function AdminUIProvider({
    initialSidebarMode,
    counts,
    user,
    children,
}: {
    initialSidebarMode: SidebarMode;
    counts: AdminCounts;
    user: AdminUser;
    children: React.ReactNode;
}) {
    const [sidebarMode, setMode] = useState<SidebarMode>(initialSidebarMode);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);
    const [commandOpen, setCommandOpen] = useState(false);

    // Tercih çerezde tutulur ki sunucu ilk çizimde doğru genişliği versin (kayma olmaz)
    const setSidebarMode = useCallback((mode: SidebarMode) => {
        setMode(mode);
        document.cookie = `${SIDEBAR_COOKIE}=${mode}; path=/; max-age=31536000; samesite=lax`;
    }, []);

    const value = useMemo(
        () => ({ sidebarMode, setSidebarMode, mobileNavOpen, setMobileNavOpen, commandOpen, setCommandOpen, counts, user }),
        [sidebarMode, setSidebarMode, mobileNavOpen, commandOpen, counts, user],
    );

    return <AdminUIContext.Provider value={value}>{children}</AdminUIContext.Provider>;
}

export function useAdminUI() {
    const value = useContext(AdminUIContext);
    if (!value) throw new Error("useAdminUI, AdminUIProvider içinde kullanılmalı");
    return value;
}

/** Kabuğun dışında (ör. giriş sayfası) da güvenle çağrılabilen sürüm. */
export function useOptionalAdminUI() {
    return useContext(AdminUIContext);
}
