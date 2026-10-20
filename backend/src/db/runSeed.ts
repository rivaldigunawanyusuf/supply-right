import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { AppDatabase } from './database.js';
import { seedDatabase } from './seed.js';

// Load env
dotenv.config();
const parentEnv = path.resolve(process.cwd(), '../.env');
if (fs.existsSync(parentEnv)) {
  dotenv.config({ path: parentEnv });
}

const isForce = process.argv.includes('--force') || process.argv.includes('--reset');

console.log('======================================================');
console.log(' SupplyRight AI — Database Seed & Initialization CLI');
console.log('======================================================');

const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), 'data', 'supplyright.db');
console.log(`Database target path: ${dbPath}`);

if (isForce && fs.existsSync(dbPath)) {
  console.log('⚠️ --reset flag detected: Deleting previous database file to re-seed cleanly...');
  try {
    fs.unlinkSync(dbPath);
    // Also remove WAL / SHM files if present
    if (fs.existsSync(`${dbPath}-wal`)) fs.unlinkSync(`${dbPath}-wal`);
    if (fs.existsSync(`${dbPath}-shm`)) fs.unlinkSync(`${dbPath}-shm`);
    console.log('✓ Previous database removed.');
  } catch (err: any) {
    console.warn(`Could not delete db file: ${err.message}`);
  }
}

const db = new AppDatabase(dbPath);
seedDatabase(db);

const users = db.getAllUsers();
const orders = db.getAllPurchaseOrders();

console.log('\n[SUCCESS] Seed check completed!');
console.log(`• Users (${users.length}):`);
users.forEach(u => console.log(`   - [${u.role}] ${u.name} (${u.email})`));

console.log(`\n• Purchase Orders (${orders.length}):`);
orders.forEach(o => console.log(`   - ${o.id}: ${o.product_spec.slice(0, 45)}... [${o.status}]`));

console.log('\nDatabase is 100% ready for autonomous settlement & role operations.\n');
process.exit(0);
