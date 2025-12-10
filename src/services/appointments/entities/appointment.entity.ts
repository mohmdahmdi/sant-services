import { Service } from './../../services/entities/service.entity';
import { Beautician } from './../../beauticians/entities/beautician.entity';
import { User } from 'src/services/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  customer_id: string;

  @ManyToOne(() => User, (user) => user.appointmentsAsCustomer)
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @Column({ nullable: true })
  beautician_id: string;

  @ManyToOne(() => Beautician, (beautician) => beautician.appointments)
  @JoinColumn({ name: 'beautician_id' })
  beautician: Beautician;

  @Column({ nullable: true })
  service_id: string;

  @ManyToOne(() => Service, (service) => service.appointments)
  @JoinColumn({ name: 'service_id' })
  service: Service;

  @Column({ type: 'timestamp' })
  scheduled_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @Column({ length: 20, default: 'pending' })
  status: string;

  @Column({ name: 'payment_status', length: 20, default: 'unpaid' })
  paymentStatus: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
