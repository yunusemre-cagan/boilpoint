import { initialsOf } from "../shell/UserAvatar";

const TONES = [
    "bg-indigo-500/10 text-indigo-600 dark:text-indigo-300",
    "bg-sky-500/10 text-sky-600 dark:text-sky-300",
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    "bg-amber-500/10 text-amber-700 dark:text-amber-300",
    "bg-rose-500/10 text-rose-600 dark:text-rose-300",
    "bg-violet-500/10 text-violet-600 dark:text-violet-300",
];

/** Ziyaretçi avatarı: sağlayıcı görseli varsa o, yoksa isme göre renklenen baş harfler. */
export function VisitorAvatar({ name, src }: { name: string; src?: string | null }) {
    if (src) {
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={src} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-[var(--adm-surface)]" />;
    }
    const tone = TONES[[...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0) % TONES.length];
    return (
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${tone}`} aria-hidden>
            {initialsOf(name)}
        </span>
    );
}
