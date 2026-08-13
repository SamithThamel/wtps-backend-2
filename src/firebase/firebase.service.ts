import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class FirebaseService implements OnModuleInit {
  private readonly logger = new Logger(FirebaseService.name);
  private firestoreDb: admin.firestore.Firestore;
  private authAdmin: admin.auth.Auth;
  private appInstance: admin.app.App;

  onModuleInit() {
    if (admin.apps.length === 0) {
      const serviceAccountPath = path.resolve(process.cwd(), 'firebase-service-account.json');

      try {
        if (fs.existsSync(serviceAccountPath)) {
          const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
          this.appInstance = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
          this.logger.log(`Firebase Admin initialized with firebase-service-account.json for project: ${serviceAccount.project_id || 'wtps-system'}`);
        } else if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
          const projectId = process.env.FIREBASE_PROJECT_ID || 'wtps-system';
          const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
          const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');

          this.appInstance = admin.initializeApp({
            credential: admin.credential.cert({
              projectId,
              clientEmail,
              privateKey,
            }),
          });
          this.logger.log(`Firebase Admin initialized with env service account for project: ${projectId}`);
        } else {
          const projectId = process.env.FIREBASE_PROJECT_ID || 'wtps-system';
          this.appInstance = admin.initializeApp({
            projectId,
          });
          this.logger.log(`Firebase Admin initialized with project ID: ${projectId}`);
        }
      } catch (error) {
        this.logger.warn(`Firebase Admin init notice: ${error.message}`);
      }
    } else {
      this.appInstance = admin.app();
    }

    this.firestoreDb = admin.firestore();
    this.authAdmin = admin.auth();
  }

  get db(): admin.firestore.Firestore {
    return this.firestoreDb;
  }

  get auth(): admin.auth.Auth {
    return this.authAdmin;
  }

  getAdminApp(): admin.app.App {
    return this.appInstance;
  }

  /**
   * Set custom user claims in Firebase Auth for RBAC
   * e.g., setCustomUserClaims(uid, { role: 'Operator' })
   */
  async setCustomUserClaims(uid: string, claims: Record<string, any>): Promise<void> {
    try {
      await this.authAdmin.setCustomUserClaims(uid, claims);
      this.logger.log(`Custom user claims set for user ${uid}: ${JSON.stringify(claims)}`);
    } catch (error) {
      this.logger.error(`Failed to set custom user claims for user ${uid}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Helper to set user role in both Firebase Auth custom claims and Firestore profile
   */
  async setUserRole(uid: string, role: string): Promise<void> {
    await this.setCustomUserClaims(uid, { role });
    const status = role === 'None' || role === 'Pending' ? 'Pending' : 'Approved';
    await this.firestoreDb.collection('users').doc(uid).set(
      {
        role,
        status,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );
  }
}
