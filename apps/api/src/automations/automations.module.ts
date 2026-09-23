import { Module } from "@nestjs/common";
import { AutomationsController } from "./automations.controller";
import { AutomationService } from "./automation.service";

@Module({ controllers: [AutomationsController], providers: [AutomationService], exports: [AutomationService] })
export class AutomationsModule {}
