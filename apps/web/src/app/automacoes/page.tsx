"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Avatar, Button, EmptyState, Input } from "@atende/ui";

interface Workflow {
  id: string;
  name: string;
  trigger: string;
  active: boolean;
  config: { hours?: number };
  actions: { type: string; title: string; dueInHours: number }[];
}

const TRIGGER_LABELS: Record<string, string> = {
  NOVO_LEAD: "Novo lead",
  SEM_RESPOSTA: "Sem resposta",
  CONVERTIDO: "Convertido",
};

export default function AutomacoesPage() {
  const [items, setItems] = useState<Workflow[]>([]);
  const [name, setName] = useState("");
  const [trigger, setTrigger] = useState("SEM_RESPOSTA");
  const [hours, setHours] = useState("24");

  async function load() {
    try {
      setItems(await api("/automations/workflows"));
    } catch {
      setItems([]);
    }
  }

  useEffect(() => {
    if (!localStorage.getItem("atende_token")) window.location.href = "/login";
    else void load();
  }, []);

  async function create() {
    if (!name.trim()) return;
    await api("/automations/workflows", {
      method: "POST",
      body: JSON.stringify({
        name,
        trigger,
        config: trigger === "SEM_RESPOSTA" ? { hours: Number(hours) || 24 } : {},
        actions: [{ type: "CRIAR_FOLLOWUP", title: `Retomar: ${name}`, dueInHours: 2 }],
      }),
    });
    setName("");
    await load();
  }

  async function toggle(w: Workflow) {
    await api(`/automations/workflows/${w.id}`, { method: "PATCH", body: JSON.stringify({ active: !w.active }) });
    await load();
  }

  return (
    <div>
      <div className="at-page-head" style={{ display: "flex", justifyContent: "space-between", alignItems: "end" }}>
        <div>
          <h1>Automações</h1>
          <p>Regras que trabalham por si.</p>
        </div>
        <Button variant="secondary" onClick={() => void api("/automations/run?trigger=SEM_RESPOSTA", { method: "POST", body: JSON.stringify({}) }).then(load)}>
          Executar “sem resposta” agora
        </Button>
      </div>
      <div className="at-card" style={{ marginBottom: 16 }}>
        <div className="at-row">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Reativar parados 24h" />
          <select className="at-input" style={{ maxWidth: 180 }} value={trigger} onChange={(e) => setTrigger(e.target.value)}>
            <option value="NOVO_LEAD">Novo lead</option>
            <option value="SEM_RESPOSTA">Sem resposta</option>
            <option value="CONVERTIDO">Convertido</option>
          </select>
          {trigger === "SEM_RESPOSTA" && (
            <input className="at-input" style={{ maxWidth: 100 }} value={hours} onChange={(e) => setHours(e.target.value)} placeholder="horas" />
          )}
          <Button variant="primary" onClick={() => void create()} disabled={!name.trim()}>Criar regra</Button>
        </div>
      </div>
      {items.length === 0 && <EmptyState title="Sem regras." hint="Crie a primeira automação acima." />}
      <div className="at-card" style={{ padding: "4px 12px" }}>
        {items.map((w) => (
          <div key={w.id} className="at-queue-row">
            <Avatar name={w.name} size={20} />
            <div className="at-queue-main">
              <div className="at-queue-top">
                <span className="at-queue-name">{w.name}</span>
                <span className="at-micro">{TRIGGER_LABELS[w.trigger] ?? w.trigger}</span>
              </div>
              <div className="at-snippet">
                {w.trigger === "SEM_RESPOSTA" ? `após ${w.config?.hours ?? 24}h parado · ` : ""}
                follow-up em {w.actions[0]?.dueInHours ?? 2}h
              </div>
            </div>
            <input type="checkbox" className="switch" checked={w.active} onChange={() => void toggle(w)} title={w.active ? "Desativar" : "Ativar"}
              style={{ position: "relative", width: 40, height: 22, appearance: "none", background: w.active ? "var(--success)" : "var(--border)", borderRadius: 999, cursor: "pointer" }} />
          </div>
        ))}
      </div>
    </div>
  );
}
