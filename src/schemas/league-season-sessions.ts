import { z } from 'zod';

// Schema for car in a session
const SessionCar = z.object({
  car_id: z.number(),
  car_name: z.string(),
  car_class_id: z.number(),
  car_class_name: z.string(),
});

// Schema for track
const Track = z.object({
  config_name: z.string().nullable().optional(),
  track_id: z.number(),
  track_name: z.string(),
});

// Schema for track state
const TrackState = z.object({
  leave_marbles: z.boolean(),
  practice_grip_compound: z.number(),
  practice_rubber: z.number(),
  qualify_grip_compound: z.number(),
  qualify_rubber: z.number(),
  race_grip_compound: z.number(),
  race_rubber: z.number(),
  warmup_grip_compound: z.number(),
  warmup_rubber: z.number(),
});

// Schema for weather
const Weather = z.object({
  allow_fog: z.boolean(),
  fog: z.number(),
  precip_option: z.number(),
  rel_humidity: z.number(),
  skies: z.number(),
  temp_units: z.number(),
  temp_value: z.number(),
  track_water: z.number(),
  type: z.number(),
  version: z.number(),
  weather_var_initial: z.number(),
  weather_var_ongoing: z.number(),
  wind_dir: z.number(),
  wind_units: z.number(),
  wind_value: z.number(),
});

// Schema for heat session info
const HeatSessionInfo = z.object({
  consolation_delta_max_field_size: z.number(),
  consolation_delta_session_laps: z.number(),
  consolation_delta_session_length_minutes: z.number(),
  consolation_first_max_field_size: z.number(),
  consolation_first_session_laps: z.number(),
  consolation_first_session_length_minutes: z.number(),
  consolation_num_position_to_invert: z.number(),
  consolation_num_to_consolation: z.number(),
  consolation_num_to_main: z.number(),
  consolation_run_always: z.boolean(),
  consolation_scores_champ_points: z.boolean(),
  created: z.string(),
  cust_id: z.number(),
  heat_caution_type: z.number(),
  heat_info_id: z.number(),
  heat_info_name: z.string(),
  heat_laps: z.number(),
  heat_length_minutes: z.number(),
  heat_max_field_size: z.number(),
  heat_num_from_each_to_main: z.number(),
  heat_num_position_to_invert: z.number(),
  heat_scores_champ_points: z.boolean(),
  heat_session_minutes_estimate: z.number(),
  hidden: z.boolean(),
  main_laps: z.number(),
  main_length_minutes: z.number(),
  main_max_field_size: z.number(),
  main_num_position_to_invert: z.number(),
  max_entrants: z.number(),
  open_practice: z.boolean(),
  pre_main_practice_length_minutes: z.number(),
  pre_qual_num_to_main: z.number(),
  pre_qual_practice_length_minutes: z.number(),
  qual_caution_type: z.number(),
  qual_laps: z.number(),
  qual_length_minutes: z.number(),
  qual_num_to_main: z.number(),
  qual_open_delay_seconds: z.number(),
  qual_scores_champ_points: z.boolean(),
  qual_scoring: z.number(),
  qual_style: z.number(),
  race_style: z.number(),
});

// Schema for individual session
export const Session = z.object({
  cars: z.array(SessionCar),
  driver_changes: z.boolean(),
  entry_count: z.number(),
  has_results: z.boolean(),
  heat_ses_info: HeatSessionInfo.optional(),
  launch_at: z.string(),
  league_id: z.number(),
  league_season_id: z.number(),
  lone_qualify: z.boolean(),
  pace_car_class_id: z.number().nullable(),
  pace_car_id: z.number().nullable(),
  password_protected: z.boolean(),
  practice_length: z.number(),
  private_session_id: z.number(),
  qualify_laps: z.number(),
  qualify_length: z.number(),
  race_laps: z.number(),
  race_length: z.number(),
  session_id: z.number().optional(),
  status: z.number(),
  subsession_id: z.number().optional(),
  team_entry_count: z.number(),
  time_limit: z.number(),
  track: Track,
  track_state: TrackState,
  weather: Weather,
  winner_id: z.number().optional(),
  winner_name: z.string().optional(),
});

// Main schema for league season sessions response
export const LeagueSeasonSessions = z.object({
  sessions: z.array(Session),
  success: z.boolean(),
  season_id: z.number(),
  league_id: z.number(),
});

// Type exports
export type LeagueSeasonSessions = z.infer<typeof LeagueSeasonSessions>;
export type Session = z.infer<typeof Session>;