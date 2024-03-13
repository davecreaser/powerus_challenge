import { Entity, Column, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('flights')
export class Flight {
  @PrimaryColumn()
  id: string;

  @Column()
  origin_name: string;

  @Column()
  destination_name: string;

  @Column()
  departure_date_time_utc: string;

  @Column()
  arrival_date_time_utc: string;

  @Column()
  flight_number: string;

  @Column()
  duration: number;

  @Column()
  price: number;

  @UpdateDateColumn()
  updated_at: number;
}
