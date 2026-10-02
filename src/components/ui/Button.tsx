import type { ButtonHTMLAttributes } from "react";
export function Button({
  className = "",
  variant = "primary",
  ...props
}: {
  variant?: "primary" | "dark" | "soft" | "danger";
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const v = {
    primary:
      "bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg shadow-orange-200 hover:brightness-105",
    dark: "bg-slate-900 text-white hover:bg-orange-600",
    soft: "bg-orange-50 text-orange-700 hover:bg-orange-100",
    danger: "bg-red-50 text-red-700 hover:bg-red-100",
  }[variant];
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-extrabold transition disabled:cursor-not-allowed disabled:opacity-50 ${v} ${className}`}
      {...props}
    />
  );
}
