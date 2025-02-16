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


const headerRowNumber = 2;
const firstDataRowNumber = 3;
let currentWeek = 0;

const row3 = sheet.getRow(firstDataRowNumber);

// Scan through columns to find the last round with data
row3.eachCell((cell, colNumber) => {
  const header = sheet.getRow(headerRowNumber).getCell(colNumber).value?.toString() || '';
  if (header.toLowerCase().startsWith('round ')) {
    const value = cell.result;
    const weekMatch = header.match(/round (\d+)/i);

    if (weekMatch) {
      const weekNumber = parseInt(weekMatch[1]);

      // Check if there's actual numerical data in the cell
      const numericValue = Number(value);
      if (!isNaN(numericValue)) {
        currentWeek = Math.max(currentWeek, weekNumber);
      }
    }
  }
});

console.log(`\nDetected Current Week: ${currentWeek}`);

interface DriverStanding {
  name: string;
  points: number;
  pointsNoDrop: number;
  pointsOneDrop: number | null;
  pointsTwoDrops: number | null;
  currentWeek: number;
}

const standings: DriverStanding[] = [];

for (let rowNumber = firstDataRowNumber; rowNumber <= sheet.rowCount; rowNumber++) {
  const row = sheet.getRow(rowNumber);
  const name = row.getCell('A').text;
  const pointsNoDrop = row.getCell('K').result;
  const pointsOneDrop = row.getCell('N').result;
  const pointsTwoDrops = row.getCell('P').result;

  const firstDropRound = 3;
  const secondDropRound = 6;

  if (name && pointsNoDrop) {
    const standing: DriverStanding = {
      name: name.toString(),
      pointsNoDrop: Number(pointsNoDrop),
      pointsOneDrop: currentWeek >= firstDropRound ? Number(pointsOneDrop) : null,
      pointsTwoDrops: currentWeek >= secondDropRound ? Number(pointsTwoDrops) : null,
      // Use the appropriate points total based on the current week
      points: currentWeek >= secondDropRound ? Number(pointsTwoDrops) :
              currentWeek >= firstDropRound ? Number(pointsOneDrop) :
              Number(pointsNoDrop),
      currentWeek
    };
    standings.push(standing);
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
  if (driver.pointsNoDrop !== driver.points) {
    console.log(`   (${driver.pointsNoDrop} points before drops)`);
  }
});
console.log('\nStandings written to:', outputPath);
