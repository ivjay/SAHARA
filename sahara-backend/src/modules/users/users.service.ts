import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma.service';



@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany();
  }

  findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByFirebaseUid(firebaseUid: string) {
    return this.prisma.user.findUnique({ where: { firebaseUid } });
  }

  async createOrUpdateFromFirebase(data: {
    firebaseUid: string;
    email?: string | null;
    phone?: string | null;
    name?: string | null;
  }) {
    const { firebaseUid, email, phone, name } = data;

    return this.prisma.user.upsert({
      where: { firebaseUid },
      update: { email, phone, name },
      create: { firebaseUid, email, phone, name },
    });
  }
}
