import { ObjectType, Field, ID, Float } from '@nestjs/graphql';
import { User } from '../users/users.model';

@ObjectType()
export class Business {
  @Field(() => ID)
  id: string;

  @Field(() => User, { nullable: true })
  owner: User;

  @Field({ nullable: true })
  name: string;

  @Field({ nullable: true })
  description: string;

  @Field({ nullable: true })
  logo: string;

  @Field({ nullable: true })
  cover_image: string;

  @Field({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  website: string;

  @Field({ nullable: true })
  instagram: string;

  @Field({ nullable: true })
  whatsapp: string;

  @Field(() => Float)
  rating: number;

  @Field()
  is_verified: boolean;

  @Field()
  is_active: boolean;

  @Field({ nullable: true })
  available_from: string;

  @Field({ nullable: true })
  available_to: string;

  @Field(() => Date)
  created_at: Date;

  //   @Field(() => Location, { nullable: true })
  //   location: Location;

  //   @Field(() => BusinessType, { nullable: true })
  //   businessType: BusinessType;

  //   @Field(() => Availability, { nullable: true })
  //   availability: Availability;

  //   @Field(() => [Service], { nullable: 'itemsAndList' })
  //   services: Service[];

  //   @Field(() => [Beautician], { nullable: 'itemsAndList' })
  //   beauticians: Beautician[];
}
