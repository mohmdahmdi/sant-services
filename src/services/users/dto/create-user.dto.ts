import { Field, InputType } from '@nestjs/graphql';
import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  IsDateString,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @Length(1, 100)
  full_name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @Length(0, 20)
  phone?: string;

  @IsString()
  @Length(6, 100)
  password: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsDateString()
  birth_date?: string;

  @IsOptional()
  @IsString()
  profile_picture?: string;

  @IsOptional()
  @IsString()
  bio?: string;
}

@InputType()
export class CreateUserInput {
  @Field()
  @IsString()
  @Length(1, 100)
  full_name: string;

  @Field()
  @IsEmail()
  email: string;

  @IsOptional()
  @Field()
  @IsString()
  @Length(0, 20)
  phone?: string;

  @Field()
  @IsString()
  @Length(6, 100)
  password: string;

  @Field()
  @IsOptional()
  @IsString()
  gender?: string;

  @Field()
  @IsOptional()
  @IsDateString()
  birth_date?: string;

  @Field()
  @IsOptional()
  @IsString()
  profile_picture?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  bio?: string;
}
