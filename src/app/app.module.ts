import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { FlightsService } from '../flights/flights.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Flight } from '../db/flight.entity';
import { DbService } from '../db/db.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmConfigService } from './typeorm-config.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
    }),
    TypeOrmModule.forRootAsync({
      imports: [TypeOrmConfigService],
      useClass: TypeOrmConfigService,
    }),
    TypeOrmModule.forFeature([Flight]),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [FlightsService, DbService],
})
export class AppModule {}
