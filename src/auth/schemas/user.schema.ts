// User schema deprecated. Migrated to Firebase Firestore `users` collection.
export interface UserDocument {
  uid: string;
  email: string;
  name: string;
  role: string;
  status: string;
}
