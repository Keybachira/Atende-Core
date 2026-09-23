import { Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(organizationId: string, input: { name: string; email: string; password: string; role?: any }) {
    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await this.prisma.user.create({
      data: {
        organizationId,
        name: input.name,
        email: input.email,
        passwordHash,
        role: input.role ?? "AGENT",
      },
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
    });
    await this.prisma.auditLog.create({
      data: { organizationId, action: "USER_CREATED", resource: "user", resourceId: user.id, metadata: { email: user.email } },
    });
    return user;
  }

  list(organizationId: string) {
    return this.prisma.user.findMany({
      where: { organizationId },
      select: { id: true, name: true, email: true, role: true, active: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
