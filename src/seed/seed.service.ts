import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly firebaseService: FirebaseService) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  async seedAdminUser() {
    const adminEmail = 'admin@wtps.com';
    const adminPassword = 'Admin@123';
    const adminName = 'System Administrator';

    try {
      let uid: string;

      try {
        const existingUser = await this.firebaseService.auth.getUserByEmail(adminEmail);
        uid = existingUser.uid;
        this.logger.log(`Admin user ${adminEmail} already exists with UID: ${uid}`);
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          const newUserRecord = await this.firebaseService.auth.createUser({
            email: adminEmail,
            password: adminPassword,
            displayName: adminName,
          });
          uid = newUserRecord.uid;
          this.logger.log(`Created default Admin user ${adminEmail} with UID: ${uid}`);
        } else {
          this.logger.error(`Firebase Auth error: ${error.message}`);
          if (error.code === 'auth/configuration-not-found' || error.message.includes('configuration')) {
            this.logger.error('CRITICAL: Firebase Authentication is not enabled in your Firebase Console. Please go to the Firebase Console -> Authentication -> Get Started, and enable the Email/Password sign-in method.');
          }
          return; // Stop execution here if we can't create or get the user
        }
      }

      // Assign Admin role using setUserRole (sets custom claims & updates Firestore user profile)
      await this.firebaseService.setUserRole(uid, 'Admin');

      // Ensure complete user profile document in Firestore
      await this.firebaseService.db.collection('users').doc(uid).set(
        {
          uid,
          name: adminName,
          email: adminEmail,
          role: 'Admin',
          status: 'Approved',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        { merge: true },
      );

      this.logger.log(`Default Admin user (${adminEmail}) seeded successfully with role "Admin".`);
    } catch (error) {
      this.logger.error(`Failed to seed default Admin user: ${error.message}`);
    }
  }
}
