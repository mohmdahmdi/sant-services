import { Appointment } from './../../appointments/entities/appointment.entity';
import { Business } from './../../business/entities/business.entity';
import { Beautician } from './../../beauticians/entities/beautician.entity';
import { UserRole } from './UserRole.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  full_name: string;

  @Column({ unique: true })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column({ length: 10, nullable: true })
  gender: string;

  @Column({ type: 'date', nullable: true })
  birth_date: string;

  @Column({ nullable: true })
  profile_picture: string;

  @Column({ nullable: true })
  bio: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  // Relations
  @OneToMany(() => Beautician, (beautician) => beautician.user)
  beauticians: Beautician[];

  @OneToMany(() => Business, (business) => business.owner)
  ownedBusinesses: Business[];

  @OneToMany(() => Appointment, (appointment) => appointment.customer)
  appointmentsAsCustomer: Appointment[];

  @ManyToMany(() => UserRole)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: UserRole[];
}
