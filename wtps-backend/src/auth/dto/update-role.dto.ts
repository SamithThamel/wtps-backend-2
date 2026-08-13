import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateRoleDto {
  @IsNotEmpty()
  @IsString()
  @IsIn([
    'Admin',
    'Operator',
    'Supervisor',
    'Utility Engineer',
    'Consultant',
    'Upper Management',
    'Business Owner',
    'Pending',
    'None',
  ])
  role: string;
}
