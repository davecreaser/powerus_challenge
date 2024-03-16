import { Controller, Get, Query } from '@nestjs/common';
import { FlightsService } from '../flights/flights.service';
import { Flight } from '../flights/flight.interface';

@Controller()
export class AppController {
  constructor(private readonly flightsService: FlightsService) {}

  // Get all flights at '/'
  @Get()
  async getFlights(): Promise<Flight[]> {
    const flights = await this.flightsService.getAll();
    return flights;
  }

  // Search for flights at '/search' with query parameters
  @Get('search?')
  async searchFlights(
    @Query('origin') origin?: string,
    @Query('destination') destination?: string,
  ): Promise<Flight[]> {
    const flights = await this.flightsService.search({
      origin_name: origin || null,
      destination_name: destination || null,
    });
    return flights;
  }
}
