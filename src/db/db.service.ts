import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Flight } from './flight.entity';
import {
  FindManyOptions,
  LessThan,
  MoreThan,
  Repository,
  ILike,
} from 'typeorm';
import { UpsertFlightDto } from './upsert-flight.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { INVALIDATION_TIME } from './../constants';
import { SearchFlightDto } from './search-flight.dto';

@Injectable()
export class DbService {
  constructor(
    @InjectRepository(Flight)
    private readonly flightRepository: Repository<Flight>,
  ) {}

  // Upsert flights to the db.
  async upsert(upsertFlightDto: UpsertFlightDto) {
    await this.flightRepository.upsert(
      { ...upsertFlightDto, updated_at: Date.now() },
      ['id'],
    );
  }

  // Return all flights from the db which were updated in the last hour.
  async findAll(): Promise<Flight[]> {
    const lastInvalidTime = Date.now() - INVALIDATION_TIME;
    const flights = await this.flightRepository.find({
      where: { updated_at: MoreThan(lastInvalidTime) },
    });
    return flights;
  }

  // Search for flights in the db which were updated in the last hour, and match the search query.
  async search(filters: SearchFlightDto): Promise<Flight[]> {
    const lastInvalidTime = Date.now() - INVALIDATION_TIME;
    const options: FindManyOptions<Flight> = {
      where: {
        updated_at: MoreThan(lastInvalidTime),
      },
    };

    // Check for search query parameters.
    if (filters.origin_name) {
      options.where['origin_name'] = ILike(filters.origin_name);
    }
    if (filters.destination_name) {
      options.where['destination_name'] = ILike(filters.destination_name);
    }

    const flights = await this.flightRepository.find(options);
    return flights;
  }

  // Cleanup flights which are older than an hour.
  private async _clean() {
    const lastInvalidTime = Date.now() - INVALIDATION_TIME;
    const flightsToDelete = await this.flightRepository.find({
      where: { updated_at: LessThan(lastInvalidTime) },
    });

    flightsToDelete.forEach((flight) => {
      this.flightRepository.delete(flight.id);
    });
  }

  // Node-cron job to cleanup the database once an hour.
  @Cron(CronExpression.EVERY_HOUR)
  cleanupCron() {
    console.log('Cleaning expired flights from database...');
    this._clean();
  }
}
