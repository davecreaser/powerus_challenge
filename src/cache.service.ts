import { Inject, Injectable } from '@nestjs/common';
import { Flight } from './flight.interface';
import { INVALIDATION_TIME } from './constants';

@Injectable()
export class CacheService {
  constructor(
    @Inject('STARTING_CACHE')
    private readonly startingCache: {
      [key: number]: {
        [key: string]: Flight;
      };
    },
  ) {
    // If you need to provide some values to initialize the cache with.
    this._cache = this.startingCache;
  }

  // The cache will store a hashmap of flights inside of 'windows' which will be timestamped
  // with this timestamp used as the key for the 'window'.
  private _cache: {
    [key: number]: {
      [key: string]: Flight;
    };
  } = {};

  // Add a new hashmap of flights to the cache inside a timestamped window.
  addToCache(flights: { [key: string]: Flight }) {
    const dateTime = Date.now();
    this._cache[dateTime] = flights;
    // Asynchronously clear the stale cache after each addition, to keep it clean.
    this._clearStaleCacheWindows();
  }

  // Get a hashmap of all flights from all valid cache windows, without duplicates.
  getFromCache(): { [key: string]: Flight } {
    let flights: { [key: string]: Flight } = {};

    Object.keys(this._cache).forEach((key) => {
      if (this._cacheWindowIsValid(key)) {
        const cacheWindow: { [key: string]: Flight } = this._cache[key];
        // The later timestamped windows will overwrite any duplicates in the hashmap.
        flights = { ...flights, ...cacheWindow };
      }
    });

    return flights;
  }

  // Check if cache window is still valid (ie. the timestamp of the window is AFTER the latest invalid timestamp).
  private _cacheWindowIsValid(windowDateTime: string): boolean {
    const latestInvalidTime = Date.now() - INVALIDATION_TIME;

    return parseInt(windowDateTime) > latestInvalidTime;
  }

  // Run through the cache windows to find and clear any that are invalid.
  // Also log the results of this for easy debugging.
  private async _clearStaleCacheWindows() {
    console.log('Clearing stale cache...');
    let numberOfStaleWindows = 0;
    Object.keys(this._cache).forEach((key) => {
      if (!this._cacheWindowIsValid(key)) {
        delete this._cache[key];
        numberOfStaleWindows++;
      }
    });
    console.log(`Cleared ${numberOfStaleWindows} stale cache windows.`);
  }
}
