import { IRacingClient } from './iracing-client';
import * as fs from 'fs';
import * as path from 'path';
import { League } from '../src/schemas/league';
import { z } from 'zod';

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

async function fetchAndSaveSeasonData() {
  try {
    const rawData = await client.makeAuthorizedRequest('/data/league/seasons', {
      league_id: wtecLeagueId
    });
    await saveDataToFile(rawData, 'league-seasons.json');
  } catch (error) {
    console.error('Error fetching season data:', error);
    process.exit(1);
  }
}

async function fetchAllData() {
  await fetchAndSaveLeagueData();
  await fetchAndSaveSeasonData();
}

fetchAllData();
