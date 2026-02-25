import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import * as compression from 'compression';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security middleware
  app.use(helmet());
  app.use(compression());
  app.use(cookieParser());

  // Configure raw body for Stripe webhooks
  app.use(
    express.json({
      verify: (req: any, res, buf) => {
        // Store raw body for webhook signature verification
        const url = req.originalUrl || req.url;
        if (url.includes('/orders/webhook')) {
          req.rawBody = buf;
        }
      },
    }),
  );

  // CORS configuration
  const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Swagger)
      if (!origin) return callback(null, true);
      // In development allow any localhost port; in production match exact URL
      const isLocalhost = /^http:\/\/localhost:\d+$/.test(origin);
      if (isLocalhost || origin === allowedOrigin) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Online Bookstore API')
    .setDescription('A comprehensive bookstore API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
