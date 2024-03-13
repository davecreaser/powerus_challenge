import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class UpsertFlightDto {
  @IsNotEmpty({ message: 'Field id must be added' })
  @IsString()
  id: string;

  @IsNotEmpty({ message: 'Field origin_name must be added' })
  @IsString()
  origin_name: string;

  @IsNotEmpty({ message: 'Field destination_name must be added' })
  @IsString()
  destination_name: string;

  @IsNotEmpty({ message: 'Field departure_date_time_utc must be added' })
  @IsString()
  departure_date_time_utc: string;

  @IsNotEmpty({ message: 'Field arrival_date_time_utc must be added' })
  @IsString()
  arrival_date_time_utc: string;

  @IsNotEmpty({ message: 'Field flight_number must be added' })
  @IsString()
  flight_number: string;

  @IsNotEmpty({ message: 'Field duration must be added' })
  @IsNumber()
  duration: number;

  @IsNotEmpty({ message: 'Field price must be added' })
  @IsNumber()
  price: number;
}
