import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { Business } from './business.model';
import { BusinessService } from './business.service';

@Resolver(() => Business)
export class BusinessResolver {
  constructor(private businessService: BusinessService) {}

  @Query(() => [Business])
  businesses() {
    return this.businessService.findAll();
  }

  @Query(() => Business)
  business(@Args('id', { type: () => ID }) id: string) {
    return this.businessService.findOne(id);
  }
}
