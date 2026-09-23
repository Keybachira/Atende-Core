import React from "react";

// Nota: importar "@atende/ui/src/tokens.css" e "@atende/ui/src/primitives.css"
// no CSS global da app (o dist JS não empacota CSS).

type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";

export function Button({
  variant = "secondary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return <button className={`at-btn at-btn-${variant}`} {...props} />;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="at-input" {...props} />;
}

export function Badge({ tone = "neutral", children }: { tone?: "neutral" | "alta" | "critica" | "ok"; children: React.ReactNode }) {
  return <span className={`at-badge at-badge-${tone}`}>{children}</span>;
}

export function Avatar({ name, size = 28, color }: { name: string; size?: 20 | 28 | 32 | 40 | 48; color?: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  let hue = 210;
  if (!color) {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
    hue = h;
  }
  const bg = color ?? `hsl(${hue} 70% 92%)`;
  const fg = color ? "#fff" : `hsl(${hue} 60% 32%)`;
  return (
    <span className="at-avatar" style={{ width: size, height: size, fontSize: size <= 20 ? 10 : 12, background: bg, color: fg, borderColor: "transparent" }} aria-label={name} title={name}>
      {initials}
    </span>
  );
}

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: React.ReactNode }) {
  return (
    <div className="at-empty">
      <p className="at-empty-title">{title}</p>
      {hint && <p className="at-empty-hint">{hint}</p>}
      {action}
    </div>
  );
}

export function Skeleton({ width = "100%", height = 12 }: { width?: string | number; height?: string | number }) {
  return <div className="at-skeleton" style={{ width, height }} />;
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="at-field">
      <span className="at-label">{label}</span>
      {children}
    </label>
  );
}
