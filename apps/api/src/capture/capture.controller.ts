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

@Controller("v1/capture")
@UseGuards(ApiKeyGuard)
export class CaptureController {
  constructor(private readonly capture: CaptureService) {}

  /** Draft vs sent from the tool the expert works in: one call, a case comes out. */
  @Post()
  @HttpCode(201)
  create(
    @Auth() auth: AuthContext,
    @Body(zod(captureCreateSchema)) body: CaptureCreate,
  ): Promise<CaptureResult> {
    return this.capture.create(auth.projectId, { ...body, actor: body.actor ?? auth.user?.email ?? null });
  }

  /** The scorecard: drafts sent untouched, fixes by expert, top reasons, by week. */
  @Get("stats")
  stats(
    @Auth() auth: AuthContext,
    @Query(zod(captureStatsQuerySchema)) q: CaptureStatsQuery,
  ): Promise<CaptureStats> {
    return this.capture.stats(auth.projectId, q);
  }

  /** Capture adapter for Front */
  @Post("adapter")
  @HttpCode(201)
  captureAdapter(
    @Auth() auth: AuthContext,
    @Body() body: any, // Define the appropriate type for the body based on your requirements
  ): Promise<CaptureResult> {
    // Implement the logic to handle the capture adapter request
    const adaptedData = this.adaptCaptureData(body);
    return this.capture.create(auth.projectId, { ...adaptedData, actor: auth.user?.email ?? null });
  }

  private adaptCaptureData(data: any): CaptureCreate {
    // Implement the logic to adapt the incoming data to the CaptureCreate format
    // This is a placeholder implementation; replace it with actual adaptation logic
    return {
      // Map the incoming data to the required structure
      ...data,
      // Add any additional properties or transformations as needed
    } as CaptureCreate;
  }
}