import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Service } from './service.entity';

@Entity('servicecategories')
export class ServiceCategory {
  @PrimaryColumn('varchar', { length: 100 })
  id: string;

  @Column({ length: 50, nullable: true })
  name: string;

  @Column({ nullable: true })
  icon: string;

  @OneToMany(() => Service, (service) => service.category)
  services: Service[];
}
