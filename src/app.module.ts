import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { FlightsService } from './flights.service';
import { CacheService } from './cache.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
    }),
  ],
  controllers: [AppController],
  providers: [
    FlightsService,
    CacheService,
    {
      provide: 'STARTING_CACHE',
      useValue: {},
    },
  ],
})
export class AppModule {}
