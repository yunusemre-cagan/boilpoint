"use client";

import React, { useRef, useState, useEffect } from "react";
import Image from "next/image";
import Zoom from "react-medium-image-zoom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "react-medium-image-zoom/dist/styles.css";

interface GalleryProps {
    images: string[];
}

export function Gallery({ images }: GalleryProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) return null;

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollAmount = container.clientWidth;
            container.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth"
            });
        }
    };

    const handleScroll = () => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const index = Math.round(container.scrollLeft / container.clientWidth);
            setCurrentIndex(index);
        }
    };

    const scrollToIndex = (index: number) => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            container.scrollTo({
                left: index * container.clientWidth,
                behavior: "smooth"
            });
            setCurrentIndex(index);
        }
    };

    return (
        <div className="relative group my-8 w-full flex flex-col gap-4">
            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>

            {/* Main Image Container */}
            <div className="relative w-full overflow-hidden rounded-[2rem] glass shadow-xl bg-muted/20">
                {/* Navigasyon Butonları */}
                {images.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={() => scroll("left")}
                            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/80 dark:bg-black/60 text-foreground backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white dark:hover:bg-black hover:scale-110 disabled:opacity-0 disabled:cursor-not-allowed shadow-lg"
                            disabled={currentIndex === 0}
                            aria-label="Önceki görsel"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            type="button"
                            onClick={() => scroll("right")}
                            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/80 dark:bg-black/60 text-foreground backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all hover:bg-white dark:hover:bg-black hover:scale-110 disabled:opacity-0 disabled:cursor-not-allowed shadow-lg"
                            disabled={currentIndex === images.length - 1}
                            aria-label="Sonraki görsel"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </>
                )}

                {/* Resim Sayacı (Örn: 1/4) */}
                {images.length > 1 && (
                    <div className="absolute top-6 right-6 z-10 px-4 py-1.5 rounded-full bg-white/80 dark:bg-black/60 text-foreground text-sm font-bold backdrop-blur-md shadow-md">
                        {currentIndex + 1} / {images.length}
                    </div>
                )}

                {/* Scroll Container */}
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
                >
                    {images.map((src, idx) => (
                        <div key={idx} className="w-full shrink-0 snap-center flex items-center justify-center p-4">
                            <Zoom>
                                <div className="relative w-full overflow-hidden rounded-2xl bg-black/5 flex items-center justify-center">
                                    <Image
                                        src={src}
                                        alt={`Görsel ${idx + 1}`}
                                        width={1200}
                                        height={800}
                                        className="object-contain w-full h-auto max-h-[70vh] rounded-2xl hover:scale-[1.02] transition-transform duration-700"
                                    />
                                </div>
                            </Zoom>
                        </div>
                    ))}
                </div>
            </div>

            {/* Küçük Resimler (Thumbnails) */}
            {images.length > 1 && (
                <div className="flex items-center justify-center gap-3 overflow-x-auto py-4 hide-scrollbar w-full" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {images.map((src, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => scrollToIndex(idx)}
                            className={`relative w-24 h-24 shrink-0 rounded-2xl overflow-hidden border-2 transition-all bg-black/5 dark:bg-white/5 flex items-center justify-center ${idx === currentIndex ? 'border-accent scale-105 shadow-md ring-2 ring-accent/20' : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'}`}
                        >
                            <img src={src} alt={`Önizleme ${idx + 1}`} className="w-full h-full object-contain p-2" />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
