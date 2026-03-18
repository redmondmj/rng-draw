const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Using relative paths for portability
const assetDir = path.join(__dirname, 'src', 'assets');
const excelFile = "U11A Bearcats Pot O' Gold 50_50_3-17-2026(1).xlsx";
const fullPath = path.join(assetDir, excelFile);
const outputPath = path.join(__dirname, 'public', 'tickets.csv');

if (fs.existsSync(fullPath)) {
  const workbook = XLSX.readFile(fullPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON first to easily filter columns
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  // Sanitize data: Remove emails and any other potentially sensitive info
  const sanitizedData = data.map(row => ({
    "Guest name": row["Guest name"],
    "Buyer name": row["Buyer name"],
    "Ticket number": row["Ticket number"],
    "Ticket type": row["Ticket type"],
    "Which player are you supporting?": row["Which player are you supporting?"],
    "Status": row["Status"]
  }));
  
  const newSheet = XLSX.utils.json_to_sheet(sanitizedData);
  const csv = XLSX.utils.sheet_to_csv(newSheet);
  
  fs.writeFileSync(outputPath, csv);
  console.log(`Sanitized Excel and saved to ${outputPath}`);
} else {
  console.error(`File not found at ${fullPath}. Please place your Excel file in src/assets/`);
}
