import { Appointment } from 'src/services/appointments/entities/appointment.entity';
import { User } from 'src/services/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('increment')
  id: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment: string;

  @ManyToOne(() => Appointment, { nullable: false })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'customer_id' })
  customer: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
