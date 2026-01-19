import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: process.env.NODE_ENV === 'production'
      ? ['error', 'warn']
      : ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Security
  app.use(helmet());

  // Compression
  app.use(compression());

  // CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger documentation (development only)
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('ZST Marketplace API')
      .setDescription('API documentation for ZST B2B/B2C Marketplace')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('auth', 'Authentication endpoints')
      .addTag('products', 'Product management')
      .addTag('orders', 'Order management')
      .addTag('reels', 'Product reels and interactions')
      .addTag('b2b', 'B2B marketplace')
      .addTag('freelance', 'Freelance services')
      .addTag('users', 'User management')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');

  console.log(`
    ╔═══════════════════════════════════════╗
    ║   🚀 ZST Backend API Server           ║
    ║                                       ║
    ║   Environment: ${process.env.NODE_ENV || 'development'}                ║
    ║   Port:        ${port}                       ║
    ║   URL:         http://localhost:${port}     ║
    ║   API Docs:    http://localhost:${port}/api/docs ║
    ╚═══════════════════════════════════════╝
  `);
}

bootstrap();
