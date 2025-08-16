import { IsString, IsUUID } from 'class-validator';

export class AddRoleDto {
  @IsUUID()
  userId: string;

  @IsString()
  roleName: string;
}
