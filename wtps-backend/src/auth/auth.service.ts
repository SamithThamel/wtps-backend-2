import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { RegisterDto } from './dto/register.dto';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  phoneNumber?: string;
  createdAt: string;
  updatedAt?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(private readonly firebaseService: FirebaseService) {}

  async registerUser(dto: RegisterDto, customUid?: string): Promise<UserProfile> {
    let uid = customUid;

    if (!uid) {
      try {
        const userRecord = await this.firebaseService.auth.createUser({
          email: dto.email,
          password: dto.password,
          displayName: dto.name,
        });
        uid = userRecord.uid;
      } catch (error: any) {
        if (error.code === 'auth/email-already-exists') {
          const userRecord = await this.firebaseService.auth.getUserByEmail(dto.email);
          uid = userRecord.uid;
        } else {
          this.logger.error(`Firebase Auth creation failed: ${error.message}`);
          throw new BadRequestException(error.message);
        }
      }
    }

    const newUser: UserProfile = {
      uid,
      name: dto.name,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      role: 'None', // Initial status must be Pending / Role None
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    await this.firebaseService.db.collection('users').doc(uid).set(newUser, { merge: true });
    return newUser;
  }

  async syncUser(uid: string, name: string, email: string): Promise<UserProfile> {
    const docRef = this.firebaseService.db.collection('users').doc(uid);
    const doc = await docRef.get();

    if (doc.exists) {
      return doc.data() as UserProfile;
    }

    const newUser: UserProfile = {
      uid,
      name: name || email.split('@')[0],
      email,
      role: 'None',
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    await docRef.set(newUser);
    return newUser;
  }

  async getMe(uid: string): Promise<UserProfile> {
    const doc = await this.firebaseService.db.collection('users').doc(uid).get();
    if (!doc.exists) {
      throw new NotFoundException('User profile not found.');
    }
    return doc.data() as UserProfile;
  }

  async getAllUsers(): Promise<UserProfile[]> {
    const snapshot = await this.firebaseService.db.collection('users').get();
    const users: UserProfile[] = [];
    snapshot.forEach((doc) => {
      users.push(doc.data() as UserProfile);
    });
    return users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async updateUserRole(targetUid: string, newRole: string): Promise<UserProfile> {
    const docRef = this.firebaseService.db.collection('users').doc(targetUid);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new NotFoundException(`User with ID ${targetUid} not found.`);
    }

    // Set custom user claim in Firebase Auth & update Firestore user document
    await this.firebaseService.setUserRole(targetUid, newRole);

    const updated = await docRef.get();
    return updated.data() as UserProfile;
  }
}
