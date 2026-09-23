"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button, EmptyState, Input } from "@atende/ui";

export default function ConfiguracoesPage() {
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("atende_token")) window.location.href = "/login";
    api("/organizations/current").then((o) => setName(o.name)).catch(() => null);
  }, []);

  async function save() {
    if (!name.trim()) return;
    await api("/organizations/current", { method: "PATCH", body: JSON.stringify({ name }) });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <div className="at-page-head">
        <h1>Configurações</h1>
        <p>Dados da empresa.</p>
      </div>
      <div className="at-card">
        <div style={{ display: "grid", gap: 12 }}>
          <label className="at-field">
            <span className="at-label">Nome da empresa</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <div className="at-row">
            <Button variant="primary" onClick={() => void save()}>Guardar</Button>
            {saved && <span className="at-muted">✓ Guardado</span>}
          </div>
        </div>
      </div>
      {!name && <EmptyState title="Sem acesso." hint="Apenas ADMIN e gestores veem esta página." />}
    </div>
  );
}
