import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  create(name: string) {
    return this.prisma.organization.create({ data: { name } });
  }

  list() {
    return this.prisma.organization.findMany({ orderBy: { createdAt: "desc" } });
  }

  get(organizationId: string) {
    return this.prisma.organization.findUniqueOrThrow({ where: { id: organizationId } });
  }

  rename(organizationId: string, name: string) {
    return this.prisma.organization.update({ where: { id: organizationId }, data: { name } });
  }
}
