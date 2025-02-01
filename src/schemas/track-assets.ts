import { z } from 'zod';

const TrackMapLayers = z.object({
  background: z.string(),
  inactive: z.string(),
  active: z.string(),
  pitroad: z.string(),
  'start-finish': z.string(),
  turns: z.string(),
});

const TrackAsset = z.object({
  coordinates: z.string().nullable(),
  detail_copy: z.string().nullable(),
  detail_techspecs_copy: z.string().nullable(),
  detail_video: z.string().nullable(),
  folder: z.string(),
  gallery_images: z.string().nullable(),
  gallery_prefix: z.string().nullable(),
  large_image: z.string(),
  logo: z.string(),
  north: z.string().nullable(),
  num_svg_images: z.number(),
  small_image: z.string(),
  track_id: z.number(),
  track_map: z.string(),
  track_map_layers: TrackMapLayers,
});

export const TrackAssets = z.record(z.string(), TrackAsset);