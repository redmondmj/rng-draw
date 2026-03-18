# St. Paddy's Day RNG Draw App

## Overview
A festive St. Patrick's Day themed Random Number Generator (RNG) application designed for prize draws. It supports loading ticket data from CSV and Excel files. The app handles multiple $50 draws and a 50/50 grand prize draw, ensuring all tickets are eligible for the final big prize.

## Prerequisites
- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher

## Installation
1. Clone or download the repository.
2. Navigate to the project directory:
   ```powershell
   cd rng-draw
   ```
3. Install dependencies:
   ```powershell
   npm install
   ```

## Usage/Features
- **Automated Loading:** Automatically loads data from `public/tickets.csv` on startup.
- **CSV/Excel Support:** Use the provided conversion script or upload a custom CSV.
- **$50 Draws:** Conduct 7 individual draws for $50 prizes. Tickets are removed from the $50 pool once they win.
- **$810 Grand Prize:** A final draw using the entire master list of tickets (including previous winners).
- **Interactive UI:** Animated name shuffling, festive clover background, and celebratory confetti for the grand prize.
- **Run Development Server:**
  ```powershell
  npm run dev
  ```
- **Build for Production:**
  ```powershell
  npm run build
  ```

## Troubleshooting
- **CSV Parsing Errors:** Ensure your CSV has headers like "Guest name", "Which player are you supporting?", and "Ticket number".
- **Port Conflicts:** If `localhost:5173` is in use, Vite will automatically select the next available port.
- **Missing Data:** Check that `public/tickets.csv` exists and is populated.

## License
MIT License
