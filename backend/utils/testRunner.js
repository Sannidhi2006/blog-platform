/**
 * Test runner — uses mongodb-memory-server so no local MongoDB install needed.
 * Run:  node utils/testRunner.js
 */
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ──── Minimal HTTP request helper (uses built-in fetch, Node 18+) ────────────

const BASE = `http://localhost:5000`;

async function req(method, url, body, token, form) {
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let bodyInit;
  if (form) {
    bodyInit = form; // FormData
    // Don't set Content-Type — let fetch set multipart boundary
  } else if (body) {
    headers['Content-Type'] = 'application/json';
    bodyInit = JSON.stringify(body);
  }

  const r = await fetch(`${BASE}${url}`, { method, headers, body: bodyInit });
  let json;
  try { json = await r.json(); } catch { json = {}; }
  return { status: r.status, json };
}

function print(label, { status, json }) {
  const ok = status < 400 ? '✅' : '❌';
  console.log(`\n${ok} [${status}] ${label}`);
  console.log(JSON.stringify(json, null, 2));
}

// ──── Bootstrap in-memory MongoDB ────────────────────────────────────────────

let mongod;

async function startMongo() {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  process.env.MONGO_URI = uri;
  console.log(`\n🟢 MongoDB Memory Server started: ${uri}`);
  // Wait for the actual app server to restart with new URI
  // (server already running — patch mongoose connection directly)
  await mongoose.disconnect();
  await mongoose.connect(uri);
  console.log('🔌 Mongoose reconnected to in-memory MongoDB');
}

async function stopMongo() {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
  console.log('\n🔴 MongoDB Memory Server stopped');
}

// ──── Test suite ─────────────────────────────────────────────────────────────

async function run() {
  await startMongo();

  let token1, token2, userId1, userId2, postId, commentId, postImageFile;

  console.log('\n══════════════════════════════════════════');
  console.log('  BLOG PLATFORM — ENDPOINT TEST SUITE');
  console.log('══════════════════════════════════════════');

  // ── 1. REGISTER ─────────────────────────────────────────────────
  console.log('\n▶▶ AUTH TESTS');

  let r = await req('POST', '/api/auth/register', {
    name: 'Alice Dev',
    username: 'alicedev',
    email: 'alice@example.com',
    password: 'secret123',
    confirmPassword: 'secret123',
  });
  print('Register user 1 (Alice)', r);
  token1 = r.json?.token;
  userId1 = r.json?.user?._id;

  // Register user 2
  r = await req('POST', '/api/auth/register', {
    name: 'Bob Writer',
    username: 'bobwriter',
    email: 'bob@example.com',
    password: 'pass4567',
    confirmPassword: 'pass4567',
  });
  print('Register user 2 (Bob)', r);
  token2 = r.json?.token;
  userId2 = r.json?.user?._id;

  // Duplicate email rejection
  r = await req('POST', '/api/auth/register', {
    name: 'Alice Clone',
    username: 'aliceclone',
    email: 'alice@example.com',
    password: 'secret123',
    confirmPassword: 'secret123',
  });
  print('Register duplicate email (expect 409)', r);

  // Password mismatch
  r = await req('POST', '/api/auth/register', {
    name: 'Ghost',
    username: 'ghostuser',
    email: 'ghost@example.com',
    password: 'abc123',
    confirmPassword: 'wrongpass',
  });
  print('Register password mismatch (expect 400)', r);

  // Login with email
  r = await req('POST', '/api/auth/login', { identifier: 'alice@example.com', password: 'secret123' });
  print('Login Alice by email', r);

  // Login with username
  r = await req('POST', '/api/auth/login', { identifier: 'alicedev', password: 'secret123' });
  print('Login Alice by username', r);

  // Login wrong password
  r = await req('POST', '/api/auth/login', { identifier: 'alice@example.com', password: 'wrongpassword' });
  print('Login wrong password (expect 401)', r);

  // GET /me
  r = await req('GET', '/api/auth/me', null, token1);
  print('GET /me — Alice (protected)', r);

  // GET /me without token
  r = await req('GET', '/api/auth/me', null, null);
  print('GET /me no token (expect 401)', r);

  // ── 2. POSTS ─────────────────────────────────────────────────────
  console.log('\n▶▶ POST TESTS');

  // Create a small test image in uploads
  const imgPath = path.join(__dirname, '..', 'uploads', 'test-image.jpg');
  // Create a minimal valid JPEG (smallest possible JFIF)
  const minJpeg = Buffer.from([
    0xFF,0xD8,0xFF,0xE0,0x00,0x10,0x4A,0x46,0x49,0x46,0x00,0x01,
    0x01,0x00,0x00,0x01,0x00,0x01,0x00,0x00,0xFF,0xDB,0x00,0x43,
    0x00,0x08,0x06,0x06,0x07,0x06,0x05,0x08,0x07,0x07,0x07,0x09,
    0x09,0x08,0x0A,0x0C,0x14,0x0D,0x0C,0x0B,0x0B,0x0C,0x19,0x12,
    0x13,0x0F,0x14,0x1D,0x1A,0x1F,0x1E,0x1D,0x1A,0x1C,0x1C,0x20,
    0x24,0x2E,0x27,0x20,0x22,0x2C,0x23,0x1C,0x1C,0x28,0x37,0x29,
    0x2C,0x30,0x31,0x34,0x34,0x34,0x1F,0x27,0x39,0x3D,0x38,0x32,
    0x3C,0x2E,0x33,0x34,0x32,0xFF,0xC0,0x00,0x0B,0x08,0x00,0x01,
    0x00,0x01,0x01,0x01,0x11,0x00,0xFF,0xC4,0x00,0x1F,0x00,0x00,
    0x01,0x05,0x01,0x01,0x01,0x01,0x01,0x01,0x00,0x00,0x00,0x00,
    0x00,0x00,0x00,0x00,0x01,0x02,0x03,0x04,0x05,0x06,0x07,0x08,
    0x09,0x0A,0x0B,0xFF,0xC4,0x00,0xB5,0x10,0x00,0x02,0x01,0x03,
    0x03,0x02,0x04,0x03,0x05,0x05,0x04,0x04,0x00,0x00,0x01,0x7D,
    0x01,0x02,0x03,0x00,0x04,0x11,0x05,0x12,0x21,0x31,0x41,0x06,
    0x13,0x51,0x61,0x07,0x22,0x71,0x14,0x32,0x81,0x91,0xA1,0x08,
    0x23,0x42,0xB1,0xC1,0x15,0x52,0xD1,0xF0,0x24,0x33,0x62,0x72,
    0x82,0x09,0x0A,0x16,0x17,0x18,0x19,0x1A,0x25,0x26,0x27,0x28,
    0xFF,0xDA,0x00,0x08,0x01,0x01,0x00,0x00,0x3F,0x00,0xFB,0xD9,
  ]);
  fs.writeFileSync(imgPath, minJpeg);

  // Create post with image (Alice)
  const form1 = new FormData();
  form1.append('title', 'My First Tech Article');
  form1.append('content', 'This is a detailed article about Node.js and MongoDB integration in a MERN stack project.');
  form1.append('category', 'Technology');
  const blob = new Blob([minJpeg], { type: 'image/jpeg' });
  form1.append('image', blob, 'test-image.jpg');

  r = await req('POST', '/api/posts', null, token1, form1);
  print('Create post with image (Alice, protected)', r);
  postId = r.json?.post?._id;
  postImageFile = r.json?.post?.image;

  // Create another post (Bob)
  const form2 = new FormData();
  form2.append('title', 'Programming Tips for Beginners');
  form2.append('content', 'These programming tips will help beginners learn JavaScript faster and more efficiently.');
  form2.append('category', 'Programming');
  r = await req('POST', '/api/posts', null, token2, form2);
  print('Create second post (Bob, no image)', r);

  // Create post no auth (expect 401)
  r = await req('POST', '/api/posts', null, null, (() => { const f = new FormData(); f.append('title','t'); f.append('content','content here'); f.append('category','Other'); return f; })());
  print('Create post without token (expect 401)', r);

  // GET all posts
  r = await req('GET', '/api/posts');
  print('GET /api/posts (list, newest first)', r);

  // GET /search?q=
  r = await req('GET', '/api/posts/search?q=programming');
  print('GET /api/posts/search?q=programming', r);

  // GET /search?category=
  r = await req('GET', '/api/posts/search?category=Technology');
  print('GET /api/posts/search?category=Technology', r);

  // GET /search?q=&category=
  r = await req('GET', '/api/posts/search?q=tips&category=Programming');
  print('GET /api/posts/search?q=tips&category=Programming', r);

  // GET /:id
  r = await req('GET', `/api/posts/${postId}`);
  print(`GET /api/posts/${postId}`, r);

  // GET invalid ID
  r = await req('GET', '/api/posts/invalid-id-xyz');
  print('GET /api/posts/invalid-id (expect 400)', r);

  // ── 3. COMMENTS ─────────────────────────────────────────────────
  console.log('\n▶▶ COMMENT TESTS');

  r = await req('POST', `/api/comments/${postId}`, { content: 'Great article Alice! Very informative.' }, token2);
  print('POST comment on Alice post (Bob)', r);
  commentId = r.json?.comment?._id;

  r = await req('POST', `/api/comments/${postId}`, { content: 'Thanks Bob, glad you liked it!' }, token1);
  print('POST comment on own post (Alice)', r);

  r = await req('GET', `/api/comments/${postId}`);
  print(`GET /api/comments/${postId}`, r);

  // Unauthorized comment delete (Alice tries to delete Bob's comment)
  r = await req('DELETE', `/api/comments/${commentId}`, null, token1);
  print("DELETE Bob's comment as Alice (expect 403)", r);

  // Authorized delete (Bob deletes his own comment)
  r = await req('DELETE', `/api/comments/${commentId}`, null, token2);
  print("DELETE Bob's comment as Bob (expect 200)", r);

  // ── 4. USERS ─────────────────────────────────────────────────────
  console.log('\n▶▶ USER TESTS');

  r = await req('GET', `/api/users/${userId1}`);
  print(`GET /api/users/${userId1} (Alice — no password field)`, r);

  r = await req('GET', `/api/users/${userId1}/posts`);
  print(`GET /api/users/${userId1}/posts`, r);

  // ── 5. UPDATE / DELETE POSTS ──────────────────────────────────────
  console.log('\n▶▶ POST UPDATE / DELETE TESTS');

  // Update Alice's post (by Alice)
  const formUpdate = new FormData();
  formUpdate.append('title', 'My Updated Tech Article');
  formUpdate.append('content', 'Updated content with even more information about Node.js, Express, and MongoDB.');
  r = await req('PUT', `/api/posts/${postId}`, null, token1, formUpdate);
  print('PUT /api/posts/:id (Alice updates her own post)', r);

  // Bob tries to delete Alice's post (expect 403)
  r = await req('DELETE', `/api/posts/${postId}`, null, token2);
  print("DELETE Alice's post as Bob (expect 403)", r);

  // Alice deletes her own post (expect 200)
  r = await req('DELETE', `/api/posts/${postId}`, null, token1);
  print("DELETE Alice's post as Alice (expect 200)", r);

  // Post should be gone now
  r = await req('GET', `/api/posts/${postId}`);
  print('GET deleted post (expect 404)', r);

  // ── 6. IMAGE TYPE REJECTION ───────────────────────────────────────
  console.log('\n▶▶ FILE VALIDATION TESTS');

  const formBadFile = new FormData();
  formBadFile.append('title', 'Bad image post');
  formBadFile.append('content', 'This has a PDF attached instead of an image file.');
  formBadFile.append('category', 'Other');
  formBadFile.append('image', new Blob(['%PDF-1.4 fake content'], { type: 'application/pdf' }), 'fake.pdf');
  r = await req('POST', '/api/posts', null, token1, formBadFile);
  print('POST with PDF file (expect 400 bad file type)', r);

  console.log('\n══════════════════════════════════════════');
  console.log('  ALL TESTS COMPLETE');
  console.log('══════════════════════════════════════════\n');

  // Cleanup test image
  try { fs.unlinkSync(imgPath); } catch {}

  await stopMongo();
  process.exit(0);
}

run().catch((err) => {
  console.error('Test runner crashed:', err);
  process.exit(1);
});
