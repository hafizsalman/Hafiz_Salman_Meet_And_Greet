import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { Booking } from '../models/booking.model';
import { environment } from '../environments/environment';


@Injectable({
    providedIn: 'root'
})
export class BookingService {
    private apiUrl: string = environment.baseUrl + '/bookings';

    constructor(private http: HttpClient) { }

    public getTodayBookings(): Observable<Booking[] | null> {
        return this.http.get<Booking[]>(this.apiUrl + '/today');
    }

    public createBooking(booking: Booking): Observable<Booking> {
        return this.http.post<Booking>(`${this.apiUrl}`, booking);
    }

    public getBookingsByRoom(roomId: string): Observable<Booking[]> {
        return this.http.get<Booking[]>(`${this.apiUrl}/room/${roomId}`);
    }

    public getBookingsOfUser(): Observable<Booking[]> {
        return this.http.get<Booking[]>(`${this.apiUrl}/user`);
    }

    public deleteBooking(bookingId: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${bookingId}`);
    }

    public updateBooking(booking: Booking): Observable<Booking> {
        return this.http.put<Booking>(`${this.apiUrl}/${booking.id}`, booking);
    }

    public getBookings(): Observable<Booking[]> {
        return this.http.get<Booking[]>(this.apiUrl);
    }

}
