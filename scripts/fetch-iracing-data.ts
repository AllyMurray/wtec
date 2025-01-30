import { IRacingClient } from './iracing-client';
import * as fs from 'fs';
import * as path from 'path';

if (!process.env.EMAIL || !process.env.PASSWORD) {
  throw new Error('Missing required environment variables EMAIL and/or PASSWORD');
}

const client = new IRacingClient({
  email: process.env.EMAIL,
  password: process.env.PASSWORD
});

const wtecLeagueId = '7058';

async function fetchAndSaveData() {
  try {
    const data = await client.makeAuthorizedRequest('/data/league/get', {
      league_id: wtecLeagueId,
      include_license: false
    });

    // Create directory if it doesn't exist
    const dirPath = path.join(process.cwd(), 'src', 'data');
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Write data to JSON file
    const filePath = path.join(dirPath, 'league.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    console.log(`Data successfully written to ${filePath}`);
  } catch (error) {
    console.error('Error:', error);
  }
}

fetchAndSaveData();
