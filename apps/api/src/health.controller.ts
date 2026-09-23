import { Controller, Get } from "@nestjs/common";
import { Public } from "./auth/public.decorator";

@Controller("health")
export class HealthController {
  @Get()
  @Public()
  status() {
    return { status: "ok", service: "atende-api", version: "0.1.0" };
  }
}
