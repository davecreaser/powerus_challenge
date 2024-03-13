import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosResponse } from 'axios';
import { firstValueFrom, retry, tap } from 'rxjs';
import { Flight, FlightResponse } from './flight.interface';
import { CacheService } from './cache.service';
import { FLIGHT_SOURCES, REFETCH_FREQUENCY } from './constants';

@Injectable()
export class FlightsService {
  constructor(
    private readonly httpService: HttpService,
    private readonly cacheService: CacheService,
  ) {
    // Fetch flights immediately.
    this._fetchFlights();

    // Set an interval to fetch the flights every few minutes, for fresh data.
    this._interval = setInterval(
      this._fetchFlights.bind(this),
      REFETCH_FREQUENCY,
    );
  }

  private _interval: NodeJS.Timeout;

  // Reduce the response into a hashmap of flights, where the key is the flight number + departure date.
  // We use a hashmap as it is the fastest way to ensure there are no duplicates.
  private _addResponseIntoCache(response: FlightResponse) {
    const flights = response.reduce(
      (map: { [key: string]: Flight }, { slices, price }) => {
        slices.forEach((flight) => {
          const key = flight.flight_number + flight.departure_date_time_utc;

          map[key] = { ...flight, price };
        });

        return map;
      },
      {},
    );

    this.cacheService.addToCache(flights);
  }

  // Fetch flights from a single url.
  private async _fetchFlightsFromUrl(url: string): Promise<
    AxiosResponse<{
      flights: FlightResponse;
    }>
  > {
    console.log(`Fetching flights from ${url}...`);
    return await firstValueFrom(
      this.httpService.get<{ flights: FlightResponse }>(url).pipe(
        // Tap to add helpful logging.
        tap({
          next: () => {
            console.log(`Finished fetching flights from ${url}`);
          },
          error: (err) =>
            console.log(
              `There was an error fetching flights from ${url}: `,
              err.message,
            ),
        }),
        // Retry 10 times before giving up.
        retry(10),
      ),
    );
  }

  // Fetch flights from all of the urls.
  private _fetchFlights() {
    Promise.all(
      FLIGHT_SOURCES.map((url) => this._fetchFlightsFromUrl(url)),
    ).then((responses) => {
      console.log(
        'Finished fetching flights from all urls. Adding data into cache.',
      );
      // Collate the complete data into an array which models a single response.
      const allData: FlightResponse = responses.flatMap((r) => r.data.flights);
      this._addResponseIntoCache(allData);
    });
  }

  // Get an array of all of the flights currently stored.
  getAll(): Flight[] {
    return Object.values(this.cacheService.getFromCache());
  }

  private onModuleDestroy() {
    clearInterval(this._interval);
    this._interval.unref();
  }
}
