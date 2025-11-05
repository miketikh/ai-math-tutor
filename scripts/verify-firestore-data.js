/**
 * Script to verify the Firestore data structure for proficiency tracking
 * Run with: node scripts/verify-firestore-data.js <userId>
 */

const admin = require('firebase-admin');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

// Initialize Firebase Admin
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: privateKey,
    }),
  });
}

const db = admin.firestore();

async function verifyUserData(userId) {
  console.log('🔍 Fetching user document:', userId);
  console.log('');

  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    console.error('❌ User not found:', userId);
    return;
  }

  const userData = userDoc.data();

  console.log('✅ User document found!');
  console.log('');
  console.log('📋 User Profile:');
  console.log('  Email:', userData.email);
  console.log('  Display Name:', userData.displayName);
  console.log('  Grade Level:', userData.gradeLevel);
  console.log('');

  console.log('🎯 Skill Proficiency Data:');
  console.log('');

  const skillProficiency = userData.skillProficiency || {};
  const skillCount = Object.keys(skillProficiency).length;

  if (skillCount === 0) {
    console.log('  No skills tracked yet.');
  } else {
    console.log(`  Total skills tracked: ${skillCount}`);
    console.log('');

    for (const [skillId, proficiency] of Object.entries(skillProficiency)) {
      console.log(`  ${skillId}:`);
      console.log(`    Level: ${proficiency.level}`);
      console.log(`    Problems Solved: ${proficiency.problemsSolved}`);
      console.log(`    Success Count: ${proficiency.successCount}`);
      console.log(`    Success Rate: ${((proficiency.successCount / proficiency.problemsSolved) * 100).toFixed(1)}%`);

      if (proficiency.lastPracticed) {
        const timestamp = proficiency.lastPracticed.toDate
          ? proficiency.lastPracticed.toDate()
          : new Date(proficiency.lastPracticed);
        console.log(`    Last Practiced: ${timestamp.toISOString()}`);

        // Check if timestamp was updated recently (within last minute)
        const timeSinceUpdate = Date.now() - timestamp.getTime();
        if (timeSinceUpdate < 60000) {
          console.log(`    ✓ Recently updated (${Math.floor(timeSinceUpdate / 1000)}s ago)`);
        }
      }
      console.log('');
    }
  }

  console.log('📊 Summary by Level:');
  const byLevel = { unknown: 0, learning: 0, proficient: 0, mastered: 0 };
  for (const proficiency of Object.values(skillProficiency)) {
    byLevel[proficiency.level]++;
  }

  console.log(`  Unknown: ${byLevel.unknown}`);
  console.log(`  Learning: ${byLevel.learning}`);
  console.log(`  Proficient: ${byLevel.proficient}`);
  console.log(`  Mastered: ${byLevel.mastered}`);
}

const userId = process.argv[2];

if (!userId) {
  console.error('❌ Please provide a userId as an argument');
  console.log('Usage: node scripts/verify-firestore-data.js <userId>');
  process.exit(1);
}

verifyUserData(userId)
  .then(() => {
    console.log('\n✅ Verification complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error verifying user data:', error);
    process.exit(1);
  });
