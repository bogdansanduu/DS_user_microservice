import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/CreateUserDto';
import * as bcrypt from 'bcrypt';
import { Role } from '../role/entities/role.entity';
import { UpdateUserDto } from './dto/UpdateUserDto';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Role)
    private roleRepo: Repository<Role>,
    @Inject('Device_MICROSERVICE') private readonly clientDevice: ClientProxy,
  ) {}

  async findAll() {
    return await this.userRepo.find({
      relations: {
        roles: true,
      },
    });
  }

  async findOneById(userId: number) {
    return await this.userRepo.findOne({
      where: {
        id: userId,
      },
      relations: { roles: true },
    });
  }

  async findOneByEmail(email: string) {
    return await this.userRepo.findOne({
      where: {
        email,
      },
      relations: { roles: true },
    });
  }

  async create({
    firstName,
    lastName,
    phoneNumber,
    password,
    email,
  }: CreateUserDto) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await this.userRepo.create({
      firstName,
      lastName,
      phoneNumber,
      password: hashedPassword,
      email: email,
    });

    const userRole = await this.roleRepo.findOne({
      where: {
        name: 'user',
      },
    });

    if (userRole) {
      user.roles = [userRole];
    }

    return await this.userRepo.save(user);
  }

  async update(
    userId: number,
    { firstName, lastName, phoneNumber }: UpdateUserDto,
  ) {
    const user = await this.findOneById(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (firstName) {
      user.firstName = firstName;
    }
    if (lastName) {
      user.lastName = lastName;
    }
    if (phoneNumber) {
      user.phoneNumber = phoneNumber;
    }

    return await this.userRepo.save(user);
  }

  async remove(userId: number) {
    await this.clientDevice.emit(
      { cmd: 'remove_user_devices' },
      { userId: userId },
    );

    const user = await this.findOneById(userId);

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    await this.userRepo.remove(user);

    return `User with ID ${userId} has been deleted`;
  }
}
