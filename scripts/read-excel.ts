import Excel from 'exceljs';
import fs from 'fs';
import { resolve } from 'path';

// read from a file
const workbook = new Excel.Workbook();
await workbook.xlsx.readFile('./src/data/standings.xlsx');

// get the sheet named 'Standings'
const sheet = workbook.getWorksheet('Standings');
if (!sheet) {
  console.error('Sheet "Standings" not found');
  process.exit(1);
}

interface DriverStanding {
  name: string;
  points: number;
}

const standings: DriverStanding[] = [];

// Start from row 24 and get driver names (column Z) and points (column AD)
for (let rowNumber = 24; rowNumber <= sheet.rowCount; rowNumber++) {
  const row = sheet.getRow(rowNumber);
  const name = row.getCell('Z').value;
  const points = row.getCell('AD').value;

  if (name && points) {
    standings.push({
      name: name.toString(),
      points: Number(points)
    });
  }
}

// Sort by points in descending order
standings.sort((a, b) => b.points - a.points);

// Write to JSON file
const outputPath = resolve('./src/data/standings.json');
fs.writeFileSync(outputPath, JSON.stringify({ standings }, null, 2));

console.log('\nDriver Standings:');
standings.forEach((driver, index) => {
  console.log(`${index + 1}. ${driver.name}: ${driver.points} points`);
});
console.log('\nStandings written to:', outputPath);
