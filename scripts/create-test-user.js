/**
 * Script to create a test user in Firestore for proficiency tracking tests
 * Run with: node scripts/create-test-user.js
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

async function createTestUser() {
  const testUserId = 'test-user-proficiency-' + Date.now();

  const userRef = db.collection('users').doc(testUserId);

  const testUser = {
    email: 'test@example.com',
    displayName: 'Test User',
    gradeLevel: '8',
    focusTopics: ['algebra'],
    interests: ['math', 'science'],
    skillProficiency: {},
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastActive: admin.firestore.FieldValue.serverTimestamp(),
  };

  await userRef.set(testUser);

  console.log('✅ Created test user with ID:', testUserId);
  console.log('📋 User data:', JSON.stringify(testUser, null, 2));

  return testUserId;
}

createTestUser()
  .then((userId) => {
    console.log('\n🎉 Test user created successfully!');
    console.log('\n📝 Use this userId for testing:');
    console.log(userId);
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error creating test user:', error);
    process.exit(1);
  });
