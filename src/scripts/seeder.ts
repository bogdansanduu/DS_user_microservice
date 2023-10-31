import { Connection, createConnection, getConnection } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Role as RoleEntity } from '../role/entities/role.entity';
import { Role } from '../constants/role';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

export async function seedDatabase() {
  let connection: Connection | undefined;

  // Check if a connection with the name 'seeder' already exists
  try {
    connection = getConnection('seeder');
  } catch (error) {
    // If there is an error, it means the connection doesn't exist, so create it.
    connection = await createConnection({
      name: 'seeder',
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: 'nestjs_users',
      entities: [RoleEntity, User],
    });
  }

  const roleRepository = connection.getRepository(RoleEntity);

  const roles = await roleRepository.find();
  const hasUser = roles.some((role) => role.name === 'User');
  const hasAdmin = roles.some((role) => role.name === 'Admin');

  if (roles.length === 2 && hasUser && hasAdmin) {
    console.log('Default roles already exist. No action needed.');
  } else {
    await roleRepository.delete({});

    const AdminRole = await roleRepository.create({
      name: Role.Admin,
    });

    const UserRole = await roleRepository.create({
      name: Role.User,
    });

    await roleRepository.save([AdminRole, UserRole]);
  }

  const userRepository = connection.getRepository(User);

  const existingUser = await userRepository.findOne({
    where: {
      email: 'sandubogdan2001@gmail.com',
    },
  });

  if (!existingUser) {
    const defaultUser = new User();
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, salt);

    defaultUser.firstName = 'Sandu';
    defaultUser.lastName = 'Bogdan';
    defaultUser.email = 'sandubogdan2001@gmail.com';
    defaultUser.roles = await roleRepository.find({
      where: { name: Role.Admin },
    });
    defaultUser.phoneNumber = '0770469762';
    defaultUser.password = hashedPassword;

    await userRepository.save(defaultUser);

    console.log('Default user inserted.');
  } else {
    console.log('Default user already exists. No action needed.');
  }

  await connection.close();
}

seedDatabase().catch((error) => console.error(error));
