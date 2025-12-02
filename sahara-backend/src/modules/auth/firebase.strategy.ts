// src/modules/auth/firebase.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { AuthService } from './auth.service';

@Injectable()
export class FirebaseAuthStrategy extends PassportStrategy(
  BearerStrategy,
  'firebase-auth',
) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(token: string): Promise<any> {
    // token is the Bearer token from Authorization header
    const user = await this.authService.validateFirebaseToken(token);
    return user; // attached to req.user
  }
}
