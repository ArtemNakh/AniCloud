import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity.js';
import { DataSource, Repository } from 'typeorm';
import { IUser } from './entities/user.interface.js';
import { CreateUserDto } from './dto/services/create-user.dto.js';
import { UserResponseDto } from './dto/services/UserResponse.dto.js';
import { HashService } from '../lib/common/HashService.js';
import { RolesService } from '../roles/roles.service.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly hashService: HashService,
    private readonly dataSource: DataSource,
    private readonly rolesService:RolesService,
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
    const hashedPassword = await this.hashService.hashBcripto(
      createUserDto.password,
    );

    // // 3. Створюємо сутності
    // const newUser = this.userRepository.create({
    //   username: createUserDto.username,
    //   password: hashedPassword,
    //   email: normalizedEmail,
    // });

    // // 4. Зберігаємо в базу даних
    // const savedUser = await this.userRepository.save(newUser);

    const savedUser = await this.dataSource.transaction(async (manager) => {
      const txUserRepo = manager.getRepository(User);
      // 1. Створюємо та зберігаємо користувача
      const newUser = txUserRepo.create({
        username: createUserDto.username,
        password: hashedPassword,
        email: normalizedEmail,
      });

      const createdUser = await txUserRepo.save(newUser);

      // 2. Прив'язуємо роль через сервіс ролей (передаємо manager, якщо підтримується транзакція)
      await this.rolesService.assignDefaultRoleToUser(createdUser.id, manager);

      return createdUser;
    });
    // 5. Повертаємо DTO відповіді (без пароля)
    return new UserResponseDto(savedUser);
  }
}
