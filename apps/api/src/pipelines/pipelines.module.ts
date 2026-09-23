import { Module } from "@nestjs/common";
import { PipelinesController } from "./pipelines.controller";
import { PipelinesService } from "./pipelines.service";
import { FollowUpsController } from "./followups.controller";
import { FollowUpsService } from "./followups.service";
import { QuickRepliesController } from "./quickreplies.controller";
import { QuickRepliesService } from "./quickreplies.service";
import { AutomationsModule } from "../automations/automations.module";

@Module({
  imports: [AutomationsModule],
  controllers: [PipelinesController, FollowUpsController, QuickRepliesController],
  providers: [PipelinesService, FollowUpsService, QuickRepliesService],
  exports: [PipelinesService, FollowUpsService],
})
export class PipelinesModule {}
