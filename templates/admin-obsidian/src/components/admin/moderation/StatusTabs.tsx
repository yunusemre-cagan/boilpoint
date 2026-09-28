"use client";

import { CircleCheck, CircleDashed, CircleX, Inbox, Mail, MailOpen } from "lucide-react";
import { Segmented } from "../ui/Segmented";
import { useListNav } from "../ui/ListNav";

// Sunucu bileşenleri istemciye bileşen geçemediği için ikonlar adla seçilir
const ICONS = { inbox: Inbox, pending: CircleDashed, approved: CircleCheck, rejected: CircleX, mail: Mail, mailOpen: MailOpen };

export type StatusTabItem<T extends string> = { value: T; label: string; icon: keyof typeof ICONS; count: number };

/** Adres çubuğundaki `status` parametresine bağlı filtre sekmeleri. */
export function StatusTabs<T extends string>({ value, items, defaultValue }: { value: T; items: StatusTabItem<T>[]; defaultValue: T }) {
    const { navigate } = useListNav();
    return (
        <Segmented
            ariaLabel="Durum filtresi"
            value={value}
            onChange={(next) => navigate({ status: next === defaultValue ? null : next, page: null })}
            items={items.map((item) => ({ ...item, icon: ICONS[item.icon] }))}
            className="max-w-full self-start overflow-x-auto"
        />
    );
}
