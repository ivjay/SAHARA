import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreateByFirebaseUid(dto: CreateUserDto) {
    return this.prisma.user.upsert({
      where: { firebaseUid: dto.firebaseUid },
      update: {
        email: dto.email ?? undefined,
        phone: dto.phone ?? undefined,
        name: dto.name ?? undefined,
      },
      create: {
        firebaseUid: dto.firebaseUid,
        email: dto.email,
        phone: dto.phone,
        name: dto.name,
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByFirebaseUid(firebaseUid: string) {
    return this.prisma.user.findUnique({ where: { firebaseUid } });
  }

  async update(id: string, dto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: {
        email: dto.email ?? undefined,
        phone: dto.phone ?? undefined,
        name: dto.name ?? undefined,
      },
    });
  }
}
