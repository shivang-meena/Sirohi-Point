import { NestFactory } from '@nestjs/core'; import { PushWorkerModule } from './push-worker.module';
void NestFactory.createApplicationContext(PushWorkerModule).then((app) => app.enableShutdownHooks());
