import { z } from 'zod';

export const VolumeRuleSchema = z.object({
  from: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  to: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  volume: z.number().int().min(0).max(16)
});

export const ScheduleConfigSchema = z.object({
  soundZoneId: z.string(),
  rules: z.array(VolumeRuleSchema),
  timeZone: z.string(),
  baselineVolume: z.number().int().min(0).max(16).optional()
});

export type VolumeRule = z.infer<typeof VolumeRuleSchema>;
export type ScheduleConfig = z.infer<typeof ScheduleConfigSchema>;