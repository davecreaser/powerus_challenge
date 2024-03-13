import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';
import { MINUTE } from './constants';

describe('CacheService', () => {
  let cacheService: CacheService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [
        CacheService,
        {
          provide: 'STARTING_CACHE',
          useValue: {
            [Date.now() - MINUTE * 60]: {
              '1462019-08-08T16:00:00.000Z': {
                origin_name: 'Schonefeld',
                destination_name: 'Stansted',
                departure_date_time_utc: '2019-08-08T16:00:00.000Z',
                arrival_date_time_utc: '2019-08-08T17:55:00.000Z',
                flight_number: '146',
                duration: 115,
              },
            },
            [Date.now() - MINUTE * 59]: {
              '1442019-08-08T04:30:00.000Z': {
                origin_name: 'Schonefeld',
                destination_name: 'Stansted',
                departure_date_time_utc: '2019-08-08T04:30:00.000Z',
                arrival_date_time_utc: '2019-08-08T06:25:00.000Z',
                flight_number: '144',
                duration: 115,
              },
              '85422019-08-10T05:35:00.000Z': {
                origin_name: 'Stansted',
                destination_name: 'Schonefeld',
                departure_date_time_utc: '2019-08-10T05:35:00.000Z',
                arrival_date_time_utc: '2019-08-10T07:35:00.000Z',
                flight_number: '8542',
                duration: 120,
              },
            },
            [Date.now()]: {
              '85422019-08-10T05:35:00.000Z': {
                origin_name: 'Stansted',
                destination_name: 'Schonefeld',
                departure_date_time_utc: '2019-08-10T05:35:00.000Z',
                arrival_date_time_utc: '2019-08-10T07:40:00.000Z',
                flight_number: '8542',
                duration: 125,
              },
            },
          },
        },
      ],
    }).compile();

    cacheService = app.get<CacheService>(CacheService);
  });

  describe('getFromCache', () => {
    it('should return a hashmap of still valid flights without duplicates', () => {
      expect(cacheService.getFromCache()).toStrictEqual({
        '1442019-08-08T04:30:00.000Z': {
          origin_name: 'Schonefeld',
          destination_name: 'Stansted',
          departure_date_time_utc: '2019-08-08T04:30:00.000Z',
          arrival_date_time_utc: '2019-08-08T06:25:00.000Z',
          flight_number: '144',
          duration: 115,
        },
        '85422019-08-10T05:35:00.000Z': {
          origin_name: 'Stansted',
          destination_name: 'Schonefeld',
          departure_date_time_utc: '2019-08-10T05:35:00.000Z',
          arrival_date_time_utc: '2019-08-10T07:40:00.000Z',
          flight_number: '8542',
          duration: 125,
        },
      });
    });
  });

  describe('addToCache', () => {
    it('should add values to the cache which can then be fetched back', () => {
      cacheService.addToCache({
        '2642019-08-08T08:00:00.000Z': {
          origin_name: 'Schonefeld',
          destination_name: 'Stansted',
          departure_date_time_utc: '2019-08-08T08:00:00.000Z',
          arrival_date_time_utc: '2019-08-08T10:00:00.000Z',
          flight_number: '264',
          duration: 110,
          price: 152.36,
        },
      });

      expect(cacheService.getFromCache()).toStrictEqual({
        '1442019-08-08T04:30:00.000Z': {
          origin_name: 'Schonefeld',
          destination_name: 'Stansted',
          departure_date_time_utc: '2019-08-08T04:30:00.000Z',
          arrival_date_time_utc: '2019-08-08T06:25:00.000Z',
          flight_number: '144',
          duration: 115,
        },
        '85422019-08-10T05:35:00.000Z': {
          origin_name: 'Stansted',
          destination_name: 'Schonefeld',
          departure_date_time_utc: '2019-08-10T05:35:00.000Z',
          arrival_date_time_utc: '2019-08-10T07:40:00.000Z',
          flight_number: '8542',
          duration: 125,
        },
        '2642019-08-08T08:00:00.000Z': {
          origin_name: 'Schonefeld',
          destination_name: 'Stansted',
          departure_date_time_utc: '2019-08-08T08:00:00.000Z',
          arrival_date_time_utc: '2019-08-08T10:00:00.000Z',
          flight_number: '264',
          duration: 110,
          price: 152.36,
        },
      });
    });
  });
});
