import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Flight } from './flight.entity';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { UpsertFlightDto } from './upsert-flight.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { INVALIDATION_TIME } from './../constants';

@Injectable()
export class DbService {
  constructor(
    @InjectRepository(Flight)
    private readonly flightRepository: Repository<Flight>,
  ) {}

  async upsert(upsertFlightDto: UpsertFlightDto) {
    await this.flightRepository.upsert(
      { ...upsertFlightDto, updated_at: Date.now() },
      ['id'],
    );
  }

  async findAll(): Promise<Flight[]> {
    const lastInvalidTime = Date.now() - INVALIDATION_TIME;
    const flights = await this.flightRepository.find({
      where: { updated_at: MoreThan(lastInvalidTime) },
    });
    return flights;
  }

  private async _clean() {
    const lastInvalidTime = Date.now() - INVALIDATION_TIME;
    const flightsToDelete = await this.flightRepository.find({
      where: { updated_at: LessThan(lastInvalidTime) },
    });

    flightsToDelete.forEach((flight) => {
      this.flightRepository.delete(flight.id);
    });
  }

  @Cron(CronExpression.EVERY_HOUR)
  cleanupCron() {
    console.log('Cleaning expired flights from database...');
    this._clean();
  }
}
