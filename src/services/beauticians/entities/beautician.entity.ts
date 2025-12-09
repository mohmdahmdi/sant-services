import { Appointment } from './../../appointments/entities/appointment.entity';
import { Business } from './../../business/entities/business.entity';
import { User } from 'src/services/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity('beauticians')
export class Beautician {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  user_id: string;

  @ManyToOne(() => User, (user) => user.beauticians)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  business_id: string;

  @ManyToOne(() => Business, (business) => business.beauticians)
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @Column({ nullable: true })
  bio: string;
  @Column({ type: 'int', nullable: true })
  experience_years: number;
  @Column('text', { array: true, nullable: true })
  specialties: string[];
  @Column({ default: false })
  is_freelancer: boolean;
  @Column({ type: 'numeric', precision: 2, scale: 1, default: 0.0 })
  rating: number;

  @OneToMany(() => Appointment, (appointment) => appointment.beautician)
  appointments: Appointment[];
}
