import { Injectable } from "@nestjs/common";
import { renderQuickReply } from "@atende/pipeline";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class QuickRepliesService {
  constructor(private readonly prisma: PrismaService) {}

  list(organizationId: string) {
    return this.prisma.quickReply.findMany({ where: { organizationId }, orderBy: { key: "asc" } });
  }

  create(organizationId: string, input: { key: string; title: string; body: string }) {
    return this.prisma.quickReply.upsert({
      where: { organizationId_key: { organizationId, key: input.key } },
      create: { organizationId, ...input },
      update: { title: input.title, body: input.body },
    });
  }

  async render(organizationId: string, id: string, vars: { cliente?: string; empresa?: string; vendedor?: string }) {
    const qr = await this.prisma.quickReply.findFirstOrThrow({ where: { id, organizationId } });
    return { body: renderQuickReply(qr.body, vars) };
  }
}
