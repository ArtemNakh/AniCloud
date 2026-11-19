
import {
  IsString,
  IsEmail,
  MinLength,
  IsNotEmpty,
} from 'class-validator';

export class RegisterReqDto {
  @IsString({ message: 'Username must be a string' })
  @IsNotEmpty({ message: 'Username should not be empty' })
  username: string;

  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email should not be empty' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsNotEmpty({ message: 'Password should not be empty' })
  password: string;
}
