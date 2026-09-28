import Link from "next/link";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "soft" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

type Common = {
    variant?: ButtonVariant;
    size?: ButtonSize;
    /** Yalnızca ikon içeren kare düğme */
    iconOnly?: boolean;
    className?: string;
};

export function buttonClass({ variant = "secondary", size = "md", iconOnly, className }: Common = {}) {
    return cn(
        "adm-btn",
        `adm-btn-${variant}`,
        size !== "md" && `adm-btn-${size}`,
        iconOnly && "adm-btn-icon",
        className,
    );
}

type ButtonProps = Common & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
    { variant, size, iconOnly, className, type = "button", ...props },
    ref,
) {
    return <button ref={ref} type={type} className={buttonClass({ variant, size, iconOnly, className })} {...props} />;
});

type LinkProps = Common & Omit<React.ComponentProps<typeof Link>, "className">;

export function ButtonLink({ variant, size, iconOnly, className, ...props }: LinkProps) {
    return <Link className={buttonClass({ variant, size, iconOnly, className })} {...props} />;
}

type AnchorProps = Common & React.AnchorHTMLAttributes<HTMLAnchorElement>;

/** Siteyi yeni sekmede açan bağlantılar gibi harici adresler için. */
export function ButtonAnchor({ variant, size, iconOnly, className, ...props }: AnchorProps) {
    return <a className={buttonClass({ variant, size, iconOnly, className })} {...props} />;
}
