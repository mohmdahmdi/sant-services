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
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmConfigModule } from './core/database/typeorm.module';
import { User } from './services/users/entities/user.entity';
import { UserRole } from './services/users/entities/UserRole.entity';
import { Business } from './services/business/entities/business.entity';
import { Service } from './services/services/entities/service.entity';
import { BusinessType } from './services/business/entities/business-type.entity';
import { ServiceCategory } from './services/services/entities/service-category.entity';
import { Beautician } from './services/beauticians/entities/beautician.entity';
import { Appointment } from './services/appointments/entities/appointment.entity';
import { Location } from './services/geographics/entities/location.entity';

@Module({
  imports: [
    TypeOrmConfigModule,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    TypeOrmModule.forFeature([
      User,
      UserRole,
      Business,
      Location,
      Service,
      BusinessType,
      ServiceCategory,
      Beautician,
      Appointment,
    ]),
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
