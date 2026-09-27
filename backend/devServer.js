/**
 * devServer.js - Development server with MongoDB Memory Server
 * Use when no MongoDB is installed locally.
 * Run: node devServer.js
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';
dotenv.config();

// ── Start in-memory MongoDB first ─────────────────────────────────
const mongod = await MongoMemoryServer.create({
  instance: { port: 27018 }
});
const uri = mongod.getUri();
process.env.MONGO_URI = uri;
console.log(`[DevServer] MongoDB Memory Server running at: ${uri}`);

// ── Graceful shutdown ──────────────────────────────────────────────
const shutdown = async () => {
  console.log('\n[DevServer] Shutting down...');
  await mongod.stop();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// ── Start the Express app and auto-seed demo data ────────────────
import { seedDatabase } from './utils/seed.js';
await import('./server.js');

try {
  console.log('\n[DevServer] Auto-seeding in-memory database for demo...');
  await seedDatabase(false);
  console.log('[DevServer] Auto-seeding complete! Ready for demo.\n');
} catch (err) {
  console.warn('[DevServer] Auto-seed warning:', err.message);
}
