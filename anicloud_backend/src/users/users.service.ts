import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { Repository } from 'typeorm';
import { IUser } from './entities/user.interface.js';
import { CreateUserDto } from './dto/services/create-user.dto.js';
import { UserResponseDto } from './dto/services/UserResponse.dto.js';
import { HashService } from '../lib/common/HashService.js';

@Injectable()
export class UsersService {
  constructor(
   @InjectRepository(User)
    private readonly userRepository: Repository<User>, 
    private readonly hashService: HashService,
  ) {}

  async findByEmail(email: string): Promise<IUser | null> {
    // 1. Нормалізація email (захист від регістру "Test@gmail.com" та пробілів)
    const normalizedEmail = email.toLowerCase().trim();

    // 2. Використовуємо findOne замість findBy, щоб отримати об'єкт або null
    return this.userRepository.findOne({
      where: { email: normalizedEmail },
    });
  }

  async findById(userId: number): Promise<IUser | null> {
    // 2. Використовуємо findOne замість findBy, щоб отримати об'єкт або null
    return this.userRepository.findOne({
      where: { id: userId },
    });
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const normalizedEmail = createUserDto.email.toLowerCase().trim();

    // 1. Перевіряємо, чи існує користувач із таким email
    const existingUser = await this.userRepository.findOne({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('User with same email already exist');
    }

    // await bcrypt.hash(
    //   createUserDto.password,
    //   saltRounds,
    // );

    // 3. Створюємо сутності
    const newUser = await this.userRepository.create({
      ...createUserDto,
      email: normalizedEmail,
    });

    // 4. Зберігаємо в базу даних
    const savedUser = await this.userRepository.save(newUser);

    // 5. Повертаємо DTO відповіді (без пароля)
    return new UserResponseDto(savedUser);
  }
}
