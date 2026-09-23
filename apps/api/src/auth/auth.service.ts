import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../prisma/prisma.service";
import { rolePermissions } from "./roles";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async login(email: string, password: string, organizationId: string) {
    const user = await this.prisma.user.findFirst({
      where: { email, organizationId, active: true },
    });
    if (!user) throw new UnauthorizedException("Credenciais inválidas.");
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException("Credenciais inválidas.");
    const permissions = rolePermissions[user.role] ?? [];
    const token = await this.jwt.signAsync({
      sub: user.id,
      org: user.organizationId,
      role: user.role,
      permissions,
    });
    await this.prisma.auditLog.create({
      data: {
        organizationId: user.organizationId,
        actorId: user.id,
        action: "LOGIN",
        resource: "user",
        resourceId: user.id,
      },
    });
    return { access_token: token };
  }

  async me(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, organizationId: true },
    });
  }
}
