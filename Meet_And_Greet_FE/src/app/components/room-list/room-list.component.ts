import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { RoomService } from '../../services/room.service';
import { Room } from '../../models/room.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoomComponent } from '../room/room.component';
import { BookingComponent } from '../booking/booking.component';
import { Booking } from '../../models/booking.model';
import { BookingService } from '../../services/booking.service';
import { Subscription, interval, Observable, BehaviorSubject } from 'rxjs';


@Component({
  selector: 'app-room-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RoomComponent, BookingComponent],
  templateUrl: './room-list.component.html',
  styleUrl: './room-list.component.scss'
})
export class RoomListComponent implements OnInit, OnDestroy {

  protected rooms: Room[] = [];
  protected filteredRooms: Room[] = [];
  protected searchTerm: string = '';
  protected isNoSearchResults: boolean = false;
  protected sortOption: string = 'name-asc';
  protected sortOptionText: string = 'Sort Name Asc';
  protected isRoomFormVisible: boolean = false;
  protected selectedRoom: Room | null = null;
  protected isShowAlert: boolean = false;
  protected alertMessage = '';
  protected alertType: 'success' | 'danger' = 'success';
  protected deletedRoom: Room | null = null;
  protected deletedRoomIndex: number = -1;
  protected isUndoVisible: boolean = false;
  protected undoTimeout: any;
  protected alertDuration: number = 5000;
  protected progressPercentage: number = 100;
  protected todayBookings: Booking[] = [];
  protected isBookingFormVisible: boolean = false;
  protected isLoading: boolean = false;
  protected minutesUntilNextMeeting = 0;

  private updateSubscription!: Subscription;
  private roomStatusSubjects: { [roomId: string]: BehaviorSubject<any> } = {};
  roomStatuses: { [roomId: string]: Observable<any> } = {};

  constructor(private roomService: RoomService, private bookingService: BookingService, private cdr: ChangeDetectorRef) { }

  public ngOnInit(): void {
    this.isLoading = true;
    this.fetchData();
    this.fetchTodayBookings();
    this.updateSubscription = interval(50000).subscribe(() => {
      this.getRoomStatus();
    });
  }

  public ngOnDestroy(): void {
    if (this.updateSubscription) {
      this.updateSubscription.unsubscribe();
    }
  }

  protected filterRooms(): void {
    const searchTermLower = this.searchTerm.toLowerCase();

    this.filteredRooms = this.rooms.filter((room: Room) => {
      const nameMatch = room.name.toLowerCase().includes(searchTermLower);
      const descriptionMatch = room.description?.toLowerCase().includes(searchTermLower) || false;
      const locationMatch = room.location.toLowerCase().includes(searchTermLower);
      const capacityMatch = room.capacity.toString() === (searchTermLower);

      return nameMatch || descriptionMatch || locationMatch || capacityMatch;
    });

    this.isNoSearchResults = this.filteredRooms.length === 0;
  }

  protected sortRoomsByName(direction: string): void {
    this.sortOption = `name-${direction}`;
    this.sortOptionText = direction === 'asc' ? 'Sort Name Asc' : 'Sort Name Desc';
    this.filteredRooms = this.rooms.sort((a: Room, b: Room) => {
      const comparison = a.name.localeCompare(b.name);
      return direction === 'asc' ? comparison : -comparison;
    });

  }

  protected sortRoomsByCapacity(direction: string): void {
    this.sortOption = `capacity-${direction}`;
    this.sortOptionText = direction === 'asc' ? 'Sort Capacity Asc' : 'Sort Capacity Desc';
    this.filteredRooms = this.rooms.sort((a: Room, b: Room) => {
      const comparison = a.capacity - b.capacity;
      return direction === 'asc' ? comparison : -comparison;
    });

  }

  protected openRoomForm(room: Room | null = null): void {
    this.selectedRoom = room;
    this.isRoomFormVisible = true;
  }

  protected onSaveRoom(room: Room): void {
    if (!room) {
      this.isRoomFormVisible = false;
      return;
    }
    if (this.selectedRoom) {
      const index: number = this.rooms.findIndex((r: Room) => r.id === room.id);
      if (index !== -1) {
        this.rooms[index] = room;
      }
      this.showAlertMessage('Room has been successfully Updated!', 'success');
    } else {

      this.rooms = [...this.rooms, { ...room } as Room];
      this.showAlertMessage('Room has been successfully created!', 'success');
    }

    const sortOption: string[] = this.sortOption.split('-');

    if (sortOption[0] === 'name') {
      this.sortRoomsByName(sortOption[1]);
    } else if (sortOption[0] === 'capacity') {
      this.sortRoomsByCapacity(sortOption[1]);
    }

    this.isRoomFormVisible = false;
  }

  protected sortRooms(): void {
    const sortOption: string[] = this.sortOption.split('-');

    if (sortOption[0] === 'name') {
      this.sortRoomsByName(sortOption[1]);
    } else if (sortOption[0] === 'capacity') {
      this.sortRoomsByCapacity(sortOption[1]);
    }
  }

  protected onSaveError(error: any): void {
    this.showAlertMessage(error, 'danger');
    this.closeRoomForm();
  }

  protected showAlertMessage(message: string, type: 'success' | 'danger'): void {
    this.alertMessage = message;
    this.alertType = type;
    this.isShowAlert = true;
    this.alertDuration = 5000;
    if (this.isUndoVisible) {
      this.progressPercentage = 100;
      this.alertDuration = 10000;
      this.startProgressBar();
    }
    console.log(this.alertDuration)
    setTimeout(() => this.isShowAlert = false, this.alertDuration);
  }

  protected closeRoomForm(): void {
    this.selectedRoom = null;
    this.isRoomFormVisible = false;
  }

  protected deleteRoom(room: Room, index: number): void {
    this.roomService.deleteRoom(room.id).subscribe({
      next: () => {
        this.isUndoVisible = true;
        this.deletedRoom = room;
        this.deletedRoomIndex = index;
        this.rooms.splice(index, 1);
        this.sortRooms();

        this.showAlertMessage(`Room "${room.name}" is being deleted. Do you want to undo?`, 'success');

        this.undoTimeout = setTimeout(() => {
          this.isUndoVisible = false;
          this.resetDeletedRoom();
        }, 10000);
      },
      error: (error) => {
        let message = `Failed to delete room "${room.name}".`;

        if (error.status === 409) {
          message = error.error.message;
        } else if (error.status === 500) {
          message = `Server error: ${error.message || 'An unexpected error occurred.'}`;
        }
        this.showAlertMessage(message, 'danger');
      }
    });
  }

  protected undoDelete(): void {
    clearTimeout(this.undoTimeout);
    this.isUndoVisible = false;

    if (!this.deletedRoom) {
      return;
    }

    this.deletedRoom.isDeleted = false;
    this.roomService.updateRoom(this.deletedRoom, null).subscribe({
      next: () => {
        this.rooms.splice(this.deletedRoomIndex, 0, this.deletedRoom!);
        this.showAlertMessage(`Room "${this.deletedRoom?.name}" has been restored.`, 'success');
        this.resetDeletedRoom();
        this.sortRooms();
      },
      error: (error) => {
        let message = `Failed to restore room "${this.deletedRoom?.name}".`;

        if (error.status === 500) {
          message = `Server error: ${error.message || 'An unexpected error occurred.'}`;
        }
        this.showAlertMessage(message, 'danger');
      }
    });
  }

  protected updateRoom(room: Room): void {
    this.selectedRoom = room;
    this.isRoomFormVisible = true;
  }


  protected openBookingForm(room: Room | null): void {

    this.selectedRoom = room;
    this.isBookingFormVisible = true;
  }

  protected closeBookingForm(): void {
    this.isBookingFormVisible = false;
  }

  protected onBookingSaved(booking: Booking): void {
    if (!booking) {
      this.closeBookingForm();
      return;
    }
    if(new Date(booking.startTime).getDate() === (new Date()).getDate()){
      this.todayBookings.push(booking);
    }
    this.isBookingFormVisible = false;
    this.showAlertMessage('Room has been successfully Booked!', 'success');

  }

  public onBookingError(error: any): void {
    this.showAlertMessage(error, 'danger');
    this.closeBookingForm();
  }

  protected dismissAlert(): void {
    this.isShowAlert = false;
  }

  protected fetchTodayBookings(): void {
    this.bookingService.getTodayBookings().subscribe((todayBookings: Booking[] | null) => {
      this.todayBookings = todayBookings ?? [];
    });
  }

  protected isBookingInProgress(room: Room): boolean {
    const now: Date = new Date();
    return this.getBookingsForRoom(room.id).some((booking: Booking) =>
      now >= new Date(booking.startTime) && now <= new Date(booking.endTime)
    );
  }

  protected hasUpcomingBookings(room: Room): boolean {
    const now: Date = new Date();
    const nextBooking: Booking | undefined = this.getBookingsForRoom(room.id).find((booking: Booking) => new Date(booking.startTime) > now);
    return nextBooking !== undefined;
  }

  protected getCurrentMeetingName(roomId: string): string {
    const now: Date = new Date();
    const currentBooking: Booking | undefined = this.getBookingsForRoom(roomId).find((booking: Booking) =>
      now >= new Date(booking.startTime) && now <= new Date(booking.endTime)
    );
    return currentBooking ? currentBooking.name : '';
  }

  protected getNextMeetingTime(roomId: string): string {
    const now: Date = new Date();
    const futureBookings: Booking[] = this.getBookingsForRoom(roomId).filter((booking: Booking) =>
      new Date(booking.startTime) > now
    );

    futureBookings.sort((a: Booking, b: Booking) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    return futureBookings.length > 0 ? new Date(futureBookings[0].startTime)
      .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '';
  }

  protected getNextMeetingName(roomId: string): string {
    const now: Date = new Date();
    const nextBooking: Booking | undefined = this.getBookingsForRoom(roomId).find((booking: Booking) => new Date(booking.startTime) > now);
    return nextBooking ? nextBooking.name : '';
  }

  protected getNextFreeTime(roomId: string): string {
    const now: Date = new Date();
    const today: string = now.toDateString();
    const tomorrow: Date = new Date(now);
    tomorrow.setDate(now.getDate() + 1);

    const currentBooking: Booking | undefined = this.getBookingsForRoom(roomId).find((booking: Booking) =>
      now >= new Date(booking.startTime) && now <= new Date(booking.endTime)
    );

    if (currentBooking) {
      const endTime: Date = new Date(currentBooking.endTime);
      const endDate: string = endTime.toDateString();

      if (endDate === today) {
        return `Will be free at ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`;
      } else if (endDate === tomorrow.toDateString()) {
        return `Will be free tomorrow at ${endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}`;
      } else {
        return `Will be free on ${endTime.toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false })}`;
      }
    }
    return '';
  }

  protected isMeetingWithin30Minutes(room: Room): boolean {
    const now: Date = new Date();
    const nextBooking: Booking | undefined = this.getBookingsForRoom(room.id)
      .find((booking: Booking) => new Date(booking.startTime) > now);

    if (nextBooking) {
      const timeUntilNextMeeting = (new Date(nextBooking.startTime).getTime() - now.getTime()) / (1000 * 60);
      return timeUntilNextMeeting <= 30;
    }
    return false;
  }

  protected getMinutesUntilNextMeeting(roomId: string): number {
    const now: Date = new Date();
    const nextBooking: Booking | undefined = this.getBookingsForRoom(roomId)
      .find((booking: Booking) => new Date(booking.startTime) > now);

    if (nextBooking) {
      const timeUntilNextMeeting = (new Date(nextBooking.startTime).getTime() - now.getTime()) / (1000 * 60);
      return Math.ceil(timeUntilNextMeeting);
    }
    return 0;
  }


  private getBookingsForRoom(roomId: string): Booking[] {
    return this.todayBookings.filter((booking: Booking) => booking.room.id === roomId);
  }

  private resetDeletedRoom(): void {
    this.deletedRoom = null;
    this.deletedRoomIndex = -1;
    this.isUndoVisible = false;
  }

  private fetchData(): void {
    this.roomService.getRooms().subscribe((data: Room[] | null) => {
      if (data === null) {
        this.showAlertMessage('Server is down, please try again later.', 'danger');
      } else {
        this.rooms = data;
        this.filteredRooms = data;
        this.sortRoomsByName("asc");
        this.rooms.forEach(room => {
          this.roomStatusSubjects[room.id] = new BehaviorSubject(null);
          this.roomStatuses[room.id] = this.roomStatusSubjects[room.id].asObservable();
          console.log(room.id);
        });
        this.getRoomStatus();
      }

      this.isLoading = false;
    });
  }

  private startProgressBar(): void {
    const intervalTime = 50;
    const step = (intervalTime / this.alertDuration) * 100;

    const interval = setInterval(() => {
      this.progressPercentage -= step;
      if (this.progressPercentage <= 0) {
        clearInterval(interval);
      }
    }, intervalTime);
  }

  private getRoomStatus() {
    const now = new Date();
    this.rooms.forEach(room => {
      if (this.roomStatusSubjects[room.id]) {
        this.roomStatusSubjects[room.id].next({
          isBookingInProgress: this.isBookingInProgress(room),
          isMeetingWithin30Minutes: this.isMeetingWithin30Minutes(room),
          minutesUntilNextMeeting: this.getMinutesUntilNextMeeting(room.id),
          nextMeetingName: this.getNextMeetingName(room.id),
          nextMeetingTime: this.getNextMeetingTime(room.id)
        });
      } 
      this.cdr.detectChanges();
      })

  }


}
