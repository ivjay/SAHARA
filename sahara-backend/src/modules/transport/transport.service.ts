import { Injectable } from '@nestjs/common';

@Injectable()
export class TransportService {
  async searchBus(from: string, to: string, date: string) {
    return {
      provider: 'MockBusNepal',
      from,
      to,
      date,
      available: [
        { bus: 'Deluxe Express', time: '10:00', price: 1500 },
        { bus: 'Super Deluxe', time: '14:00', price: 1800 },
      ],
    };
  }

  async searchMovie(location: string, date: string) {
    return {
      provider: 'MockCinemas',
      location,
      date,
      movies: [
        { title: 'Avatar 3', time: '5:00 PM', hall: 'QFX' },
        { title: 'Deadpool 3', time: '8:00 PM', hall: 'Bhatbhateni Cinema' },
      ],
    };
  }

  async searchFlight(from: string, to: string, date: string) {
    return {
      provider: 'MockAirlines',
      from,
      to,
      date,
      flights: [
        { airline: 'Buddha Air', time: '7:00 AM', price: 5500 },
        { airline: 'Yeti Airlines', time: '12:00 PM', price: 5200 },
      ],
    };
  }
}
