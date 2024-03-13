import { Controller, Get } from '@nestjs/common';
import { FlightsService } from './flights.service';
import { Flight } from './flight.interface';

@Controller()
export class AppController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get()
  getFlights(): Flight[] {
    return this.flightsService.getAll();
  }
}
