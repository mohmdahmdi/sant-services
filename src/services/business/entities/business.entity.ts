import { Beautician } from './../../beauticians/entities/beautician.entity';
import { Service } from './../../services/entities/service.entity';
import { User } from 'src/services/users/entities/user.entity';
import { BusinessType } from './business-type.entity';
import { Location } from 'src/services/geographics/entities/location.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

@Entity('businesses')
export class Business {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  owner_id: string;

  @ManyToOne(() => User, (user) => user.ownedBusinesses)
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @Column({ length: 100, nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  logo: string;
  @Column({ nullable: true })
  cover_image: string;
  @Column({ nullable: true })
  phone: string;
  @Column({ nullable: true })
  email: string;
  @Column({ nullable: true })
  website: string;
  @Column({ nullable: true })
  instagram: string;
  @Column({ nullable: true })
  whatsapp: string;
  @Column({ type: 'numeric', precision: 2, scale: 1, default: 0.0 })
  rating: number;
  @Column({ default: false })
  is_verified: boolean;
  @Column({ default: true })
  is_active: boolean;
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ nullable: true })
  location_id: string;

  @ManyToOne(() => Location, (location) => location.businesses)
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @Column({ nullable: true })
  business_type_id: string;

  @ManyToOne(() => BusinessType, (type) => type.businesses)
  @JoinColumn({ name: 'business_type_id' })
  businessType: BusinessType;

  @OneToMany(() => Service, (service) => service.business)
  services: Service[];

  @OneToMany(() => Beautician, (beautician) => beautician.business)
  beauticians: Beautician[];
}
