import { Room } from './room.model';
export interface Booking {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    room : Room;
    user: {
        firstName: string;
    }
    isMyBooking: boolean;
  }
