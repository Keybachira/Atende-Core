"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { Avatar, Badge, Button, EmptyState, Input, Skeleton } from "@atende/ui";

interface QueueItem {
  id: string;
  score: number;
  level: string;
  reasons: { label: string; points: number }[];
  status: string;
  assignedToId: string | null;
  assignedToName: string | null;
  conversation: {
    id: string;
    lastMessageAt: string | null;
    customer: { id: string; name: string; phone: string | null } | null;
    messages?: { body: string | null }[];
  };
}

interface ThreadMessage {
  id: string;
  direction: string;
  body: string | null;
  createdAt: string;
}

interface CustomerFull {
  id: string;
  name: string;
  phone: string | null;
  tags: { tag: { id: string; name: string } }[];
}

type Tab = "todas" | "minhas" | "alta" | "sem-responsavel";
type Sort = "antigos" | "recentes" | "prioridade";

function waitingMinutes(iso: string | null): number {
  if (!iso) return 0;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
}

function fmtWait(min: number): string {
  if (min < 1) return "agora";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} h` : `${h} h ${m} min`;
}

function tone(level: string): "critica" | "alta" | "neutral" {
  return level === "CRITICA" ? "critica" : level === "ALTA" ? "alta" : "neutral";
}

export default function FilaPage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("todas");
  const [sort, setSort] = useState<Sort>("antigos");
  const [search, setSearch] = useState("");
  const [me, setMe] = useState<{ id: string } | null>(null);
  const [selected, setSelected] = useState<QueueItem | null>(null);
  const [thread, setThread] = useState<ThreadMessage[]>([]);
  const [customer, setCustomer] = useState<CustomerFull | null>(null);
  const [draft, setDraft] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newName, setNewName] = useState("");

  async function load(recalc = false) {
    setLoading(true);
    try {
      if (recalc) await api("/queue/recalculate", { method: "POST" });
      const [q, m] = await Promise.all([api("/queue"), api("/auth/me").catch(() => null)]);
      setItems(q);
      setMe(m);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!localStorage.getItem("atende_token")) window.location.href = "/login";
    else void load();
  }, []);

  async function open(item: QueueItem) {
    setSelected(item);
    setDraft("");
    const [msgs, cust] = await Promise.all([
      api(`/conversations/${item.conversation.id}/messages`),
      item.conversation.customer ? api(`/customers/${item.conversation.customer.id}`).catch(() => null) : Promise.resolve(null),
    ]);
    setThread(msgs);
    setCustomer(cust);
  }

  async function send() {
    if (!selected || !draft.trim()) return;
    await api(`/conversations/${selected.conversation.id}/reply`, { method: "POST", body: JSON.stringify({ body: draft }) });
    await open(selected);
    await load();
  }

  async function createConversation() {
    if (!newPhone.trim()) return;
    await api("/conversations", { method: "POST", body: JSON.stringify({ phone: newPhone, name: newName || newPhone }) });
    setShowNew(false);
    setNewPhone("");
    setNewName("");
    await load(true);
  }

  const counts = useMemo(() => ({
    todas: items.length,
    minhas: items.filter((i) => me && i.assignedToId === me.id).length,
    alta: items.filter((i) => i.level === "ALTA" || i.level === "CRITICA").length,
    semResponsavel: items.filter((i) => !i.assignedToId).length,
  }), [items, me]);

  const visible = useMemo(() => {
    let list = items.filter((i) => {
      if (tab === "minhas" && (!me || i.assignedToId !== me.id)) return false;
      if (tab === "alta" && i.level !== "ALTA" && i.level !== "CRITICA") return false;
      if (tab === "sem-responsavel" && i.assignedToId) return false;
      if (search) {
        const hay = `${i.conversation.customer?.name ?? ""} ${i.conversation.customer?.phone ?? ""}`.toLowerCase();
        if (!hay.includes(search.toLowerCase())) return false;
      }
      return true;
    });
    list = [...list].sort((a, b) => {
      const wa = waitingMinutes(a.conversation.lastMessageAt);
      const wb = waitingMinutes(b.conversation.lastMessageAt);
      if (sort === "recentes") return wa - wb;
      if (sort === "prioridade") return b.score - a.score;
      return wb - wa;
    });
    return list;
  }, [items, tab, sort, search, me]);

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "todas", label: "Todas", count: counts.todas },
    { id: "minhas", label: "Minhas", count: counts.minhas },
    { id: "alta", label: "Alta", count: counts.alta },
    { id: "sem-responsavel", label: "Sem responsável", count: counts.semResponsavel },
  ];

  return (
    <div className="at-row" style={{ alignItems: "flex-start", gap: 16 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="at-row" style={{ justifyContent: "space-between", marginBottom: 4 }}>
          <div>
            <h1>Fila</h1>
            <p className="at-muted" style={{ margin: "2px 0 0" }}>Quem precisa de atenção agora?</p>
          </div>
          <div className="at-row">
            <input className="at-input" style={{ width: 260 }} placeholder="Buscar conversa ou cliente" value={search} onChange={(e) => setSearch(e.target.value)} />
            <Button variant="primary" onClick={() => setShowNew(true)}>+ Nova conversa</Button>
          </div>
        </div>

        <div className="at-row" style={{ justifyContent: "space-between", margin: "12px 0" }}>
          <div className="at-row">
            {tabs.map((t) => (
              <button key={t.id} className={`at-chip ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
                {t.label} <span className="at-micro">{t.count}</span>
              </button>
            ))}
          </div>
          <select className="at-input" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
            <option value="antigos">Mais antigos primeiro</option>
            <option value="recentes">Mais recentes primeiro</option>
            <option value="prioridade">Prioridade</option>
          </select>
        </div>

        <div className="at-card" style={{ padding: "4px 12px" }}>
          <div className="at-queue-head">
            <span>Cliente / Última mensagem</span>
            <span>Tempo</span>
            <span>Prioridade</span>
            <span>Responsável</span>
            <span />
          </div>
          {loading && <><Skeleton height={56} /><Skeleton height={56} /><Skeleton height={56} /></>}
          {!loading && visible.length === 0 && (
            <EmptyState title="Tudo limpo." hint="Não existem conversas aguardando atenção." />
          )}
          {visible.map((item) => {
            const name = item.conversation.customer?.name ?? "—";
            const snippet = item.conversation.messages?.[0]?.body ?? "";
            const wait = waitingMinutes(item.conversation.lastMessageAt);
            return (
              <div key={item.id} className={`at-queue-tr ${selected?.id === item.id ? "selected" : ""}`} onClick={() => void open(item)}>
                <div className="at-row">
                  <Avatar name={name} size={32} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>{name}</div>
                    <div className="at-micro">{item.conversation.customer?.phone}</div>
                    <div className="at-snippet">“{snippet}”</div>
                  </div>
                </div>
                <div><div style={{ fontWeight: 600 }}>{fmtWait(wait)}</div><div className="at-micro">aguardando</div></div>
                <div><Badge tone={tone(item.level)}>{item.level}</Badge></div>
                <div className="at-muted">{item.assignedToName ?? "Sem responsável"}</div>
                <div className="at-micro">›</div>
              </div>
            );
          })}
        </div>
      </div>

      {selected && (
        <aside className="at-card" style={{ width: 360, flexShrink: 0, maxHeight: "calc(100vh - 140px)", overflowY: "auto" }}>
          <div className="at-row" style={{ justifyContent: "space-between" }}>
            <div className="at-row">
              <Avatar name={selected.conversation.customer?.name ?? "?"} size={32} />
              <div>
                <div style={{ fontWeight: 600 }}>{selected.conversation.customer?.name}</div>
                <div className="at-micro">{selected.conversation.customer?.phone}</div>
              </div>
            </div>
            <Badge tone={tone(selected.level)}>{selected.level}</Badge>
          </div>
          <div style={{ margin: "12px 0" }}>
            {thread.map((m) => (
              <div key={m.id} className={`at-bubble ${m.direction === "OUT" ? "out" : ""}`}>{m.body}</div>
            ))}
          </div>
          <section>
            <h3 className="at-nav-group" style={{ padding: "0 0 4px" }}>Contexto do cliente</h3>
            <div className="at-kv"><dt>Responsável</dt><dd>{selected.assignedToName ?? "Sem responsável"}</dd></div>
            <div className="at-kv"><dt>Tags</dt><dd>{customer && customer.tags.length > 0 ? customer.tags.map((t) => t.tag.name).join(", ") : "—"}</dd></div>
          </section>
          <div className="at-row" style={{ marginTop: 12 }}>
            <input className="at-input" placeholder="Escrever mensagem…" value={draft} onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void send(); }} />
            <Button variant="primary" onClick={() => void send()} disabled={!draft.trim()}>Enviar</Button>
          </div>
        </aside>
      )}

      {showNew && (
        <div className="at-cmd-overlay" onClick={() => setShowNew(false)}>
          <div className="at-cmd" style={{ padding: 16 }} onClick={(e) => e.stopPropagation()}>
            <h2>Nova conversa</h2>
            <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
              <input className="at-input" placeholder="Telefone (+244…)" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
              <input className="at-input" placeholder="Nome (opcional)" value={newName} onChange={(e) => setNewName(e.target.value)} />
              <div className="at-row" style={{ justifyContent: "flex-end" }}>
                <Button variant="ghost" onClick={() => setShowNew(false)}>Cancelar</Button>
                <Button variant="primary" onClick={() => void createConversation()} disabled={!newPhone.trim()}>Criar</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
