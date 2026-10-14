import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';
import { PrismaExceptionFilter } from './prisma/prisma-exception.filter';

import { AdminModule } from './admin/admin.module';
import { AddressesModule } from './addresses/addresses.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { CatalogModule } from './catalog/catalog.module';
import { OrdersModule } from './orders/orders.module';
import { PrismaModule } from './prisma/prisma.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ReturnsModule } from './returns/returns.module';
import { ServicesModule } from './services/services.module';
import { PushNotificationsModule } from './push-notifications/push-notifications.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AddressesModule,
    AuthModule,
    CatalogModule,
    OrdersModule,
    AdminModule,
    ServicesModule,
    ReviewsModule,
    ReturnsModule,
    PushNotificationsModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_FILTER, useClass: PrismaExceptionFilter }],
})
export class AppModule {}
