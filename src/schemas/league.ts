import { z } from 'zod';

const Helmet = z.object({
  pattern: z.number(),
  color1: z.string(),
  color2: z.string(),
  color3: z.string(),
  face_type: z.number(),
  helmet_type: z.number(),
});

const Image = z.object({
  small_logo: z.string().nullable(),
  large_logo: z.string().nullable(),
});

const Tag = z.object({
  tag_id: z.number(),
  tag_name: z.string(),
});

const CategoryTag = z.object({
  category_id: z.number(),
  name: z.string(),
  limit: z.number().nullable(),
  tags: z.array(Tag),
});

const Tags = z.object({
  categorized: z.array(CategoryTag),
  not_categorized: z.array(z.any()),
});

const LeagueMember = z.object({
  cust_id: z.number(),
  display_name: z.string(),
  helmet: Helmet,
  owner: z.boolean(),
  admin: z.boolean(),
  league_mail_opt_out: z.boolean(),
  league_pm_opt_out: z.boolean(),
  league_member_since: z.string(),
  car_number: z.string().nullable(),
  nick_name: z.string().nullable(),
});

export const League = z.object({
  league_id: z.number(),
  owner_id: z.number(),
  league_name: z.string(),
  created: z.string(),
  hidden: z.boolean(),
  message: z.string(),
  about: z.string(),
  recruiting: z.boolean(),
  private_wall: z.boolean(),
  private_roster: z.boolean(),
  private_schedule: z.boolean(),
  private_results: z.boolean(),
  is_owner: z.boolean(),
  is_admin: z.boolean(),
  roster_count: z.number(),
  owner: z.object({
    cust_id: z.number(),
    display_name: z.string(),
    helmet: Helmet,
    car_number: z.string().nullable(),
    nick_name: z.string().nullable(),
  }),
  image: Image,
  tags: Tags,
  league_applications: z.array(z.any()),
  pending_requests: z.array(z.any()),
  is_member: z.boolean(),
  is_applicant: z.boolean(),
  is_invite: z.boolean(),
  is_ignored: z.boolean(),
  roster: z.array(LeagueMember),
});

export type League = z.infer<typeof League>;
export type LeagueMember = z.infer<typeof LeagueMember>;