import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginReqDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email should not be empty' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'Password should not be empty' })
  password: string;
}
