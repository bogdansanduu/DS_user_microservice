import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import 'dotenv/config';

import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { Role } from '../role/entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role]),
    ClientsModule.register([
      {
        name: 'Device_MICROSERVICE',
        transport: Transport.TCP,
        options: {
          // host: 'host.docker.internal',
          port: parseInt(process.env.DEVICE_MICROSERVICE_PORT),
        },
      },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
