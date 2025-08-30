// app.module.ts
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './services/users/users.module';
import { AuthModule } from './services/auth/auth.module';
import { DatabaseModule } from './core/database/database.module';
import { LoggerMiddleware } from './core/middlewares/logger.middleware';
import { BusinessModule } from './services/business/business.module';
import { BeauticiansModule } from './services/beauticians/beauticians.module';
import { AppointmentsModule } from './services/appointments/appointments.module';
import { ServicesModule } from './services/services/services.module';
import { GeographicsModule } from './services/geographics/geographics.module';
import { ReportsModule } from './services/reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
    BusinessModule,
    BeauticiansModule,
    AppointmentsModule,
    ServicesModule,
    GeographicsModule,
    ReportsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
