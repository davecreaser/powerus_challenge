export interface Flight {
  origin_name: string;
  destination_name: string;
  departure_date_time_utc: string;
  arrival_date_time_utc: string;
  flight_number: string;
  duration: number;
  price?: number;
  updated_at?: number;
}

export type FlightResponse = {
  slices: Flight[];
  price: number;
}[];
