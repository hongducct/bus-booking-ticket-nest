import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { seedDatabase } from './database/seed';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { RolesGuard } from './auth/roles.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5174', 'http://localhost:3001', 
      'https://bus.hongducct.id.vn', 'https://bus-stg.hongducct.id.vn'],
    credentials: true,
  });

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Global guards
  const reflector = app.get(Reflector);
  app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false, // Allow extra fields for now
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('Bus Ticket Booking API')
    .setDescription('API documentation for Bus Ticket Booking System')
    .setVersion('1.0')
    .addTag('trips', 'Chuyến xe operations')
    .addTag('bookings', 'Đặt vé operations')
    .addTag('stations', 'Trạm dừng operations')
    .addTag('auth', 'Authentication operations')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Seed database on startup (only in development)
  // Note: Run migrations first with: npm run migration:run
  if (process.env.NODE_ENV !== 'production' && process.env.SEED_DB === 'true') {
    try {
      const dataSource = app.get(DataSource);
      await seedDatabase(dataSource);
    } catch (error) {
      console.log('Database already seeded or error:', error.message);
    }
  }

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚌 Bus Ticket API is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
