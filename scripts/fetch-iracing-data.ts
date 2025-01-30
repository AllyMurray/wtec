import { IRacingClient } from './iracing-client';
import * as fs from 'fs';
import * as path from 'path';
import { League } from '../src/schemas/league';
import { z } from 'zod';
import { LeagueSeasons } from '../src/schemas/league-seasons';
import { LeagueSeasonSessions } from '../src/schemas/league-season-sessions';

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

async function fetchAndSaveLeagueData() {
  try {
    const rawData = await client.makeAuthorizedRequest('/data/league/get', {
      league_id: wtecLeagueId,
      include_license: false
    });

    // Validate the data against our schema
    const validatedData = League.parse(rawData);
    await saveDataToFile(validatedData, 'league.json');
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation Error:', JSON.stringify(error.errors, null, 2));
    } else {
      console.error('Error:', error);
    }
    process.exit(1);
  }
}

async function fetchAndSaveLeagueSeasons() {
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

async function fetchAndSaveLeagueSeasonSessions() {
  try {
    const rawData = await client.makeAuthorizedRequest('/data/league/season_sessions', {
      league_id: wtecLeagueId,
      season_id: '113498',
      results_only: false
    });

    // Validate the data against our schema
    const validatedData = LeagueSeasonSessions.parse(rawData);
    await saveDataToFile(validatedData, 'league-season-sessions.json');
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
  await fetchAndSaveLeagueData();
  await fetchAndSaveLeagueSeasons();
  await fetchAndSaveLeagueSeasonSessions();
}

fetchAllData().catch(console.error);
