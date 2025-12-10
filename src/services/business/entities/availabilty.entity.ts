import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Business } from './business.entity';

@Entity('availabilities') // Make sure table name is plural and meaningful
export class Availability {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  saturday: string;

  @Column({ type: 'varchar', length: 20 })
  sunday: string;

  @Column({ type: 'varchar', length: 20 })
  monday: string;

  @Column({ type: 'varchar', length: 20 })
  tuesday: string;

  @Column({ type: 'varchar', length: 20 })
  wednesday: string;

  @Column({ type: 'varchar', length: 20 })
  thursday: string;

  @Column({ type: 'varchar', length: 20 })
  friday: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Business, (business) => business.availability)
  businesses: Business[];
}
