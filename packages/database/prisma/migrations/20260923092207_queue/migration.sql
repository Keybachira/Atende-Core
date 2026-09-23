-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('WAITING', 'ASSIGNED', 'CLOSED');

-- CreateTable
CREATE TABLE "queue_items" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "level" TEXT NOT NULL DEFAULT 'NORMAL',
    "reasons" JSONB,
    "manual_priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" "QueueStatus" NOT NULL DEFAULT 'WAITING',
    "assigned_to_id" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "queue_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "queue_item_id" TEXT,
    "conversation_id" TEXT NOT NULL,
    "from_user_id" TEXT,
    "to_user_id" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "queue_items_conversation_id_key" ON "queue_items"("conversation_id");

-- CreateIndex
CREATE INDEX "queue_items_organization_id_status_score_idx" ON "queue_items"("organization_id", "status", "score" DESC);

-- CreateIndex
CREATE INDEX "assignments_organization_id_conversation_id_idx" ON "assignments"("organization_id", "conversation_id");

-- AddForeignKey
ALTER TABLE "queue_items" ADD CONSTRAINT "queue_items_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_items" ADD CONSTRAINT "queue_items_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignments" ADD CONSTRAINT "assignments_queue_item_id_fkey" FOREIGN KEY ("queue_item_id") REFERENCES "queue_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
