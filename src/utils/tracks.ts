import trackAssets from '../data/track-assets.json';

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