"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Gallery } from "@/components/Gallery";

/** <Gallery images="a,b" /> ve <Gallery images={["a","b"]} /> söz dizimlerini önizlenebilir hale getirir. */
function prepare(content: string) {
    return content
        .replace(/<Gallery\s+images=\{\[([\s\S]*?)\]\}\s*\/>/g, (_match: string, urls: string) => {
            const list = urls.split(",").map((u: string) => u.trim().replace(/["']/g, ""));
            return `<div data-gallery-mock="${list.join(",")}"></div>`;
        })
        .replace(/<Gallery\s+images="([^"]*)"\s*\/>/g, (_match: string, urls: string) => `<div data-gallery-mock="${urls}"></div>`);
}

/** Editördeki Markdown/MDX içeriğinin sitedekine yakın önizlemesi. */
export function MarkdownPreview({ content, empty = "*Henüz içerik girilmedi…*" }: { content: string; empty?: string }) {
    return (
        <div className="prose prose-zinc max-w-none dark:prose-invert prose-headings:tracking-tight prose-a:text-[var(--adm-accent-text)] prose-img:rounded-2xl">
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw]}
                components={
                    {
                        div: (props: Record<string, unknown>) => {
                            if (typeof props["data-gallery-mock"] === "string") {
                                return <Gallery images={(props["data-gallery-mock"] as string).split(",")} />;
                            }
                            return <div {...(props as React.HTMLAttributes<HTMLDivElement>)} />;
                        },
                        img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
                            const width = props.width ? String(props.width) : "100%";
                            const widthStyle = /^\d+$/.test(width) ? `${width}px` : width;
                            return (
                                <span className="my-8 flex w-full justify-center">
                                    <span style={{ width: widthStyle, maxWidth: "100%" }} className="block overflow-hidden rounded-2xl shadow-lg">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={typeof props.src === "string" ? props.src : ""} alt={props.alt || "Görsel"} className="m-0 h-auto w-full object-cover" />
                                    </span>
                                </span>
                            );
                        },
                    } as never
                }
            >
                {content ? prepare(content) : empty}
            </ReactMarkdown>
        </div>
    );
}
