import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

async function deleteUser(uid: string) {
  const serviceAccountPath = path.resolve(process.cwd(), 'firebase-service-account.json');
  if (!fs.existsSync(serviceAccountPath)) {
    console.error('Service account not found at', serviceAccountPath);
    process.exit(1);
  }

  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }

  try {
    console.log(`Attempting to delete user ${uid} from Auth...`);
    await admin.auth().deleteUser(uid);
    console.log(`Successfully deleted user ${uid} from Firebase Auth.`);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      console.log(`User ${uid} not found in Firebase Auth.`);
    } else {
      console.error('Error deleting user from Auth:', error.message);
    }
  }

  try {
    console.log(`Attempting to delete user ${uid} from Firestore...`);
    await admin.firestore().collection('users').doc(uid).delete();
    console.log(`Successfully deleted user document ${uid} from Firestore.`);
  } catch (error: any) {
    console.error('Error deleting user from Firestore:', error.message);
  }

  process.exit(0);
}

const uid = process.argv[2];
if (!uid) {
  console.error('Please provide a UID to delete. Usage: ts-node delete-user.ts <uid>');
  process.exit(1);
}

deleteUser(uid);
