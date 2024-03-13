import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { FlightsService } from '../flights/flights.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flight } from '../db/flight.entity';
import { DbService } from '../db/db.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'db/sql',
      synchronize: true,
      entities: [Flight],
    }),
    TypeOrmModule.forFeature([Flight]),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [FlightsService, DbService],
})
export class AppModule {}
