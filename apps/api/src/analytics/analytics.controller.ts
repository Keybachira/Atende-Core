import { Controller, Get, Req } from "@nestjs/common";
import { AnalyticsService } from "./analytics.service";
import { RequirePermissions } from "../auth/permissions.decorator";

@Controller("reports")
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}

  @Get("dashboard")
  @RequirePermissions("reports.read")
  dashboard(@Req() req: any) {
    return this.analytics.dashboard(req.user.org);
  }
}
