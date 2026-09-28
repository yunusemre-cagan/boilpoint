"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { thumbUrl } from "./thumb-url";

/** Yüklenemezse sessizce bir simgeye dönen küçük görsel. */
export function Thumb({
    src,
    alt = "",
    width,
    height,
    className,
    imgClassName,
    fallback,
}: {
    src: string | null | undefined;
    alt?: string;
    /** Cloudinary dönüşümü için piksel boyutu (2x ekranlar için iki katı verin) */
    width: number;
    height: number;
    className?: string;
    imgClassName?: string;
    fallback?: React.ReactNode;
}) {
    const [failed, setFailed] = useState(false);
    return (
        <span className={cn("relative block overflow-hidden bg-[var(--adm-surface-3)]", className)}>
            {src && !failed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={thumbUrl(src, width, height)}
                    alt={alt}
                    loading="lazy"
                    decoding="async"
                    onError={() => setFailed(true)}
                    className={cn("h-full w-full object-cover", imgClassName)}
                />
            ) : (
                <span className="absolute inset-0 flex items-center justify-center adm-text-3">{fallback ?? <ImageOff className="h-4 w-4" />}</span>
            )}
        </span>
    );
}
