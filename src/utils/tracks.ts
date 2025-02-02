import { TrackAssets } from '../schemas/track-assets';
import trackAssetsJson from '../data/track-assets.json';
import { z } from 'zod';
import { type Track } from '../schemas/track';
import tracks from '../data/tracks.json';
import leagueSeasonSessions from '../data/league-season-sessions.json';
import { URL } from 'url';
import path from 'path';

const trackAssets = TrackAssets.parse(trackAssetsJson);

const IRACING_ASSETS_URL = 'https://images-static.iracing.com';

export function getTrackInactiveUrl(trackId: number) {
  const track = trackAssets[trackId];
  if (!track?.track_map) return null;
  return `${track.track_map}inactive.svg`;
}

export function getTrackMapUrl(trackId: number) {
  return `https://members-ng.iracing.com/track/map/${trackId}`;
}

export function getTrackDetails(trackId: number) {
  return trackAssets[trackId];
}

export function parseTrackCoordinates(coordinates: string | undefined) {
  if (!coordinates) return null;

  const [lat, lng] = coordinates.split(',').map(coord => parseFloat(coord.trim()));
  return { lat, lng };
}

export function getTrackRegion(coordinates: string | undefined): string {
  if (!coordinates) return 'Unknown';

  const coords = parseTrackCoordinates(coordinates);
  if (!coords) return 'Unknown';

  const { lat, lng } = coords;

  // Basic region determination
  if (lat > 30 && lat < 70 && lng > -130 && lng < -60) return 'North America';
  if (lat > 35 && lat < 70 && lng > -10 && lng < 40) return 'Europe';
  if (lat > -50 && lat < 0 && lng > 110 && lng < 180) return 'Oceania';
  if (lat > 20 && lat < 50 && lng > 70 && lng < 145) return 'Asia';
  // Add more regions as needed

  return 'Other';
}

export function groupTracksByRegion(tracks: EnrichedTrack[]): Record<string, EnrichedTrack[]> {
  const unorderedGroups = tracks.reduce((acc, track) => {
    const region = getTrackRegion(track.coordinates);
    if (!acc[region]) acc[region] = [];
    acc[region].push(track);
    return acc;
  }, {} as Record<string, EnrichedTrack[]>);

  return Object.keys(unorderedGroups)
    .sort()
    .reduce((acc, region) => {
      acc[region] = unorderedGroups[region];
      return acc;
    }, {} as Record<string, EnrichedTrack[]>);
}

export function getTrackAssets() {
  return trackAssets;
}

// Use the inferred type from Zod schema instead of manual Track interface
export type Track = z.infer<typeof TrackAssets>[string];

export function getTrackInfo(trackId: number) {
  return tracks.find(track => track.track_id === trackId);
}

export function getTracksByCategory(category: string) {
  return tracks.filter(track => track.category === category);
}

// Add this function to get league track IDs
function getLeagueTrackIds(): number[] {
  return [...new Set(leagueSeasonSessions.sessions.map(session => session.track.track_id))];
}

// Update the Track type to include all the fields we're using
export interface EnrichedTrack extends Track {
  id: number;
  track_name: string;
  config_name: string;
  location: string;
  track_config_length: number;
  corners_per_lap: number;
  price: string | number;
  price_display?: string;
  large_image: string;
  small_image: string;
  logo: string | null;
  track_map?: string;
}

export function getEnrichedTracks(): EnrichedTrack[] {
  const leagueTrackIds = getLeagueTrackIds();

  const enrichedTracks = Object.entries(trackAssets)
    .map(([id, asset]) => {
      const trackId = parseInt(id);
      const trackInfo = tracks.find(t => t.track_id === trackId);

      const makePath = (imagePath: string) => {
        const fullPath = path.join(asset.folder, imagePath);
        return new URL(fullPath, IRACING_ASSETS_URL).toString();
      };

      const enrichedTrack: EnrichedTrack = {
        ...asset,
        ...trackInfo,
        id: trackId,
        track_name: trackInfo?.track_name || '',
        config_name: trackInfo?.config_name || 'Full Course',
        location: trackInfo?.location || '',
        track_config_length: trackInfo?.track_config_length || 0,
        corners_per_lap: trackInfo?.corners_per_lap || 0,
        price: trackInfo?.price || 'Free',
        price_display: trackInfo?.price ? `$${trackInfo.price.toFixed(2)}` : 'Free',
        large_image: makePath(asset.large_image),
        small_image: makePath(asset.small_image),
        logo: asset.logo ? new URL(asset.logo, IRACING_ASSETS_URL).toString() : null,
      };

      return enrichedTrack;
    })
    .filter(track => leagueTrackIds.includes(track.id));

  return enrichedTracks;
}