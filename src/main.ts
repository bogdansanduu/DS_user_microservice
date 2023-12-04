import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const userMicroservice = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: parseInt(process.env.USER_MICROSERVICE_PORT),
    },
  });

  app.enableCors();

  await app.startAllMicroservices();
  await app.listen(parseInt(process.env.APP_PORT));
  //await seedDatabase().catch((error) => console.error(error));
}

bootstrap();
