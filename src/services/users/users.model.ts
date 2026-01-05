import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Business } from '../business/business.model';
// import { UserRole } from '../../role/models/user-role.model';
// import { Beautician } from '../../beautician/models/beautician.model';
// import { Business } from '../../business/models/business.model';
// import { Appointment } from '../../appointment/models/appointment.model';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  full_name: string;

  @Field({ nullable: true })
  email: string;

  @Field({ nullable: true })
  phone: string;

  @Field({ nullable: true })
  gender: string;

  @Field({ nullable: true })
  birth_date: string;

  @Field({ nullable: true })
  profile_picture: string;

  @Field({ nullable: true })
  bio: string;

  //   @Field(() => [Beautician], { nullable: 'itemsAndList' })
  //   beauticians: Beautician[];

  @Field(() => [Business], { nullable: 'itemsAndList' })
  ownedBusinesses: Business[];

  //   @Field(() => [Appointment], { nullable: 'itemsAndList' })
  //   appointmentsAsCustomer: Appointment[];

  @Field(() => Date)
  created_at: Date;
}
