// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { FirebaseAuthStrategy } from './firebase.strategy';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'firebase-auth' }),
    UsersModule,
  ],
  providers: [AuthService, FirebaseAuthStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
