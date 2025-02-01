import { z } from 'zod';

const HelmetSchema = z.object({
  pattern: z.number(),
  color1: z.string(),
  color2: z.string(),
  color3: z.string(),
  face_type: z.number(),
  helmet_type: z.number(),
});

const MemberSchema = z.object({
  cust_id: z.number(),
  display_name: z.string(),
  helmet: HelmetSchema,
  last_login: z.string(),
  member_since: z.string(),
  club_id: z.number(),
  club_name: z.string(),
  ai: z.boolean(),
});

export const Members = z.object({
  success: z.boolean(),
  cust_ids: z.array(z.number()),
  members: z.array(MemberSchema),
});

export type Members = z.infer<typeof Members>;