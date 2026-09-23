# Atende Core — Deploy

## Desenvolvimento

```bash
cp .env.example .env
cd infra/docker && docker compose up -d        # postgres:18 + redis:8
cd ../..
pnpm install
pnpm --filter @atende/database exec prisma migrate dev
pnpm --filter @atende/database db:seed         # org demo + pipeline + respostas + automações
pnpm dev                                        # api :3001 + web :3000 (turbo)
```

Login demo: `admin@demo.test / atende123` (org `00000000-0000-0000-0000-000000000001`).

## Produção (servidor gerido / dedicado)

```bash
cp .env.example .env   # defina JWT_SECRET (32+ chars), FRONTEND_URL, NEXT_PUBLIC_API_URL
cd infra/docker
docker compose --profile app up -d --build
docker compose exec api sh -c "pnpm --filter @atende/database exec prisma migrate deploy"
```

Serviços: `web :3000` → `api :3001` → `db`, `redis` (internos).

## On-premise

Entregue a imagem via `docker save`/`load` ou registry privado; o cliente só precisa de
`.env` com `JWT_SECRET`, `DATABASE_URL` e `FRONTEND_URL`. Backups: volume `pgdata`.
