import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'PG_POOL',
      inject: [ConfigService],
      useFactory: (config: ConfigService): Pool => {
        try {
          return new Pool({
            host: config.get<string>('DB_HOST') ?? 'localhost',
            port: parseInt(config.get<string>('DB_PORT') ?? '5432', 10),
            user: config.get<string>('DB_USER') ?? 'postgres',
            password: config.get<string>('DB_PASSWORD') ?? 'dwxp9415',
            database: config.get<string>('DB_NAME') ?? 'santal-db',
          });
        } catch (error) {
          console.error('Error creating database pool:', error);
          throw error; // rethrow so return type is still Pool
        }
      },
    },
  ],
  exports: ['PG_POOL'],
})
export class DatabaseModule {}
