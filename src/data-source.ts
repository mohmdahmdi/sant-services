import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import { DataSource } from 'typeorm';

const nodeEnv = process.env.NODE_ENV || 'development';

const envFilePath = path.resolve(__dirname, '.', `.env.${nodeEnv}`);

if (fs.existsSync(envFilePath)) {
  dotenv.config({ path: envFilePath });
  console.log(`Loaded environment file: ${envFilePath}`);
} else {
  console.warn(`Environment file not found: ${envFilePath}`);
  dotenv.config();
}
import { User } from './services/users/entities/user.entity';
import { Business } from './services/business/entities/business.entity';
import { Location } from './services/geographics/entities/location.entity';
import { Service } from './services/services/entities/service.entity';
import { BusinessType } from './services/business/entities/business-type.entity';
import { ServiceCategory } from './services/services/entities/service-category.entity';
import { Beautician } from './services/beauticians/entities/beautician.entity';
import { Appointment } from './services/appointments/entities/appointment.entity';
import { UserRole } from './services/users/entities/UserRole.entity';
import { Availability } from './services/business/entities/availabilty.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'test',
  entities: [
    User,
    UserRole,
    Business,
    Location,
    Service,
    Availability,
    BusinessType,
    ServiceCategory,
    Beautician,
    Appointment,
  ],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});
