import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { seedDatabase } from './scripts/seeder';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const deviceMicroservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      port: 4001,
    },
  });

  app.enableCors();

  await app.startAllMicroservices();
  await app.listen(3000);
  //await seedDatabase().catch((error) => console.error(error));
}
bootstrap();
