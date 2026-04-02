import fs from "node:fs";
import path from "node:path";

const dbPath = path.join(process.cwd(), "data", "cardpulse.db");

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log("Removed existing database:", dbPath);
} else {
  console.log("No existing database found at:", dbPath);
}

console.log("Start the app again to auto-seed fresh sample data.");
