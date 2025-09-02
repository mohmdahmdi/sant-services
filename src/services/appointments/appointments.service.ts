// src/appointments/appointments.service.ts
import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { Pool } from 'pg';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async create(dto: CreateAppointmentDto): Promise<Appointment> {
    try {
      const query = `
        INSERT INTO appointments (customer_id, beautician_id, service_id, scheduled_at, status, payment_status, notes)
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        RETURNING *;
      `;
      const values = [
        dto.customer_id,
        dto.beautician_id,
        dto.service_id,
        dto.scheduled_at,
        dto.status || 'pending',
        dto.payment_status || 'unpaid',
        dto.notes || null,
      ];
      const result = await this.pool.query<Appointment>(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw new InternalServerErrorException('Failed to create appointment');
    }
  }

  async findAll(): Promise<Appointment[]> {
    try {
      const result = await this.pool.query<Appointment>(
        'SELECT * FROM appointments',
      );
      return result.rows;
    } catch (error) {
      console.error('Error fetching appointments:', error);
      throw new InternalServerErrorException('Failed to fetch appointments');
    }
  }

  async findOne(id: string): Promise<Appointment> {
    try {
      const result = await this.pool.query<Appointment>(
        'SELECT * FROM appointments WHERE id = $1',
        [id],
      );
      if (!result.rows.length)
        throw new NotFoundException(`Appointment with id ${id} not found`);
      return result.rows[0];
    } catch (error) {
      console.error('Error fetching appointment:', error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException();
    }
  }

  async update(id: string, dto: UpdateAppointmentDto): Promise<Appointment> {
    try {
      const fields = Object.keys(dto);
      if (!fields.length)
        throw new InternalServerErrorException('No fields to update');

      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      const values = fields.map((field) => dto[field]);
      const setClause = fields
        .map((field, idx) => `${field} = $${idx + 1}`)
        .join(', ');

      const query = `
        UPDATE appointments
        SET ${setClause}
        WHERE id = $${fields.length + 1}
        RETURNING *;
      `;

      const result = await this.pool.query<Appointment>(query, [...values, id]);
      if (!result.rows.length)
        throw new NotFoundException(`Appointment with id ${id} not found`);
      return result.rows[0];
    } catch (error) {
      console.error('Error updating appointment:', error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException();
    }
  }

  async remove(id: string): Promise<void> {
    try {
      const result = await this.pool.query(
        'DELETE FROM appointments WHERE id = $1 RETURNING id',
        [id],
      );
      if (!result.rows.length)
        throw new NotFoundException(`Appointment with id ${id} not found`);
    } catch (error) {
      console.error('Error deleting appointment:', error);
      throw error instanceof NotFoundException
        ? error
        : new InternalServerErrorException();
    }
  }

  // Bonus: search appointments by customer, beautician, or status
  async search(term: string): Promise<Appointment[]> {
    try {
      const query = `
        SELECT * FROM appointments
        WHERE status ILIKE $1 OR payment_status ILIKE $1
      `;
      const result = await this.pool.query<Appointment>(query, [`%${term}%`]);
      return result.rows;
    } catch (error) {
      console.error('Error searching appointments:', error);
      throw new InternalServerErrorException('Failed to search appointments');
    }
  }

  async getAppointmentsByCustomerId(customerId: string) {
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
    const result = await this.pool.query<
      {
        appointment_id: string;
        scheduled_at: string;
        status: string;
        payment_status: string;
        service_id: string;
        service_title: string;
        price: string;
        beautician_id: string;
        beautician_name: string;
        business_id: string;
        business_name: string;
      }[]
    >(query, [customerId]);
    return result.rows;
  }

  async getActiveCustomers() {
    const data = await this.pool.query<{ total_customers: number }>(
      `SELECT COUNT(DISTINCT customer_id) AS active_customers
       FROM Appointments
       WHERE status IN ('confirmed', 'completed');`,
    );

    return data.rows[0];
  }

  async getAverageAppointmentsPerCustomer() {
    const data = await this.pool.query<{
      customer_id: string;
      appointments_count: number;
    }>(
      `SELECT customer_id, COUNT(*) AS appointments_count
       FROM Appointments
       GROUP BY customer_id;`,
    );

    return data.rows;
  }

  async getAppointmentsByStatus() {
    const data = await this.pool.query<{ status: string; count: number }>(
      `SELECT status, COUNT(*) AS count
       FROM Appointments
       GROUP BY status;`,
    );

    return data.rows;
  }

  async getRevenueByMonth() {
    const data = await this.pool.query<{ month: string; revenue: number }>(
      `SELECT DATE_TRUNC('month', scheduled_at) AS month, SUM(s.price) AS revenue
       FROM Appointments a
       JOIN Services s ON s.id = a.service_id
       WHERE a.payment_status = 'paid'
       GROUP BY month
       ORDER BY month;`,
    );

    return data.rows;
  }
}
