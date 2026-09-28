"use client";

import { Cloud, HardDrive, Layers } from "lucide-react";
import { SearchField } from "../ui/SearchField";
import { Segmented } from "../ui/Segmented";
import { useListNav } from "../ui/ListNav";
import { MEDIA_SORTS, type MediaSort, type MediaSource } from "./constants";

export function MediaToolbar({
    source,
    sort,
    counts,
}: {
    source: MediaSource;
    sort: MediaSort;
    counts: { all: number; cloudinary: number; local: number };
}) {
    const { navigate } = useListNav();
    return (
        <div className="flex flex-col gap-3 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
            <Segmented
                ariaLabel="Kaynak"
                value={source}
                onChange={(value) => navigate({ source: value === "all" ? null : value, page: null })}
                items={[
                    { value: "all", label: "Tümü", icon: Layers, count: counts.all },
                    { value: "cloudinary", label: "Cloudinary", icon: Cloud, count: counts.cloudinary },
                    { value: "local", label: "Yerel", icon: HardDrive, count: counts.local },
                ]}
                className="self-start overflow-x-auto"
            />
            <div className="flex flex-col gap-2 sm:flex-row">
                <SearchField placeholder="Dosya adında ara…" className="sm:w-64" />
                <select
                    value={sort}
                    onChange={(e) => navigate({ sort: e.target.value === "new" ? null : e.target.value, page: null })}
                    aria-label="Sıralama"
                    className="adm-input sm:w-44"
                >
                    {Object.entries(MEDIA_SORTS).map(([value, label]) => (
                        <option key={value} value={value}>
                            {label}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
}
