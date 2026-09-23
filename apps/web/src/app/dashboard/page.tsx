"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Badge, EmptyState } from "@atende/ui";

interface Dashboard {
  stats: {
    novosLeads: number;
    emAtendimento: number;
    naFila: number;
    followUpsPendentes: number;
    conversoes: number;
    valorConvertido: number;
    tempoMedioPrimeiraRespostaMin: number | null;
  };
  porOrigem: { origem: string; total: number }[];
  filaTop: { id: string; nome: string; score: number; level: string }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<Dashboard | null>(null);

  useEffect(() => {
    if (!localStorage.getItem("atende_token")) window.location.href = "/login";
    api("/reports/dashboard").then(setData).catch(() => setData(null));
  }, []);

  if (!data) return <p className="at-muted">A carregar…</p>;
  const s = data.stats;
  const maxOrigem = Math.max(1, ...data.porOrigem.map((o) => o.total));
  const needsAttention = s.naFila + s.followUpsPendentes;

  return (
    <div>
      <div className="at-page-head">
        <h1>Hoje</h1>
        <p>Como a operação está funcionando?</p>
      </div>

      <div className="at-stats">
        <div><div className="at-stat-num">{s.emAtendimento}</div><div className="at-stat-label">Conversas</div></div>
        <div><div className="at-stat-num">{s.tempoMedioPrimeiraRespostaMin === null ? "—" : `${s.tempoMedioPrimeiraRespostaMin}m`}</div><div className="at-stat-label">Tempo médio</div></div>
        <div><div className="at-stat-num">{s.naFila}</div><div className="at-stat-label">Pendentes</div></div>
        <div><div className="at-stat-num">{s.conversoes}</div><div className="at-stat-label">Conversões</div></div>
      </div>

      <div className="at-grid-2">
        <div className="at-card">
          <strong>Atividade por origem</strong>
          {data.porOrigem.map((o) => (
            <div key={o.origem} className="bar-row" style={{ display: "grid", gridTemplateColumns: "120px 1fr 40px", gap: 8, alignItems: "center", margin: "8px 0", fontSize: 13 }}>
              <span>{o.origem}</span>
              <div style={{ background: "var(--surface-subtle)", borderRadius: 999, height: 8 }}>
                <div style={{ width: `${Math.round((o.total / maxOrigem) * 100)}%`, background: "var(--accent)", height: 8, borderRadius: 999 }} />
              </div>
              <span className="at-muted">{o.total}</span>
            </div>
          ))}
        </div>
        <div className="at-card">
          <strong>Precisa de atenção</strong>
          {needsAttention === 0 && <EmptyState title="Tudo sob controle." hint="Nada pendente neste momento." />}
          {s.naFila > 0 && <p className="at-muted">{s.naFila} conversa(s) sem resposta</p>}
          {s.followUpsPendentes > 0 && <p className="at-muted">{s.followUpsPendentes} follow-up(s) em aberto</p>}
          {data.filaTop.slice(0, 3).map((q) => (
            <div key={q.id} className="at-row" style={{ justifyContent: "space-between", padding: "6px 0" }}>
              <span>{q.nome}</span>
              <Badge tone={q.level === "CRITICA" ? "critica" : q.level === "ALTA" ? "alta" : "neutral"}>{q.level}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
