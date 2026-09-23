import "dotenv/config";
import * as bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("atende123", 12);
  const org = await prisma.organization.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    create: { id: "00000000-0000-0000-0000-000000000001", name: "Empresa Demo" },
    update: {},
  });
  await prisma.user.upsert({
    where: { organizationId_email: { organizationId: org.id, email: "admin@demo.test" } },
    create: { organizationId: org.id, name: "Admin Demo", email: "admin@demo.test", passwordHash, role: "ADMIN" },
    update: { passwordHash, role: "ADMIN", active: true },
  });
  await prisma.team.upsert({
    where: { id: "00000000-0000-0000-0000-000000000002" },
    create: { id: "00000000-0000-0000-0000-000000000002", organizationId: org.id, name: "Comercial" },
    update: {},
  });

  // Pipeline padrão
  let pipeline = await prisma.pipeline.findFirst({ where: { organizationId: org.id, name: "Vendas" } });
  pipeline ??= await prisma.pipeline.create({ data: { organizationId: org.id, name: "Vendas" } });
  const stageCount = await prisma.stage.count({ where: { pipelineId: pipeline.id } });
  if (stageCount === 0) {
    const stages = ["NOVO", "EM ATENDIMENTO", "QUALIFICADO", "PROPOSTA", "NEGOCIAÇÃO", "CONVERTIDO", "SEM RESPOSTA", "ADIADO", "PERDIDO"];
    await prisma.stage.createMany({
      data: stages.map((name, position) => ({
        organizationId: org.id,
        pipelineId: pipeline.id,
        name,
        position,
        isWon: name === "CONVERTIDO",
        isLost: name === "SEM RESPOSTA" || name === "PERDIDO",
      })),
    });
  }

  // Respostas rápidas padrão
  const replies = [
    { key: "saudacao", title: "Saudação", body: "Olá {{cliente.nome}}, aqui é da {{empresa.nome}}! Como posso ajudar?" },
    { key: "horarios", title: "Horários", body: "Atendemos de segunda a sábado, das 8h às 18h." },
    { key: "entrega", title: "Entrega", body: "Fazemos entrega em toda a cidade. Para calcular o valor, confirme o seu bairro, por favor." },
    { key: "aguarda", title: "Aguarde um momento", body: "Um momento, {{cliente.nome}}, já vou confirmar essa informação." },
  ];
  for (const r of replies) {
    await prisma.quickReply.upsert({
      where: { organizationId_key: { organizationId: org.id, key: r.key } },
      create: { organizationId: org.id, ...r },
      update: {},
    });
  }

  // Automações padrão
  const workflows = [
    { name: "Boas-vindas do lead", trigger: "NOVO_LEAD", config: {}, actions: [{ type: "CRIAR_FOLLOWUP", title: "Contactar novo lead", dueInHours: 4 }] },
    { name: "Reativar parados 24h", trigger: "SEM_RESPOSTA", config: { hours: 24 }, actions: [{ type: "CRIAR_FOLLOWUP", title: "Retomar conversa parada", dueInHours: 2 }] },
    { name: "Pós-venda", trigger: "CONVERTIDO", config: {}, actions: [{ type: "CRIAR_FOLLOWUP", title: "Acompanhar pós-venda", dueInHours: 48 }] },
  ];
  for (const w of workflows) {
    const exists = await prisma.workflow.findFirst({ where: { organizationId: org.id, name: w.name } });
    if (!exists) {
      await prisma.workflow.create({
        data: { organizationId: org.id, name: w.name, trigger: w.trigger, config: w.config, actions: w.actions },
      });
    }
  }

  console.log(`Seed OK: org=${org.id} admin=admin@demo.test / atende123`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
