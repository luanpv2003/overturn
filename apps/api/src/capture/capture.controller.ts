import { Body, Controller, Get, HttpCode, Post, Query, UseGuards } from "@nestjs/common";
import {
  type CaptureCreate,
  type CaptureResult,
  type CaptureStats,
  type CaptureStatsQuery,
  captureCreateSchema,
  captureStatsQuerySchema,
} from "@overturn-ai/shared";
import { ApiKeyGuard, Auth } from "../auth/api-key.guard";
import type { AuthContext } from "../auth/api-keys.service";
import { zod } from "../common/zod.pipe";
import { CaptureService } from "./capture.service";
import { IntercomService } from "./intercom.service"; // Import the Intercom service

@Controller("v1/capture")
@UseGuards(ApiKeyGuard)
export class CaptureController {
  constructor(
    private readonly capture: CaptureService,
    private readonly intercom: IntercomService // Inject the Intercom service
  ) {}

  /** Draft vs sent from the tool the expert works in: one call, a case comes out. */
  @Post()
  @HttpCode(201)
  async create(
    @Auth() auth: AuthContext,
    @Body(zod(captureCreateSchema)) body: CaptureCreate,
  ): Promise<CaptureResult> {
    const result = await this.capture.create(auth.projectId, { ...body, actor: body.actor ?? auth.user?.email ?? null });
    
    // Capture the event in Intercom
    await this.intercom.captureEvent(auth.projectId, result.id, body); // Capture the event in Intercom

    return result;
  }

  /** The scorecard: drafts sent untouched, fixes by expert, top reasons, by week. */
  @Get("stats")
  stats(
    @Auth() auth: AuthContext,
    @Query(zod(captureStatsQuerySchema)) q: CaptureStatsQuery,
  ): Promise<CaptureStats> {
    return this.capture.stats(auth.projectId, q);
  }
}