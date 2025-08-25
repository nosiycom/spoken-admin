import { clsx } from "clsx";
import type React from "react";

export function TemplateButton({
  className,
  type = "button",
  variant = "primary",
  ...props
}: React.ComponentProps<"button"> & {
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      type={type}
      className={clsx(
        "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "primary" && "bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg",
        variant === "secondary" && "bg-white text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600 dark:hover:bg-slate-700",
        className
      )}
      {...props}
    />
  );
}