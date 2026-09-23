"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import "./globals.css";

const NAV: ({ group: string } | { href: string; label: string; badge?: string })[] = [
  { group: "Principal" },
  { href: "/", label: "Fila" },
  { href: "/inbox", label: "Inbox", badge: "inbox" },
  { href: "/pipeline", label: "Pipeline" },
  { href: "/followups", label: "Follow-ups" },
  { group: "Gestão" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/automacoes", label: "Automações" },
  { group: "Sistema" },
  { href: "/configuracoes", label: "Configurações" },
];

function Icon({ d }: { d: string }) {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  );
}

const ICONS: Record<string, string> = {
  "/": "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  "/inbox": "M22 12h-6l-2 3h-4l-2-3H2M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z",
  "/pipeline": "M3 3v18h18M7 15l4-6 4 3 5-8",
  "/followups": "M12 6v6l4 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  "/dashboard": "M3 3v18h18M8 17V9m5 8V5m5 12v-6",
  "/automacoes": "M13 2 3 14h9l-1 8 10-12h-9l1-8",
  "/configuracoes": "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z",
};

const ACTIONS = [
  { label: "Ir para Fila", href: "/" },
  { label: "Ir para Inbox", href: "/inbox" },
  { label: "Ir para Pipeline", href: "/pipeline" },
  { label: "Ir para Follow-ups", href: "/followups" },
  { label: "Ir para Dashboard", href: "/dashboard" },
  { label: "Criar follow-up", href: "/followups" },
];

function CommandPalette({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const items = ACTIONS.filter((a) => a.label.toLowerCase().includes(q.toLowerCase()));

  function go(href: string) {
    onClose();
    router.push(href);
  }

  return (
    <div className="at-cmd-overlay" onClick={onClose}>
      <div className="at-cmd" onClick={(e) => e.stopPropagation()}>
        <input autoFocus placeholder="Escreva uma ação…" value={q} onChange={(e) => { setQ(e.target.value); setSel(0); }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") setSel((s) => Math.min(s + 1, items.length - 1));
            if (e.key === "ArrowUp") setSel((s) => Math.max(s - 1, 0));
            if (e.key === "Enter" && items[sel]) go(items[sel].href);
            if (e.key === "Escape") onClose();
          }} />
        {items.map((a, i) => (
          <button key={a.label} className={`at-cmd-item ${i === sel ? "selected" : ""}`} onClick={() => go(a.href)}>
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [cmd, setCmd] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [inboxCount, setInboxCount] = useState<number | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const onKey = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      setCmd((c) => !c);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onKey]);

  useEffect(() => {
    if (pathname === "/login" || !localStorage.getItem("atende_token")) return;
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
    const token = localStorage.getItem("atende_token");
    fetch(`${base}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : null))
      .then(setUser)
      .catch(() => null);
    fetch(`${base}/conversations`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : []))
      .then((c) => setInboxCount(Array.isArray(c) ? c.length : null))
      .catch(() => null);
  }, [pathname]);

  if (pathname === "/login") return <html lang="pt"><body>{children}</body></html>;

  return (
    <html lang="pt">
      <body>
        <header className="at-topbar">
          <span className="at-brand">▲ Atende Core</span>
          <button className="at-search" ref={btnRef} onClick={() => setCmd(true)}>
            Buscar ou executar… <kbd>⌘K</kbd>
          </button>
          <button className="at-chip" onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))} title="Alternar tema">
            {theme === "light" ? "Escuro" : "Claro"}
          </button>
        </header>
        <div className="at-shell">
          <nav className="at-sidebar">
            {NAV.map((item, i) =>
              "group" in item ? (
                <div key={i} className="at-nav-group">{item.group}</div>
              ) : (
                <Link key={item.href} href={item.href!} className={`at-nav-item ${pathname === item.href ? "active" : ""}`}>
                  <Icon d={ICONS[item.href!] ?? ""} />
                  {item.label}
                  {item.badge === "inbox" && inboxCount !== null && inboxCount > 0 && (
                    <span className="at-micro" style={{ marginLeft: "auto" }}>{inboxCount}</span>
                  )}
                </Link>
              ),
            )}
            <div style={{ marginTop: "auto", borderTop: "1px solid var(--border)", paddingTop: 8 }}>
              <div className="at-row" style={{ padding: "6px 12px" }}>
                <span className="at-avatar" style={{ width: 28, height: 28, fontSize: 12 }}>
                  {(user?.name ?? "?").split(" ").map((p) => p[0]).slice(0, 2).join("")}
                </span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{user?.name ?? "…"}</span>
              </div>
            </div>
          </nav>
          <main className="at-main">{children}</main>
        </div>
        {cmd && <CommandPalette onClose={() => setCmd(false)} />}
      </body>
    </html>
  );
}
