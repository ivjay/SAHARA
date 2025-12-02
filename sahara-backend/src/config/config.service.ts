import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private readonly config: NestConfigService) {}

  get nodeEnv(): string {
    return this.config.get<string>('NODE_ENV') ?? 'development';
  }

  get port(): number {
    const value = this.config.get<string>('PORT');
    return value ? parseInt(value, 10) : 3000;
  }

  get databaseUrl(): string {
    const value = this.config.get<string>('DATABASE_URL');
    if (!value) {
      throw new Error('DATABASE_URL is not set');
    }
    return value;
  }

  // later: firebase config, LLM keys, 3rd party API URLs, etc.
}
