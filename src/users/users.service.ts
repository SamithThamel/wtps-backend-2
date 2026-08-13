import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class UsersService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async findAll() {
    const snapshot = await this.firebaseService.db.collection('users').get();
    const users: any[] = [];
    snapshot.forEach((doc) => users.push(doc.data()));
    return users;
  }

  async findOne(uid: string) {
    const doc = await this.firebaseService.db.collection('users').doc(uid).get();
    if (!doc.exists) {
      throw new NotFoundException('User not found.');
    }
    return doc.data();
  }

  async updateRole(uid: string, role: string) {
    const docRef = this.firebaseService.db.collection('users').doc(uid);
    const doc = await docRef.get();
    if (!doc.exists) {
      throw new NotFoundException('User not found.');
    }
    const status = role === 'None' || role === 'Pending' ? 'Pending' : 'Approved';
    await docRef.update({ role, status, updatedAt: new Date().toISOString() });
    const updated = await docRef.get();
    return updated.data();
  }
}
