import { IRacingClient } from './iracing-client';
import * as fs from 'fs';
import * as path from 'path';
import { League } from '../src/schemas/league';
import { z } from 'zod';
import { LeagueSeasons } from '../src/schemas/league-seasons';
import { LeagueSeasonSessions } from '../src/schemas/league-season-sessions';
import { TrackAssets } from '../src/schemas/track-assets';
import { Members } from '../src/schemas/members';
import { Subsession } from '../src/schemas/subsession';
import { DateTime } from 'luxon';

if (!process.env.EMAIL || !process.env.PASSWORD) {
  throw new Error('Missing required environment variables EMAIL and/or PASSWORD');
}

const client = new IRacingClient({
  email: process.env.EMAIL,
  password: process.env.PASSWORD
});

const wtecLeagueId = '7058';

async function saveDataToFile(data: unknown, filename: string) {
  const dirPath = path.join(process.cwd(), 'src', 'data');
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const filePath = path.join(dirPath, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`Data successfully written to ${filePath}`);
}

async function fetchLeagueData() {
  try {
    const rawData = await client.makeAuthorizedRequest('/data/league/get', {
      league_id: wtecLeagueId,
      include_license: false
    });

    // Validate the data against our schema
    const validatedData = League.parse(rawData);
    await saveDataToFile(validatedData, 'league.json');
    return validatedData;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation Error:', JSON.stringify(error.errors, null, 2));
    } else {
      console.error('Error:', error);
    }
    process.exit(1);
  }
}

async function fetchLeagueSeasonData() {
  try {
    const rawData = await client.makeAuthorizedRequest('/data/league/seasons', {
      league_id: wtecLeagueId,
      include_licenses: false
    });

    // Validate the data against our schema
    const validatedData = LeagueSeasons.parse(rawData);
    await saveDataToFile(validatedData, 'league-seasons.json');
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation Error:', JSON.stringify(error.errors, null, 2));
    } else {
      console.error('Error:', error);
    }
    process.exit(1);
  }
}

async function fetchLeagueSeasonSessionData() {
  try {
    const rawData = await client.makeAuthorizedRequest('/data/league/season_sessions', {
      league_id: wtecLeagueId,
      season_id: '113498',
      results_only: false
    });

    // Validate the data against our schema
    const validatedData = LeagueSeasonSessions.parse(rawData);
    await saveDataToFile(validatedData, 'league-season-sessions.json');
    return validatedData;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation Error:', JSON.stringify(error.errors, null, 2));
    } else {
      console.error('Error:', error);
    }
    process.exit(1);
  }
}

async function fetchTrackAssets() {
  try {
    const rawData = await client.makeAuthorizedRequest('/data/track/assets');

    // Validate the data against our schema
    const validatedData = TrackAssets.parse(rawData);
    await saveDataToFile(validatedData, 'track-assets.json');
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation Error:', JSON.stringify(error.errors, null, 2));
    } else {
      console.error('Error:', error);
    }
    process.exit(1);
  }
}

async function fetchMemberData(leagueData: z.infer<typeof League>) {
  try {
    // Extract customer IDs from the league data
    const customerIds = leagueData.roster.map((member: { cust_id: number }) => member.cust_id);

    // Fetch member data
    const rawData = await client.makeAuthorizedRequest('/data/member/get', {
      cust_ids: customerIds.join(','),
      include_licenses: false
    });

    // Validate the data against our schema
    const validatedData = Members.parse(rawData);
    await saveDataToFile(validatedData, 'members.json');
    return validatedData;
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation Error:', JSON.stringify(error.errors, null, 2));
    } else {
      console.error('Error:', error);
    }
    process.exit(1);
  }
}

async function fetchSubsessionData(subsessionId: string) {
  try {
    const rawData = await client.makeAuthorizedRequest('/data/results/get', {
      subsession_id: subsessionId,
      include_licenses: false
    });

    // Validate the data against our schema
    const validatedData = Subsession.parse(rawData);

    // Save to a subdirectory for subsessions
    const dirPath = path.join(process.cwd(), 'src', 'data', 'subsessions');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    const filePath = path.join(dirPath, `${subsessionId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(validatedData, null, 2));
    console.log(`Subsession data successfully written to ${filePath}`);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation Error:', JSON.stringify(error.errors, null, 2));
    } else {
      console.error('Error:', error);
    }
    process.exit(1);
  }
}

async function fetchAllData() {
  const leagueData = await fetchLeagueData();
  await fetchLeagueSeasonData();
  const seasonSessionData = await fetchLeagueSeasonSessionData();
  await fetchTrackAssets();
  await fetchMemberData(leagueData!);

  // Fetch subsession data for each past session
  if (seasonSessionData) {
    const now = DateTime.now();

    for (const session of seasonSessionData.sessions) {
      if (!session.subsession_id || !session.launch_at) continue;

      const sessionDate = DateTime.fromISO(session.launch_at).setZone('Europe/London');

      // Only fetch data for sessions that:
      // 1. Have already happened
      // 2. Are on Thursday at 19:00 London time
      if (
        sessionDate < now &&
        sessionDate.weekday === 4 && // Thursday
        sessionDate.hour === 19 && // 19:00
        sessionDate.minute === 0
      ) {
        await fetchSubsessionData(session.subsession_id.toString());
      }
    }
  }
}

fetchAllData().catch(console.error);
