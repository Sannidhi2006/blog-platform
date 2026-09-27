/**
 * backend/utils/seed.js
 * Database Seeder for College Demonstration
 *
 * Clears existing database collections and reseeds:
 * - 1 Demo User (demo@example.com / Password123!)
 * - 6 High-quality posts across 6 distinct categories
 * - Real image files written directly into backend/uploads/
 * - Sample comments for interactive discussion demonstration
 *
 * Usage:
 *   npm run seed
 *   node utils/seed.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import User from '../models/User.js';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '..', 'uploads');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Base64 valid PNG images
const PNG_IMAGES = {
  tech: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNkYPj/nwEJwDiqkL4KAcAUCvfx4h/tAAAAAElFTkSuQmCC', 'base64'),
  prog: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNg+M/AwEAEZBxVSF+FAAlQAPd11+oXAAAAAElFTkSuQmCC', 'base64'),
  travel: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mNk+M9Qz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC', 'base64'),
  food: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8BQz0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC', 'base64'),
  lifestyle: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP4z8BQD0AEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC', 'base64'),
  photo: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVR42mP8z8DQwEAEYBxVSF+FABJADveWkH6oAAAAAElFTkSuQmCC', 'base64'),
};

async function connectDB() {
  const uris = [
    process.env.MONGO_URI,
    'mongodb://127.0.0.1:27018/', // Memory server fallback if running
    'mongodb://127.0.0.1:27017/blog-platform', // Local MongoDB fallback
  ].filter(Boolean);

  for (const uri of uris) {
    try {
      console.log(`[Seed] Attempting connection to: ${uri}...`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      console.log(`[Seed] Connected successfully to MongoDB at ${uri}`);
      return;
    } catch (err) {
      console.log(`[Seed] Connection to ${uri} failed (${err.message}). Trying next...`);
    }
  }

  throw new Error('Could not connect to any MongoDB instance. Ensure MongoDB is running.');
}

async function seedDatabase(disconnectOnComplete = false) {
  console.log('\n======================================================');
  console.log('   BLOG PLATFORM - DATABASE SEEDING FOR COLLEGE DEMO  ');
  console.log('======================================================\n');

  await connectDB();

  // Ensure uploads directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // 1. Clear existing collections
  console.log('[Seed] Clearing existing Users, Posts, and Comments...');
  await User.deleteMany({});
  await Post.deleteMany({});
  await Comment.deleteMany({});
  console.log('[Seed] Database collections cleared.\n');

  // 2. Create Demo User
  console.log('[Seed] Creating demo author user...');
  const demoUser = await User.create({
    name: 'Demo Student',
    username: 'demo_user',
    email: 'demo@example.com',
    password: 'Password123!',
  });
  console.log(`[Seed] Demo user created: ID ${demoUser._id}`);

  // Also create a second user for commenting demo
  const communityUser = await User.create({
    name: 'Sarah Connor',
    username: 'sarah_reviewer',
    email: 'sarah@example.com',
    password: 'Password123!',
  });
  console.log(`[Seed] Reviewer user created: ID ${communityUser._id}\n`);

  // 3. Write real image files to uploads directory
  console.log('[Seed] Writing real image files to backend/uploads/...');
  const imageFiles = {
    tech: 'demo-tech.jpg',
    prog: 'demo-programming.jpg',
    travel: 'demo-travel.jpg',
    food: 'demo-food.jpg',
    lifestyle: 'demo-lifestyle.jpg',
    photo: 'demo-photography.jpg',
  };

  const seedAssetsDir = path.join(__dirname, '..', 'seed_assets');

  for (const [key, filename] of Object.entries(imageFiles)) {
    const destJpg = path.join(uploadsDir, filename);
    const destPng = path.join(uploadsDir, filename.replace('.jpg', '.png'));
    const assetSrc = path.join(seedAssetsDir, filename);

    if (fs.existsSync(assetSrc)) {
      const data = fs.readFileSync(assetSrc);
      fs.writeFileSync(destJpg, data);
      fs.writeFileSync(destPng, data);
    } else if (PNG_IMAGES[key]) {
      fs.writeFileSync(destPng, PNG_IMAGES[key]);
    }
  }
  console.log('[Seed] High-resolution blog photos placed in backend/uploads/.\n');

  // 4. Sample Posts across 6 categories
  console.log('[Seed] Creating 6 sample blog posts across 6 categories...');
  const samplePosts = [
    {
      title: 'The Rise of Edge Computing and Serverless Architecture',
      category: 'Technology',
      content: `Edge computing is transforming distributed computing by bringing computation and data storage closer to the sources of data. This improves response times and saves bandwidth.

In modern cloud solutions, deploying compute workers to globally distributed edge nodes reduces latency from hundreds of milliseconds to under 20ms. In this article, we examine how edge caching, edge functions, and distributed microservices form the backbone of next-generation web applications.`,
      image: imageFiles.tech,
      author: demoUser._id,
    },
    {
      title: 'Mastering Clean Code in Modern Full-Stack JavaScript',
      category: 'Programming',
      content: `Writing clean code isn't just about making your code readable—it's about building software that is maintainable, testable, and resilient to change.

Key takeaways for senior developers:
1. Meaningful names: Avoid generic identifiers.
2. Single Responsibility: Every module, controller, and hook should do one thing well.
3. Immutability & Pure Functions: Prevent side effects and state bugs.
4. Robust Error Handling: Never silently swallow errors; always provide descriptive feedback.`,
      image: imageFiles.prog,
      author: demoUser._id,
    },
    {
      title: 'Remote Work in the Alps: A Digital Nomad Guide for 2026',
      category: 'Travel',
      content: `Working remotely while surrounded by snow-capped peaks sounds like a dream, but with proper planning, it is completely achievable.

From Switzerland to Northern Italy, high-speed fiber internet and alpine coworking spaces have turned mountain valleys into vibrant hubs for creators and software engineers. Here is everything you need to know regarding visas, connectivity, gear, and budget planning.`,
      image: imageFiles.travel,
      author: demoUser._id,
    },
    {
      title: 'The Art of Slow Fermentation: Crafting Sourdough at Home',
      category: 'Food',
      content: `Baking sourdough is as much a science as it is an art. With just flour, water, salt, and wild yeast culture, natural fermentation creates complex aromas, distinct tangy flavors, and an irresistible open crumb.

We explore hydration percentages, autolyse techniques, and temperature control to help you achieve artisan-bakery quality loaves in your home kitchen.`,
      image: imageFiles.food,
      author: demoUser._id,
    },
    {
      title: 'Digital Minimalism for High-Output Software Creators',
      category: 'Lifestyle',
      content: `In an era of relentless notifications, continuous context switching has become the number one killer of creative and analytical focus.

Digital minimalism is not about abandoning technology—it is about intentionality. By defining explicit communication windows, ruthless notification hygiene, and dedicated deep-work blocks, you can double your output while dramatically reducing daily stress.`,
      image: imageFiles.lifestyle,
      author: demoUser._id,
    },
    {
      title: 'Mastering Natural Lighting in Urban Street Photography',
      category: 'Photography',
      content: `Street photography is about capturing fleeting, authentic human moments within architectural landscapes.

Understanding how directional sunlight, deep city shadows, and golden hour reflections interact with street geometry allows photographers to transform ordinary urban intersections into cinematic frames. Here are the core aperture, shutter, and compositional strategies to elevate your work.`,
      image: imageFiles.photo,
      author: demoUser._id,
    },
  ];

  const createdPosts = await Post.insertMany(samplePosts);
  console.log(`[Seed] Created ${createdPosts.length} posts successfully.\n`);

  // 5. Add Sample Comments for Demo Interactivity
  console.log('[Seed] Adding sample comments to posts...');
  const comments = [
    {
      content: 'Incredible guide! The points on edge caching and response latency are spot on.',
      author: communityUser._id,
      post: createdPosts[0]._id,
    },
    {
      content: 'Clean code principles have saved my team weeks of debugging. Great breakdown!',
      author: communityUser._id,
      post: createdPosts[1]._id,
    },
    {
      content: 'The autolyse tip changed everything for my bread baking. Thank you!',
      author: communityUser._id,
      post: createdPosts[3]._id,
    },
  ];
  await Comment.insertMany(comments);
  console.log(`[Seed] Created ${comments.length} sample comments.\n`);

  console.log('======================================================');
  console.log('            DATABASE SEEDING COMPLETE!               ');
  console.log('======================================================');
  console.log('Demo Credentials for College Presentation:');
  console.log('  • Email:    demo@example.com');
  console.log('  • Username: demo_user');
  console.log('  • Password: Password123!');
  console.log('------------------------------------------------------');
  console.log('Reviewer Credentials (for multi-user testing):');
  console.log('  • Email:    sarah@example.com');
  console.log('  • Username: sarah_reviewer');
  console.log('  • Password: Password123!');
  console.log('======================================================\n');

  if (disconnectOnComplete) {
    await mongoose.disconnect();
    process.exit(0);
  }
}

export { seedDatabase };

const isDirectRun = process.argv[1] && process.argv[1].replace(/\\/g, '/').endsWith('utils/seed.js');
if (isDirectRun) {
  seedDatabase(true).catch((err) => {
    console.error('\n❌ Seeding failed:', err);
    process.exit(1);
  });
}
