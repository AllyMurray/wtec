import { z } from 'zod';

// Schema for car
const Car = z.object({
  car_id: z.number(),
  car_name: z.string(),
});

// Schema for car class
const CarClass = z.object({
  car_class_id: z.number(),
  name: z.string(),
  cars_in_class: z.array(Car),
});

// Schema for individual race session
const RaceSession = z.object({
  subsession_id: z.number(),
  start_time: z.string(),
  end_time: z.string().nullable(),
  track: z.object({
    track_id: z.number(),
    track_name: z.string(),
    config_name: z.string().nullable(),
  }),
  results_complete: z.boolean(),
  season_id: z.number(),
  season_name: z.string(),
  season_short_name: z.string().nullable(),
  season_year: z.number(),
  season_quarter: z.number(),
  race_week_num: z.number(),
  session_id: z.number(),
  license_category_id: z.number(),
  license_category: z.string(),
  private_session_id: z.number().nullable(),
  host_id: z.number().nullable(),
  session_name: z.string(),
});

// Schema for a season
const Season = z.object({
  league_id: z.number(),
  season_id: z.number(),
  points_system_id: z.number(),
  season_name: z.string(),
  active: z.boolean(),
  hidden: z.boolean(),
  num_drops: z.number(),
  no_drops_on_or_after_race_num: z.number(),
  points_cars: z.array(Car),
  driver_points_car_classes: z.array(CarClass),
  team_points_car_classes: z.array(CarClass),
  points_system_name: z.string(),
  points_system_desc: z.string(),
  custom_points_system: z.boolean().optional(),
  owner_id: z.number().optional(),
  race_points_system_id: z.number().nullable().optional(),
  race_points_system_name: z.string().nullable().optional(),
  custom_race_points: z.boolean().optional(),
  created: z.string().optional(),
  cars: z.array(z.number()).optional(),
  tracks: z.array(z.number()).optional(),
  sessions: z.array(RaceSession).optional(),
});

// Main schema for league seasons response
export const LeagueSeasons = z.object({
  subscribed: z.boolean(),
  seasons: z.array(Season),
  success: z.boolean(),
  retired: z.boolean(),
  league_id: z.number(),
});

// Type exports for TypeScript
export type LeagueSeasons = z.infer<typeof LeagueSeasons>;
export type Season = z.infer<typeof Season>;
export type Car = z.infer<typeof Car>;
export type CarClass = z.infer<typeof CarClass>;
export type RaceSession = z.infer<typeof RaceSession>;