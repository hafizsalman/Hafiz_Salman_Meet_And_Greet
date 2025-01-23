import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, timeout, throwError, Observable, of } from 'rxjs';
import { Room } from '../models/room.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoomService {

  private apiUrl = environment.baseUrl + '/rooms';

  constructor(private http: HttpClient) {}

  public getRooms(): Observable<Room[] | null> {
    return this.http.get<Room[]>(this.apiUrl);
  }

  public addRoom(room: Room, image: File): Observable<any> {
    const formData = new FormData();

    formData.append('room', new Blob([JSON.stringify(room)], { type: 'application/json' }));
    formData.append('image', image);

    return this.http.post<Room>(this.apiUrl, formData)
      .pipe(
        catchError(err => throwError(() => new Error('Error in adding room')))
      );
  }

  public checkRoomUnique(name: string, location: string, id?: string): Observable<boolean> {
    let params = new HttpParams().set('name', name).set('location', location);

    if (id) {
      params = params.set('id', id);
    }

    return this.http.get<boolean>(`${this.apiUrl}/check-unique`, { params });
  }

  public updateRoom(room: Room, image: File | null): Observable<any> {
    const formData = new FormData();
    formData.append('room', new Blob([JSON.stringify(room)], { type: 'application/json' }));
    if (image) {
      formData.append('image', image);
    }
    return this.http.put<Room>(`${this.apiUrl}/${room.id}`, formData)
      .pipe(
        catchError(err => throwError(() => new Error('Error in updating room')))
      );
  }

  public deleteRoom(roomId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${roomId}`);
  }




}
