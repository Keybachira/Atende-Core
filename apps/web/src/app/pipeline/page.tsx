"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button, EmptyState, Input } from "@atende/ui";

interface Deal {
  id: string;
  title: string;
  value: number | null;
  stageId: string;
  customer: { name: string; phone: string | null } | null;
}
interface Stage {
  id: string;
  name: string;
  isWon: boolean;
  isLost: boolean;
}
interface Pipeline {
  id: string;
  name: string;
  stages: Stage[];
  deals: Deal[];
}

function fmtKz(v: number | null): string {
  if (!v) return "";
  return v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${Math.round(v / 1000)}k`;
}

export default function PipelinePage() {
  const [pipeline, setPipeline] = useState<Pipeline | null>(null);
  const [title, setTitle] = useState("");

  async function load() {
    try {
      const list: Pipeline[] = await api("/pipelines");
      if (list.length === 0) {
        setPipeline(await api("/pipelines", { method: "POST", body: JSON.stringify({ name: "Vendas" }) }));
      } else {
        setPipeline(await api(`/pipelines/${list[0].id}`));
      }
    } catch {
      setPipeline(null);
    }
  }

  useEffect(() => {
    if (!localStorage.getItem("atende_token")) window.location.href = "/login";
    else void load();
  }, []);

  async function createDeal(stageId: string) {
    if (!pipeline || !title.trim()) return;
    await api("/pipelines/deals", { method: "POST", body: JSON.stringify({ pipelineId: pipeline.id, stageId, title }) });
    setTitle("");
    await load();
  }

  async function move(dealId: string, toStageId: string) {
    await api(`/pipelines/deals/${dealId}/move`, { method: "PATCH", body: JSON.stringify({ toStageId }) });
    await load();
  }

  if (!pipeline) return <p className="at-muted">A carregar…</p>;

  return (
    <div>
      <div className="at-page-head">
        <h1>{pipeline.name}</h1>
        <p>Onde estão os negócios e qual é o próximo movimento?</p>
      </div>
      <div className="at-row" style={{ marginBottom: 16, maxWidth: 360 }}>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Novo negócio…" />
      </div>
      <div style={{ display: "grid", gridAutoFlow: "column", gridAutoColumns: "232px", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
        {pipeline.stages.map((stage) => {
          const deals = pipeline.deals.filter((d) => d.stageId === stage.id);
          return (
            <div key={stage.id}>
              <div className="at-row" style={{ marginBottom: 8 }}>
                <strong style={{ fontSize: 13 }}>{stage.name}</strong>
                <span className="at-micro">{deals.length}</span>
              </div>
              <div style={{ display: "grid", gap: 8 }}>
                {deals.map((deal) => (
                  <div key={deal.id} className="at-card" style={{ padding: 10 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{deal.title}</div>
                    <div className="at-snippet">{deal.customer ? `${deal.customer.name}` : "—"}{deal.value ? ` · ${fmtKz(deal.value)}` : ""}</div>
                    <select className="at-input" style={{ marginTop: 8, height: 32, fontSize: 13 }} value={deal.stageId}
                      onChange={(e) => void move(deal.id, e.target.value)}>
                      {pipeline.stages.map((s) => <option key={s.id} value={s.id}>→ {s.name}</option>)}
                    </select>
                  </div>
                ))}
                <button className="at-chip" style={{ justifySelf: "start" }} onClick={() => void createDeal(stage.id)} disabled={!title.trim()}>
                  + aqui
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {pipeline.deals.length === 0 && <EmptyState title="Pipeline vazio." hint="Crie o primeiro negócio acima." />}
    </div>
  );
}
