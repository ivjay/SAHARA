import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  // Create appointment manually (useful for testing)
  @Post('create')
  create(@Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(dto);
  }

  // Fetch appointments for a user
  @Get('user/:id')
  getForUser(@Param('id') id: string) {
    return this.appointmentsService.findByUserId(id);
  }

  // Fetch all appointments (optional admin/test)
  @Get()
  getAll() {
    return this.appointmentsService.findAll();
  }
}
