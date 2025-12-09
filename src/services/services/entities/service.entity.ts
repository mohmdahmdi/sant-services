import { Appointment } from './../../appointments/entities/appointment.entity';
import { Business } from './../../business/entities/business.entity';
import { ServiceCategory } from './service-category.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  business_id: string;

  @ManyToOne(() => Business, (business) => business.services)
  @JoinColumn({ name: 'business_id' })
  business: Business;

  @Column({ nullable: true })
  category_id: string;

  @ManyToOne(() => ServiceCategory, (category) => category.services)
  @JoinColumn({ name: 'category_id' })
  category: ServiceCategory;

  @Column({ length: 100 })
  title: string;
  @Column({ nullable: true })
  description: string;
  @Column({ type: 'numeric', precision: 10, scale: 2 })
  price: number;
  @Column({ type: 'int' })
  duration_minutes: number;
  @Column({ nullable: true })
  image: string;
  @Column({ length: 10, nullable: true })
  gender_target: string;
  @Column({ default: true })
  is_active: boolean;
  @Column({ type: 'numeric', precision: 2, scale: 1, default: 0.0 })
  rating: number;

  @OneToMany(() => Appointment, (appointment) => appointment.service)
  appointments: Appointment[];
}
