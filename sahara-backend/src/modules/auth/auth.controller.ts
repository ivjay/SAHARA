// src/modules/auth/auth.controller.ts
import { Controller, Get, Req, UseGuards } from '@nestjs/common';

import { FirebaseAuthGuard } from '../../common/guards/firebase-auth.guard';

@Controller('auth')
export class AuthController {
  @UseGuards(FirebaseAuthGuard)
  @Get('me')
  getMe(@Req() req: any) {
    // req.user is set by FirebaseAuthStrategy#validate
    return req.user;
  }
}
