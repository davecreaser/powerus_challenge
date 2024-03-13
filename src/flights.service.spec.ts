import { Test, TestingModule } from '@nestjs/testing';
import { FlightsService } from './flights.service';
import { HttpService } from '@nestjs/axios';
import { CacheService } from './cache.service';
import { of } from 'rxjs';

const response = {
  data: {
    flights: [
      {
        slices: [
          {
            origin_name: 'Schonefeld',
            destination_name: 'Stansted',
            departure_date_time_utc: '2019-08-08T04:30:00.000Z',
            arrival_date_time_utc: '2019-08-08T06:25:00.000Z',
            flight_number: '144',
            duration: 115,
          },
          {
            origin_name: 'Stansted',
            destination_name: 'Schonefeld',
            departure_date_time_utc: '2019-08-10T05:35:00.000Z',
            arrival_date_time_utc: '2019-08-10T07:35:00.000Z',
            flight_number: '8542',
            duration: 120,
          },
        ],
        price: 129,
      },
      {
        slices: [
          {
            origin_name: 'Schonefeld',
            destination_name: 'Stansted',
            departure_date_time_utc: '2019-08-08T20:25:00.000Z',
            arrival_date_time_utc: '2019-08-08T22:25:00.000Z',
            flight_number: '8545',
            duration: 120,
          },
          {
            origin_name: 'Stansted',
            destination_name: 'Schonefeld',
            departure_date_time_utc: '2019-08-10T06:50:00.000Z',
            arrival_date_time_utc: '2019-08-10T08:40:00.000Z',
            flight_number: '145',
            duration: 110,
          },
        ],
        price: 134.81,
      },
      {
        slices: [
          {
            origin_name: 'Schonefeld',
            destination_name: 'Stansted',
            departure_date_time_utc: '2019-08-08T20:25:00.000Z',
            arrival_date_time_utc: '2019-08-08T22:25:00.000Z',
            flight_number: '8545',
            duration: 120,
          },
          {
            origin_name: 'Stansted',
            destination_name: 'Schonefeld',
            departure_date_time_utc: '2019-08-10T05:35:00.000Z',
            arrival_date_time_utc: '2019-08-10T07:35:00.000Z',
            flight_number: '8542',
            duration: 120,
          },
        ],
        price: 134.81,
      },
      {
        slices: [
          {
            origin_name: 'Schonefeld',
            destination_name: 'Stansted',
            departure_date_time_utc: '2019-08-08T16:00:00.000Z',
            arrival_date_time_utc: '2019-08-08T17:55:00.000Z',
            flight_number: '146',
            duration: 115,
          },
          {
            origin_name: 'Stansted',
            destination_name: 'Schonefeld',
            departure_date_time_utc: '2019-08-10T06:50:00.000Z',
            arrival_date_time_utc: '2019-08-10T08:40:00.000Z',
            flight_number: '145',
            duration: 110,
          },
        ],
        price: 147.9,
      },
      {
        slices: [
          {
            origin_name: 'Schonefeld',
            destination_name: 'Stansted',
            departure_date_time_utc: '2019-08-08T08:00:00.000Z',
            arrival_date_time_utc: '2019-08-08T10:00:00.000Z',
            flight_number: '8543',
            duration: 120,
          },
          {
            origin_name: 'Stansted',
            destination_name: 'Schonefeld',
            departure_date_time_utc: '2019-08-10T06:50:00.000Z',
            arrival_date_time_utc: '2019-08-10T08:40:00.000Z',
            flight_number: '145',
            duration: 110,
          },
        ],
        price: 147.9,
      },
    ],
  },
};

describe('FlightsService', () => {
  let flightsService: FlightsService;
  let app: TestingModule;

  beforeEach(async () => {
    app = await Test.createTestingModule({
      controllers: [],
      providers: [
        FlightsService,
        CacheService,
        {
          provide: HttpService,
          useValue: {
            get: () => of(response),
          },
        },
        { provide: 'STARTING_CACHE', useValue: {} },
      ],
    }).compile();

    app.enableShutdownHooks();

    flightsService = app.get<FlightsService>(FlightsService);
  });

  afterEach(async () => {
    await app.close();
  });

  describe('getFlights', () => {
    it('should return an array of flights', () => {
      expect(flightsService.getAll()).toStrictEqual([
        {
          arrival_date_time_utc: '2019-08-08T06:25:00.000Z',
          departure_date_time_utc: '2019-08-08T04:30:00.000Z',
          destination_name: 'Stansted',
          duration: 115,
          flight_number: '144',
          origin_name: 'Schonefeld',
          price: 129,
        },
        {
          arrival_date_time_utc: '2019-08-10T07:35:00.000Z',
          departure_date_time_utc: '2019-08-10T05:35:00.000Z',
          destination_name: 'Schonefeld',
          duration: 120,
          flight_number: '8542',
          origin_name: 'Stansted',
          price: 134.81,
        },
        {
          arrival_date_time_utc: '2019-08-08T22:25:00.000Z',
          departure_date_time_utc: '2019-08-08T20:25:00.000Z',
          destination_name: 'Stansted',
          duration: 120,
          flight_number: '8545',
          origin_name: 'Schonefeld',
          price: 134.81,
        },
        {
          arrival_date_time_utc: '2019-08-10T08:40:00.000Z',
          departure_date_time_utc: '2019-08-10T06:50:00.000Z',
          destination_name: 'Schonefeld',
          duration: 110,
          flight_number: '145',
          origin_name: 'Stansted',
          price: 147.9,
        },
        {
          arrival_date_time_utc: '2019-08-08T17:55:00.000Z',
          departure_date_time_utc: '2019-08-08T16:00:00.000Z',
          destination_name: 'Stansted',
          duration: 115,
          flight_number: '146',
          origin_name: 'Schonefeld',
          price: 147.9,
        },
        {
          arrival_date_time_utc: '2019-08-08T10:00:00.000Z',
          departure_date_time_utc: '2019-08-08T08:00:00.000Z',
          destination_name: 'Stansted',
          duration: 120,
          flight_number: '8543',
          origin_name: 'Schonefeld',
          price: 147.9,
        },
      ]);
    });
  });
});
