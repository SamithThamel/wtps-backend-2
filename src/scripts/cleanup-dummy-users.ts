import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

async function cleanupDummyUsers() {
  const serviceAccountPath = path.resolve(__dirname, '../../firebase-service-account.json');

  if (!fs.existsSync(serviceAccountPath)) {
    console.error(`Error: Service account file not found at ${serviceAccountPath}`);
    process.exit(1);
  }

  const serviceAccount = require(serviceAccountPath);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  const db = admin.firestore();
  
  console.log('Fetching users from Firestore...');
  const usersSnapshot = await db.collection('users').get();
  
  let deletedCount = 0;

  for (const doc of usersSnapshot.docs) {
    if (doc.id.startsWith('user_')) {
      console.log(`Deleting dummy user document: ${doc.id}`);
      await db.collection('users').doc(doc.id).delete();
      deletedCount++;
    }
  }

  console.log(`\nCleanup complete! Deleted ${deletedCount} dummy user records.`);
  process.exit(0);
}

cleanupDummyUsers().catch(console.error);
