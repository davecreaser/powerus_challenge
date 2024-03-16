import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom, retry, tap } from 'rxjs';
import { Flight, FlightResponse } from './flight.interface';
import { FLIGHT_SOURCES } from '../constants';
import { DbService } from '../db/db.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SearchFlightDto } from 'src/db/search-flight.dto';

@Injectable()
export class FlightsService {
  constructor(
    private readonly dbService: DbService,
    private readonly httpService: HttpService,
  ) {}

  // Send each flight in the response to the database service to be upserted.
  private _storeResponse(response: FlightResponse) {
    response.forEach(({ slices, price }) => {
      slices.forEach((flight) => {
        // The unique key for each flight, to handle duplicates.
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
        tap({
          next: (response) => {
            // Store any correct responses.
            if (response?.data?.flights) {
              console.log(`Finished fetching flights from ${url}`);
              this._storeResponse(response.data.flights);
            }
          },
          // Log errors.
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

  // Asynchronously fetch flights from all of the urls.
  private _fetchFlights() {
    FLIGHT_SOURCES.forEach((url) => this._fetchFlightsFromUrl(url));
  }

  // Get an array of all of the flights currently stored.
  async getAll(): Promise<Flight[]> {
    const flights = await this.dbService.findAll();
    return flights;
  }

  // Search for flights based on filters.
  async search(filters: SearchFlightDto): Promise<Flight[]> {
    const flights = await this.dbService.search(filters);
    return flights;
  }

  // Fetch flights when the module is initialized.
  onModuleInit() {
    this._fetchFlights();
  }

  // Node-cron job to fetch new flights every minute.
  @Cron(CronExpression.EVERY_MINUTE)
  fetchFlightsCron() {
    this._fetchFlights();
  }
}
