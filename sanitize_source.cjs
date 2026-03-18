const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Using relative paths for portability
const assetDir = path.join(__dirname, 'src', 'assets');
const excelFile = "U11A Bearcats Pot O' Gold 50_50_3-17-2026(1).xlsx";
const fullPath = path.join(assetDir, excelFile);

if (fs.existsSync(fullPath)) {
  const workbook = XLSX.readFile(fullPath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  // Create a completely sanitized version of the data for the Excel file
  const sanitizedData = data.map(row => {
    const newRow = { ...row };
    // Explicitly clear sensitive fields
    delete newRow["Buyer email"];
    delete newRow["Ticket notes"];
    return newRow;
  });
  
  const newSheet = XLSX.utils.json_to_sheet(sanitizedData);
  const newWorkbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(newWorkbook, newSheet, sheetName);
  
  // Overwrite the original Excel file
  XLSX.writeFile(newWorkbook, fullPath);
  console.log(`Sanitized original Excel file at ${fullPath}`);
  
  // Also refresh the CSV
  const csv = XLSX.utils.sheet_to_csv(newSheet);
  const csvPath = path.join(__dirname, 'public', 'tickets.csv');
  fs.writeFileSync(csvPath, csv);
  console.log(`Refreshed sanitized CSV at ${csvPath}`);
} else {
  console.error(`File not found at ${fullPath}. Please place your Excel file in src/assets/`);
}
