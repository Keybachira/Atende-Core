import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { JwtModule } from "@nestjs/jwt";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { PermissionsGuard } from "./auth/permissions.guard";
import { OrganizationsModule } from "./organizations/organizations.module";
import { UsersModule } from "./users/users.module";
import { CrmModule } from "./crm/crm.module";
import { MessagingModule } from "./messaging/messaging.module";
import { QueueModule } from "./queue/queue.module";
import { PipelinesModule } from "./pipelines/pipelines.module";
import { AutomationsModule } from "./automations/automations.module";
import { AnalyticsModule } from "./analytics/analytics.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? "change-me-in-production-min-32-chars",
      signOptions: { expiresIn: "15m" },
    }),
    PrismaModule,
    AuthModule,
    OrganizationsModule,
    UsersModule,
    CrmModule,
    MessagingModule,
    QueueModule,
    PipelinesModule,
    AutomationsModule,
    AnalyticsModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionsGuard },
  ],
})
export class AppModule {}
