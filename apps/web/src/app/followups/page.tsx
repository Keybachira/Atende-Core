"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button, EmptyState, Input } from "@atende/ui";

interface FollowUp {
  id: string;
  title: string;
  reason: string | null;
  dueAt: string;
  customer: { name: string } | null;
}

export default function FollowUpsPage() {
  const [items, setItems] = useState<FollowUp[]>([]);
  const [title, setTitle] = useState("");
  const [dueAt, setDueAt] = useState("");

  async function load() {
    try {
      setItems(await api("/follow-ups/pending"));
    } catch {
      setItems([]);
    }
  }

  useEffect(() => {
    if (!localStorage.getItem("atende_token")) window.location.href = "/login";
    else void load();
  }, []);

  async function create() {
    if (!dueAt) return;
    await api("/follow-ups", { method: "POST", body: JSON.stringify({ title: title || "Follow-up", dueAt }) });
    setTitle("");
    setDueAt("");
    await load();
  }

  async function complete(id: string) {
    await api(`/follow-ups/${id}/complete`, { method: "PATCH" });
    await load();
  }

  return (
    <div>
      <div className="at-page-head">
        <h1>Follow-ups</h1>
        <p>O que ficou pendente?</p>
      </div>
      <div className="at-card" style={{ marginBottom: 16 }}>
        <div className="at-row">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex: Ligar para confirmar entrega" />
          <input className="at-input" type="datetime-local" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
          <Button variant="primary" onClick={() => void create()} disabled={!dueAt}>Criar follow-up</Button>
        </div>
      </div>
      <div className="at-card" style={{ padding: "4px 12px" }}>
        {items.length === 0 && (
          <EmptyState title="Tudo limpo." hint="Não existem follow-ups para hoje." />
        )}
        {items.map((f) => (
          <div key={f.id} className="at-queue-row">
            <div className="at-queue-main">
              <div className="at-queue-top">
                <span className="at-queue-name">{f.title}</span>
                <span className="at-queue-time">{new Date(f.dueAt).toLocaleString("pt-PT", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
              </div>
              <div className="at-snippet">{f.customer?.name ?? ""}{f.reason ? ` · ${f.reason}` : ""}</div>
            </div>
            <Button variant="secondary" onClick={() => void complete(f.id)}>Concluir</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
