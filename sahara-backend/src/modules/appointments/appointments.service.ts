import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateAppointmentDto) {
    return this.prisma.appointment.create({
      data: {
        userId: dto.userId,
        serviceType: dto.serviceType,
        date: new Date(dto.date),
      },
    });
  }

  findByUserId(userId: string) {
    return this.prisma.appointment.findMany({
      where: { userId },
      orderBy: { date: 'asc' },
    });
  }
}
