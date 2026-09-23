import "reflect-metadata";
import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { AppModule } from "./app.module";
import { loadEnv } from "@atende/config";

async function bootstrap() {
  const env = loadEnv(); // falha rápido se JWT_SECRET curto/ausente
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("api/v1");
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }));
  app.enableCors({
    origin: process.env.FRONTEND_URL?.split(",").map((s) => s.trim()) ?? true,
  });
  await app.listen(env.PORT);
}

void bootstrap();
