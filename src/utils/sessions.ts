import { DateTime } from 'luxon';
import { LeagueSeasonSessions, type Session } from '../schemas/league-season-sessions';
import type { z } from 'zod';

type LeagueSeasonSessionsType = z.infer<typeof LeagueSeasonSessions>;

export function filterThursdayRaceSessions(sessions: Session[]) {
  return [...sessions].filter(session => {
    const date = DateTime.fromISO(session.launch_at).setZone('Europe/London');
    return date.weekday === 4 && date.hour === 19 && date.minute === 0;
  }).sort(
    (a, b) => new Date(a.launch_at).getTime() - new Date(b.launch_at).getTime()
  );
}

export function splitSessionsByDate(sessions: Session[]) {
  const now = DateTime.now();
  const sortedSessions = filterThursdayRaceSessions(sessions);

  const pastSessions = sortedSessions
    .filter(s => DateTime.fromISO(s.launch_at) < now)
    .sort(
      (a, b) => new Date(b.launch_at).getTime() - new Date(a.launch_at).getTime()
    );

  const upcomingSessions = sortedSessions.filter(
    s => DateTime.fromISO(s.launch_at) >= now
  );

  return {
    pastSessions,
    upcomingSessions
  };
}