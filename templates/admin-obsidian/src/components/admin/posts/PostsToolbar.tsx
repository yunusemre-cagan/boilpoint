"use client";

import { FileCheck2, FilePen, Files } from "lucide-react";
import { SearchField } from "../ui/SearchField";
import { Segmented } from "../ui/Segmented";
import { useListNav } from "../ui/ListNav";
import { POST_SORTS, type PostSort, type PostStatus } from "./constants";


export function PostsToolbar({
    status,
    sort,
    category,
    categories,
    counts,
}: {
    status: PostStatus;
    sort: PostSort;
    category: string;
    categories: { id: string; name: string }[];
    counts: { all: number; published: number; draft: number };
}) {
    const { navigate } = useListNav();

    return (
        <div className="flex flex-col gap-3 p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
            <Segmented
                ariaLabel="Yayın durumu"
                value={status}
                onChange={(value) => navigate({ status: value === "all" ? null : value, page: null })}
                items={[
                    { value: "all", label: "Tümü", icon: Files, count: counts.all },
                    { value: "published", label: "Yayında", icon: FileCheck2, count: counts.published },
                    { value: "draft", label: "Taslak", icon: FilePen, count: counts.draft },
                ]}
                className="self-start overflow-x-auto"
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <SearchField placeholder="Başlık veya adreste ara…" className="sm:w-64 xl:w-72" />
                <div className="flex gap-2">
                    <select
                        value={category}
                        onChange={(e) => navigate({ category: e.target.value || null, page: null })}
                        aria-label="Kategori"
                        className="adm-input min-w-0 flex-1 sm:w-44 sm:flex-none"
                    >
                        <option value="">Tüm kategoriler</option>
                        <option value="none">Kategorisiz</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </select>
                    <select
                        value={sort}
                        onChange={(e) => navigate({ sort: e.target.value === "new" ? null : e.target.value, page: null })}
                        aria-label="Sıralama"
                        className="adm-input min-w-0 flex-1 sm:w-44 sm:flex-none"
                    >
                        {Object.entries(POST_SORTS).map(([value, label]) => (
                            <option key={value} value={value}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
}
