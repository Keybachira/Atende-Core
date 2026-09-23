"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Avatar, Badge, Button, EmptyState } from "@atende/ui";

interface Message {
  id: string;
  direction: string;
  body: string | null;
  createdAt: string;
}
interface Conversation {
  id: string;
  lastMessageAt: string | null;
  customer: { id: string; name: string; phone: string | null; company: string | null; origin: string | null } | null;
  messages?: { body: string | null }[];
}
interface QuickReply {
  id: string;
  key: string;
  title: string;
}

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (min < 1) return "agora";
  if (min < 60) return `${min}m`;
  if (min < 1440) return `${Math.floor(min / 60)}h`;
  return `${Math.floor(min / 1440)}d`;
}

export default function InboxPage() {
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [notes, setNotes] = useState<{ id: string; body: string; createdAt: string }[]>([]);
  const [noteDraft, setNoteDraft] = useState("");
  const [followUpDue, setFollowUpDue] = useState("");

  const open = useCallback(async (c: Conversation) => {
    setSelected(c);
    setDraft("");
    const [msgs, notes] = await Promise.all([
      api(`/conversations/${c.id}/messages`),
      c.customer ? api(`/customers/${c.customer.id}/notes`).catch(() => []) : Promise.resolve([]),
    ]);
    setMessages(msgs);
    setNotes(notes);
  }, []);

  useEffect(() => {
    if (!localStorage.getItem("atende_token")) window.location.href = "/login";
    api("/conversations").then(setConvs).catch(() => setConvs([]));
    api("/quick-replies").then(setQuickReplies).catch(() => setQuickReplies([]));
  }, []);

  async function send() {
    if (!selected || !draft.trim()) return;
    await api(`/conversations/${selected.id}/reply`, { method: "POST", body: JSON.stringify({ body: draft }) });
    await open(selected);
  }

  async function addNote() {
    if (!selected?.customer || !noteDraft.trim()) return;
    await api(`/customers/${selected.customer.id}/notes`, { method: "POST", body: JSON.stringify({ body: noteDraft }) });
    setNoteDraft("");
    await open(selected);
  }

  async function createFollowUp() {
    if (!selected?.customer || !followUpDue) return;
    await api("/follow-ups", { method: "POST", body: JSON.stringify({ customerId: selected.customer.id, dueAt: followUpDue }) });
    setFollowUpDue("");
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.target as HTMLElement).tagName === "INPUT" || (e.target as HTMLElement).tagName === "TEXTAREA") return;
      if (e.key === "j" || e.key === "J") {
        const i = convs.findIndex((c) => c.id === selected?.id);
        if (convs[i + 1]) void open(convs[i + 1]);
      }
      if (e.key === "k" || e.key === "K") {
        const i = convs.findIndex((c) => c.id === selected?.id);
        if (i > 0) void open(convs[i - 1]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [convs, selected, open]);

  return (
    <div className="at-inbox">
      <div className="at-conv-list">
        {convs.length === 0 && <EmptyState title="Tudo limpo." hint="Não existem conversas." />}
        {convs.map((c) => (
          <div key={c.id} className={`at-conv ${selected?.id === c.id ? "selected" : ""}`} onClick={() => void open(c)}>
            <Avatar name={c.customer?.name ?? "?"} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div className="at-queue-top">
                <span className="at-queue-name">{c.customer?.name ?? "—"}</span>
                <span className="at-queue-time">{timeAgo(c.lastMessageAt)}</span>
              </div>
              <div className="at-snippet">{c.messages?.[0]?.body ?? c.customer?.phone}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="at-thread">
        {!selected && <EmptyState title="Selecione uma conversa." hint="Use J e K para navegar." />}
        {selected && (
          <>
            <div className="at-thread-head">
              <div className="at-row" style={{ justifyContent: "space-between" }}>
                <div>
                  <strong>{selected.customer?.name}</strong>
                  <div className="at-muted">{selected.customer?.phone}</div>
                </div>
                <Button variant="secondary" onClick={() => (window.location.href = "/")}>Atribuir</Button>
              </div>
            </div>
            <div className="at-thread-body">
              {messages.map((m) => (
                <div key={m.id}>
                  <div className={`at-bubble ${m.direction === "OUT" ? "out" : ""}`}>{m.body}</div>
                  <div className="at-bubble-time" style={m.direction === "OUT" ? { textAlign: "right" } : undefined}>
                    {new Date(m.createdAt).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              ))}
            </div>
            <div className="at-composer">
              <textarea rows={2} placeholder="Escrever mensagem…" value={draft} onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void send(); }} />
              <div className="at-composer-bar">
                <select className="at-input" defaultValue="" style={{ maxWidth: 200 }}
                  onChange={async (e) => {
                    if (!e.target.value) return;
                    const r: { body: string } = await api(`/quick-replies/${e.target.value}/render`, { method: "POST", body: JSON.stringify({ cliente: selected.customer?.name }) });
                    setDraft(r.body);
                  }}>
                  <option value="">/ resposta rápida</option>
                  {quickReplies.map((q) => <option key={q.id} value={q.id}>/{q.key}</option>)}
                </select>
                <span style={{ flex: 1 }} />
                <Button variant="primary" onClick={() => void send()} disabled={!draft.trim()}>Enviar</Button>
              </div>
            </div>
          </>
        )}
      </div>

      <aside className="at-context">
        {!selected && <p className="at-muted">Contexto do cliente aparece aqui.</p>}
        {selected?.customer && (
          <>
            <section>
              <h3>Cliente</h3>
              <dl>
                <div className="at-kv"><dt>Telefone</dt><dd>{selected.customer.phone ?? "—"}</dd></div>
                <div className="at-kv"><dt>Empresa</dt><dd>{selected.customer.company ?? "—"}</dd></div>
                <div className="at-kv"><dt>Origem</dt><dd>{selected.customer.origin ?? "—"}</dd></div>
              </dl>
            </section>
            <section>
              <h3>Nota rápida</h3>
              <div className="at-row">
                <input className="at-input" placeholder="Adicionar nota…" value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} />
                <Button variant="secondary" onClick={() => void addNote()}>Guardar</Button>
              </div>
              {notes.slice(0, 3).map((n) => <p key={n.id} className="at-muted">· {n.body}</p>)}
            </section>
            <section>
              <h3>Follow-up</h3>
              <div className="at-row">
                <input className="at-input" type="datetime-local" value={followUpDue} onChange={(e) => setFollowUpDue(e.target.value)} />
                <Button variant="secondary" onClick={() => void createFollowUp()}>Criar</Button>
              </div>
            </section>
          </>
        )}
      </aside>
    </div>
  );
}
