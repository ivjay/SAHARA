// src/modules/auth/auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {
    // Initialize Firebase Admin only once
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        // If needed later: projectId, etc.
      });
    }
  }

  async validateFirebaseToken(idToken: string) {
    try {
      const decoded = await admin.auth().verifyIdToken(idToken);

      const firebaseUid = decoded.uid;
      const email = decoded.email ?? null;
      const phone = decoded.phone_number ?? null;
      const name =
        decoded.name ??
        decoded.email?.split('@')[0] ??
        null;

      const user = await this.usersService.createOrUpdateFromFirebase({
        firebaseUid,
        email,
        phone,
        name,
      });

      // You can return the full user or a sanitized version
      return {
        id: user.id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        phone: user.phone,
        name: user.name,
      };
    } catch (err) {
      console.error('Firebase token verification failed:', err);
      throw new UnauthorizedException('Invalid Firebase ID token');
    }
  }
}
