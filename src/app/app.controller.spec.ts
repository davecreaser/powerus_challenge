import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { FlightsService } from '../flights/flights.service';
import { Flight } from '../flights/flight.interface';

describe('AppController', () => {
  let appController: AppController;
  let flightsService: FlightsService;

  const result: Flight[] = [
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
  ];

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: FlightsService,
          useValue: {
            search: jest.fn(() => result),
            getAll: () => result,
          },
        },
      ],
    }).compile();

    flightsService = app.get<FlightsService>(FlightsService);
    appController = app.get<AppController>(AppController);
  });

  describe('getFlights', () => {
    it('should return an array of flights', async () => {
      const flights = await appController.getFlights();
      expect(flights).toBe(result);
    });
  });

  describe('searchFlights', () => {
    it('should return an array of flights', async () => {
      const flights = await appController.searchFlights('Stansted');
      expect(flights).toBe(result);
      expect(flightsService.search).toHaveBeenCalledWith({
        destination_name: null,
        origin_name: 'Stansted',
      });
    });
  });
});
