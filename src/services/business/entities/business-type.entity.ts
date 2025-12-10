import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
import { Business } from './business.entity';

@Entity('business_types')
export class BusinessType {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  id: string;

  @Column({ length: 50 })
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Business, (business) => business.businessType)
  businesses: Business[];
}
