import { Test, TestingModule } from '@nestjs/testing';
import { DbService } from './db.service';
import { MoreThan, Repository } from 'typeorm';
import { Flight } from './flight.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { INVALIDATION_TIME } from '../constants';
import { UpsertFlightDto } from './upsert-flight.dto';

type MockType<T> = {
  [P in keyof T]?: jest.Mock<object>;
};

const repositoryMockFactory: () => MockType<Repository<Flight>> = jest.fn(
  () => ({
    find: jest.fn((entity) => entity),
    upsert: jest.fn(),
  }),
);

describe('DbService', () => {
  let service: DbService;
  let repositoryMock: MockType<Repository<Flight>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DbService,
        {
          provide: getRepositoryToken(Flight),
          useFactory: repositoryMockFactory,
        },
      ],
    }).compile();

    service = module.get<DbService>(DbService);
    repositoryMock = module.get(getRepositoryToken(Flight));
  });

  it('should find all valid flights from the db', async () => {
    const mockDateObject = new Date('1994-06-28');
    jest
      .spyOn(global.Date, 'now')
      .mockImplementation(() => mockDateObject.getTime());

    const dbFlights: Flight[] = [
      {
        id: '1442019-08-08T04:30:00.000Z',
        origin_name: 'Schonefeld',
        destination_name: 'Stansted',
        departure_date_time_utc: '2019-08-08T04:30:00.000Z',
        arrival_date_time_utc: '2019-08-08T06:25:00.000Z',
        flight_number: '144',
        duration: 115,
        price: 140,
        updated_at: Date.now(),
      },
      {
        id: '85422019-08-10T05:35:00.000Z',
        origin_name: 'Stansted',
        destination_name: 'Schonefeld',
        departure_date_time_utc: '2019-08-10T05:35:00.000Z',
        arrival_date_time_utc: '2019-08-10T07:35:00.000Z',
        flight_number: '8542',
        duration: 120,
        price: 140,
        updated_at: Date.now(),
      },
    ];
    repositoryMock.find.mockReturnValue(dbFlights);
    const flights = await service.findAll();
    expect(flights).toEqual(dbFlights);

    expect(repositoryMock.find).toHaveBeenCalledWith({
      where: { updated_at: MoreThan(Date.now() - INVALIDATION_TIME) },
    });
  });

  it('should upsert flights to the db', async () => {
    const mockDateObject = new Date('1994-06-28');
    jest
      .spyOn(global.Date, 'now')
      .mockImplementation(() => mockDateObject.getTime());

    const newFlight: UpsertFlightDto = {
      id: '85422019-08-10T05:35:00.000Z',
      origin_name: 'Stansted',
      destination_name: 'Schonefeld',
      departure_date_time_utc: '2019-08-10T05:35:00.000Z',
      arrival_date_time_utc: '2019-08-10T07:35:00.000Z',
      flight_number: '8542',
      duration: 120,
      price: 140,
    };
    await service.upsert(newFlight);

    expect(repositoryMock.upsert).toHaveBeenCalledWith(
      { ...newFlight, updated_at: Date.now() },
      ['id'],
    );
  });
});
