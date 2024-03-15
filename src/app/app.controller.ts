import { Controller, Get } from '@nestjs/common';
import { FlightsService } from '../flights/flights.service';
import { Flight } from '../flights/flight.interface';

@Controller()
export class AppController {
  constructor(private readonly flightsService: FlightsService) {}

  @Get()
  async getFlights(): Promise<Flight[]> {
    const flights = await this.flightsService.getAll();
    return flights;
  }
}
