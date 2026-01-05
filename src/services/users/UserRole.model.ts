import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserRole {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;
}
