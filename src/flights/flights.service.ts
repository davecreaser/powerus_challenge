import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom, retry, tap } from 'rxjs';
import { Flight, FlightResponse } from './flight.interface';
import { FLIGHT_SOURCES } from '../constants';
import { DbService } from '../db/db.service';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class FlightsService {
  constructor(
    private readonly dbService: DbService,
    private readonly httpService: HttpService,
  ) {}

  // Reduce the response into a hashmap of flights, where the key is the flight number + departure date.
  // We use a hashmap as it is the fastest way to ensure there are no duplicates.
  private _storeResponse(response: FlightResponse) {
    response.forEach(({ slices, price }) => {
      slices.forEach((flight) => {
        const id = flight.flight_number + flight.departure_date_time_utc;

        this.dbService.upsert({ ...flight, price, id });
      });
    });
  }

  // Fetch flights from a single url.
  private async _fetchFlightsFromUrl(url: string) {
    console.log(`Fetching flights from ${url}...`);
    await firstValueFrom(
      this.httpService.get<{ flights: FlightResponse }>(url).pipe(
        // Tap to add helpful logging.
        tap({
          next: (response) => {
            if (response?.data?.flights) {
              console.log(`Finished fetching flights from ${url}`);
              this._storeResponse(response.data.flights);
            }
          },
          error: (err) =>
            console.log(
              `There was an error fetching flights from ${url}: `,
              err.message,
            ),
        }),
        // Retry 5 times before giving up.
        retry(5),
      ),
    );
  }

  // Fetch flights from all of the urls.
  private _fetchFlights() {
    FLIGHT_SOURCES.forEach((url) => this._fetchFlightsFromUrl(url));
  }

  // Get an array of all of the flights currently stored.
  async getAll(): Promise<Flight[]> {
    const flights = await this.dbService.findAll();
    return flights;
  }

  onModuleInit() {
    this._fetchFlights();
  }

  @Cron(CronExpression.EVERY_MINUTE)
  fetchFlightsCron() {
    this._fetchFlights();
  }
}
