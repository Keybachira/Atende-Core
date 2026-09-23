import { Module } from "@nestjs/common";
import { CrmController } from "./crm.controller";
import { CrmService } from "./crm.service";
import { AutomationsModule } from "../automations/automations.module";

@Module({ imports: [AutomationsModule], controllers: [CrmController], providers: [CrmService], exports: [CrmService] })
export class CrmModule {}
