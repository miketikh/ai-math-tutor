/**
 * One-time script to upload skill graph to Firestore
 * Run with: npx tsx scripts/uploadSkillGraph.ts
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

initializeApp({
  credential: cert({
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: privateKey,
  }),
});

const db = getFirestore();

async function uploadSkillGraph() {
  try {
    console.log('Reading skill graph from file...');
    const skillGraphPath = path.join(process.cwd(), 'data', 'skillGraph.json');
    const skillGraphData = JSON.parse(fs.readFileSync(skillGraphPath, 'utf-8'));

    console.log('Uploading to Firestore...');
    await db.collection('config').doc('skillGraph').set(skillGraphData);

    console.log('✅ Skill graph uploaded successfully!');
    console.log(`   - ${Object.keys(skillGraphData.skills).length} skills uploaded`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error uploading skill graph:', error);
    process.exit(1);
  }
}

uploadSkillGraph();
