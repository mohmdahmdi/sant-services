import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

export interface AppointmentWithDetails {
  appointment_id: string;
  scheduled_at: string;
  status: string;
  payment_status: string;
  service_id: string;
  service_title: string;
  price: number;
  beautician_id: string;
  beautician_name: string;
  business_id: string;
  business_name: string;
}

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    private dataSource: DataSource,
  ) {}

  async create(dto: CreateAppointmentDto): Promise<Appointment> {
    try {
      const appointment = this.appointmentRepository.create({
        ...dto,
        status: dto.status || 'pending',
        paymentStatus: dto.payment_status || 'unpaid',
      });
      return await this.appointmentRepository.save(appointment);
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw new InternalServerErrorException('Failed to create appointment');
    }
  }

  async findAll(): Promise<Appointment[]> {
    return await this.appointmentRepository.find({
      relations: ['customer', 'beautician', 'service'],
    });
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['customer', 'beautician', 'service'],
    });
    if (!appointment) {
      throw new NotFoundException(`Appointment with id ${id} not found`);
    }
    return appointment;
  }

  async update(id: string, dto: UpdateAppointmentDto): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOneBy({ id });
    if (!appointment) {
      throw new NotFoundException(`Appointment with id ${id} not found`);
    }

    if (dto.payment_status !== undefined) {
      appointment.paymentStatus = dto.payment_status;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      delete (dto as any).payment_status;
    }

    Object.assign(appointment, dto);
    return await this.appointmentRepository.save(appointment);
  }

  async remove(id: string): Promise<void> {
    const result = await this.appointmentRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Appointment with id ${id} not found`);
    }
  }

  async search(term: string): Promise<Appointment[]> {
    return await this.appointmentRepository
      .createQueryBuilder('a')
      .where('a.status ILIKE :term', { term: `%${term}%` })
      .orWhere('a.paymentStatus ILIKE :term', { term: `%${term}%` })
      .getMany();
  }

  async getAppointmentsByCustomerId(
    customerId: string,
  ): Promise<AppointmentWithDetails[]> {
    const query = `
      SELECT a.id AS appointment_id,
             a.scheduled_at,
             a.status,
             a.payment_status,
             s.id AS service_id,
             s.title AS service_title,
             s.price,
             b.id AS beautician_id,
             u.full_name AS beautician_name,
             biz.id AS business_id,
             biz.name AS business_name
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      JOIN beauticians b ON a.beautician_id = b.id
      JOIN users u ON b.user_id = u.id
      JOIN businesses biz ON s.business_id = biz.id
      WHERE a.customer_id = $1
      ORDER BY a.scheduled_at DESC;
    `;

    const result = await this.dataSource.query<AppointmentWithDetails[]>(
      query,
      [customerId],
    );
    return result.map((row) => ({
      ...row,
      price: typeof row.price === 'string' ? parseFloat(row.price) : row.price,
    }));
  }

  async getActiveCustomers() {
    interface ActiveCustomersResult {
      active_customers: string;
    }

    const result = await this.dataSource.query<ActiveCustomersResult[]>(
      `
        SELECT COUNT(DISTINCT customer_id)::text AS active_customers
        FROM appointments
        WHERE status IN ('confirmed', 'completed')
      `,
    );

    return {
      total_customers: parseInt(result[0]?.active_customers || '0', 10),
    };
  }

  async getAverageAppointmentsPerCustomer() {
    interface AvgAppointmentsResult {
      customer_id: string;
      appointments_count: string;
    }

    const result = await this.dataSource.query<AvgAppointmentsResult[]>(
      `
        SELECT customer_id, COUNT(*)::text AS appointments_count
        FROM appointments
        GROUP BY customer_id
      `,
    );

    return result.map((row) => ({
      customer_id: row.customer_id,
      appointments_count: parseInt(row.appointments_count, 10),
    }));
  }

  async getAppointmentsByStatus() {
    interface StatusCountResult {
      status: string;
      count: string;
    }

    const result = await this.dataSource.query<StatusCountResult[]>(
      `
        SELECT status, COUNT(*)::text AS count
        FROM appointments
        GROUP BY status
      `,
    );

    return result.map((row) => ({
      status: row.status,
      count: parseInt(row.count, 10),
    }));
  }

  async getRevenueByMonth() {
    interface RevenueByMonthResult {
      month: string;
      revenue: string;
    }

    const result = await this.dataSource.query<RevenueByMonthResult[]>(
      `
        SELECT DATE_TRUNC('month', scheduled_at)::text AS month, SUM(s.price)::text AS revenue
        FROM appointments a
        JOIN services s ON s.id = a.service_id
        WHERE a.payment_status = 'paid'
        GROUP BY month
        ORDER BY month
      `,
    );

    return result.map((row) => ({
      month: row.month,
      revenue: parseFloat(row.revenue) || 0,
    }));
  }
}
