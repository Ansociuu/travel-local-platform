import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

// Fix BigInt and Decimal serialization
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

// Handle Prisma Decimal serialization
try {
  const { Decimal } = require('@prisma/client/runtime/library');
  (Decimal.prototype as any).toJSON = function () {
    return this.toNumber();
  };
} catch (e) {
  // Fallback if the path is different
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://mood-travel.vercel.app',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
  });

  // Global Validation Pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('MoodTravel API')
    .setDescription('Tài liệu API cho hệ thống đặt phòng MoodTravel')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
