"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@atende/ui";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@demo.test");
  const [password, setPassword] = useState("atende123");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
    const res = await fetch(`${base}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, organizationId: "00000000-0000-0000-0000-000000000001" }),
    });
    if (!res.ok) {
      setError("Não foi possível entrar. Verifique os dados.");
      return;
    }
    const data = await res.json();
    localStorage.setItem("atende_token", data.access_token);
    router.push("/");
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: "15vh" }}>
      <div className="at-card" style={{ width: 360 }}>
        <h2>Atende Core</h2>
        <p className="at-muted">Entre para operar.</p>
        <form onSubmit={submit} style={{ display: "grid", gap: 12, marginTop: 16 }}>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" />
          <Button variant="primary" type="submit">Entrar</Button>
          {error && <span className="at-muted">{error}</span>}
        </form>
      </div>
    </div>
  );
}
