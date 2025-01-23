import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Booking } from '../../models/booking.model';
import { BookingService } from '../../services/booking.service';
import { startOfDay, addDays, subDays, addWeeks, subWeeks, startOfWeek, endOfWeek } from 'date-fns';
import { CalendarEvent, CalendarView, CalendarModule } from 'angular-calendar';
import { CommonModule } from '@angular/common';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDatepickerConfig } from 'ngx-bootstrap/datepicker';
import { BsDatepickerDirective } from 'ngx-bootstrap/datepicker';
import { BookingComponent } from '../booking/booking.component';
import { Subject } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-booking-overview',
  standalone: true,
  imports: [CommonModule, CalendarModule, FormsModule, BsDatepickerModule, BookingComponent],
  templateUrl: './booking-overview.component.html',
  styleUrls: ['./booking-overview.component.scss']
})
export class BookingOverviewComponent implements OnInit {


  @ViewChild('calendarContainer') calendarContainer!: ElementRef;
  @ViewChild(BsDatepickerDirective, { static: false }) datepicker!: BsDatepickerDirective;

  protected bookings: Booking[] = [];
  protected myBookings: Booking[] = [];
  protected viewMode: 'list' | 'day' | 'today' | 'week' = 'week';
  protected currentDate: Date = new Date();
  protected view: CalendarView = CalendarView.Week;
  protected events: CalendarEvent[] = [];
  protected bsConfig!: Partial<BsDatepickerConfig>;
  protected refresh: Subject<any> = new Subject();
  protected isBookingFormVisible: boolean = false;
  protected selectedBooking!: Booking;
  protected showMyBookings: boolean = false;
  protected currentWeekStart: Date = startOfWeek(new Date(), { weekStartsOn: 1 });
  protected currentWeekEnd: Date = endOfWeek(new Date(), { weekStartsOn: 1 });
  protected alertMessage: string | null = null;
  protected isShowAlert: boolean = false;
  protected alertType: 'success' | 'danger' = 'success';
  protected isTodaySelected: boolean = false;


  constructor(private bookingService: BookingService) { }

  public ngOnInit(): void {
    this.loadBookings();
    this.loadMyBookings();
    this.initCalendar();
  }

  protected changeView(mode: 'list' | 'day' | 'week' | 'today' | null): void {
    this.viewMode = mode ?? this.viewMode;
    if (mode === 'today') {
      this.isTodaySelected = true;
      this.viewMode = 'day';
    } else if (mode != null && this.isTodaySelected) {
      this.isTodaySelected = false;
    }
    this.currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    this.currentWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    switch (mode) {
      case 'day':
        this.view = CalendarView.Day;
        this.currentDate = new Date();
        break;
      case 'today':
        this.view = CalendarView.Day;
        this.currentDate = new Date();
        break;
      case 'week':
        this.view = CalendarView.Week;
        break;
      case 'list':
        this.view = CalendarView.Month;
        this.currentDate = new Date();
        break;
    }
    setTimeout(() => {
      this.scrollToCurrentTime();
    }, 0);
    this.refresh.next(true);
  }

  protected scrollToCurrentTime(): void {
    setTimeout(() => {
      const calendarContainer = document.querySelector('.calendar-container');
      if (calendarContainer) {
        const now = new Date();
        const minutes = now.getHours() * 60 + now.getMinutes();
        const scrollPosition = (minutes / 30) * 30;
        calendarContainer.scrollTop = scrollPosition - 100;
      }
    }, 100);
  }

  protected goForward(): void {
    if (this.viewMode === 'week') {
      this.currentDate = addWeeks(this.currentWeekStart, 1);
      this.currentWeekStart = addDays(this.currentWeekStart, 7);
      this.currentWeekEnd = addDays(this.currentWeekEnd, 7);
    }
    else if (this.viewMode === 'day' || this.viewMode === 'list') {
      this.currentDate = addDays(this.currentDate, 1);
      this.currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      this.currentWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    }
    setTimeout(() => {
      this.scrollToCurrentTime();
    }, 0);
  }

  protected goBack(): void {
    if (this.viewMode === 'week') {
      this.currentDate = subWeeks(this.currentDate, 1);
      this.currentWeekStart = subDays(this.currentWeekStart, 7);
      this.currentWeekEnd = subDays(this.currentWeekEnd, 7);
    } else if (this.viewMode === 'day' || this.viewMode === 'list') {
      this.currentDate = subDays(this.currentDate, 1);
    }

    setTimeout(() => {
      this.scrollToCurrentTime();
    }, 0);
  }
  protected getGroupedBookings(): { date: Date, bookings: Booking[] }[] {
    const today = startOfDay(this.currentDate);
    const thirtyDaysLater = addDays(today, 30);
    const filteredBookings = this.filteredBookings().filter(booking =>
      new Date(booking.startTime) >= today && new Date(booking.startTime) <= thirtyDaysLater
    );

    const grouped: { [date: string]: Booking[] } = {};

    filteredBookings.forEach((booking) => {
      const bookingDate = startOfDay(new Date(booking.startTime)).toISOString();
      if (!grouped[bookingDate]) {
        grouped[bookingDate] = [];
      }
      grouped[bookingDate].push(booking);
    });

    return Object.keys(grouped)
      .map(date => ({
        date: new Date(date),
        bookings: grouped[date].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  protected onDateChange(date: Date | null): void {
    if (date) {
      this.currentDate = date;

      if (this.viewMode === 'day') {
        this.currentDate = startOfDay(date);
      } else if (this.viewMode === 'week') {
        this.currentWeekStart = startOfWeek(date, { weekStartsOn: 1 });
        this.currentWeekEnd = endOfWeek(date, { weekStartsOn: 1 });
      } else if (this.viewMode === 'list') {
        this.currentDate = date;
      }

      this.loadBookings();
      this.loadMyBookings();
      this.refresh.next(true);
    }
  }

  protected filteredEvents(): CalendarEvent[] {
    if (this.showMyBookings) {
      const myBookingIds = this.myBookings.map(booking => booking.id);
      return this.events.filter(event => myBookingIds.includes(event.meta.booking.id));
    }
    return this.events;
  }

  protected showAlertMessage(message: string, type: 'success' | 'danger'): void {
    this.alertMessage = message;
    this.isShowAlert = true;
    this.alertType = type;
    setTimeout(() => this.isShowAlert = false, 5000);
  }

  protected dismissAlert(): void {
    this.isShowAlert = false;
  }

  protected openBooking(event: CalendarEvent | any): void {
    this.selectedBooking = event.event.meta.booking;
    this.openBookingForm(this.selectedBooking);
  }

  protected openBookingForm(booking: Booking): void {
    this.selectedBooking = booking;
    this.selectedBooking.isMyBooking = this.myBookings.some(
      (myBooking) => myBooking.id === this.selectedBooking.id
    );
    this.isBookingFormVisible = true;
  }

  protected onBookingSaved(booking: Booking): void {
    if (!booking) {
      this.isBookingFormVisible = false;
      return;
    }
    this.isBookingFormVisible = false;
    this.showAlertMessage('Booking Updated successfully.', 'success');
    this.loadBookings();
  }

  protected onSaveError(error: any): void {
    this.showAlertMessage('Failed to save booking.', 'danger');
  }

  protected onBookingDeleted(): void {
    this.loadBookings();
    this.showAlertMessage('Booking successfully deleted.', 'success');
  }

  protected onDeleteError(error: any): void {
    this.showAlertMessage('Failed to delete booking.', 'success');
  }

  private populateEvents(): void {
    const now: Date = new Date();
    this.events = this.bookings.map(booking => this.mapBookingToEvent(booking, now));
    this.refresh.next(true);
  }

  private mapBookingToEvent(booking: Booking, now: Date): CalendarEvent {
    const start: Date = new Date(booking.startTime);
    const end: Date = new Date(booking.endTime);
    const color: string = this.getStyleClasses(start, end, now);

    return {
      start: start,
      end: end,
      id: booking.id,
      title: this.formatEventTitle(booking.name, '#1B1B1B', color),
      allDay: false,
      color: {
        primary: color,
        secondary: color,
        secondaryText: '#1B1B1B',
      },
      meta: { booking },
    };
  }

  private getStyleClasses(start: Date, end: Date, now: Date): string {
    if (end < now) {
      return '#B0BEC5'
    } else if (start <= now && end >= now) {
      return '#A8D5BA'
    } else {
      return '#A8D5BA'
    }
  }

  private formatEventTitle(name: string, badgeClass: string, dotClass: string): string {
    return `
      <span class="badge ${badgeClass} me-2"></span>
      <span class="${dotClass}">●</span>
      <span class="fw-bold fs-7">${name}</span>
    `;
  }

  private filteredBookings(): Booking[] {
    return this.showMyBookings ? this.myBookings : this.bookings;
  }

  private initCalendar(): void {
    this.bsConfig = {
      containerClass: 'calendar-color',
      showWeekNumbers: false,
      adaptivePosition: true,
      displayOneMonthRange: true,
    };
  }

  private loadBookings(): void {
    this.bookingService.getBookings().subscribe((bookings: Booking[]) => {
      this.bookings = bookings;
      this.populateEvents();
      setTimeout(() => {
        this.scrollToCurrentTime();
      });
    });
  }

  private loadMyBookings(): void {
    this.bookingService.getBookingsOfUser().subscribe((bookings: Booking[]) => {
      this.myBookings = bookings;
    });
  }

}
