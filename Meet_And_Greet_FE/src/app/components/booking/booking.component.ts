import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { Booking } from '../../models/booking.model';
import { Room } from '../../models/room.model';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { validateEndDate, validateEndTime } from '../../validators/data-time.validator';
import { noWhitespaceValidator } from '../../validators/white-space.validator';
import { minDateValidator, minTimeValidator } from '../../validators/min-date-time.validator';
import { timeSlotBookedValidator } from '../../validators/booking-time-slot.validator';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {

  @Input() public room!: Room;
  @Input() public booking: Booking | null = null;

  @Output() public bookingSaved = new EventEmitter<Booking>();
  @Output() public bookingDeleted = new EventEmitter<Booking>();
  @Output() public bookingError = new EventEmitter<string>();

  protected bookingForm!: FormGroup;
  protected isLoading: boolean = false;
  protected errorMessage: string = '';
  protected timeSlots: string[] = [];
  protected bookings: Booking[] = [];
  protected isPreviousMeeting: boolean = false;
  protected isDeleteConfirmationVisible: boolean = false;


  constructor(private fb: FormBuilder, private bookingService: BookingService, private modalService: NgbModal
  ) {
    this.createForm();
  }

  public ngOnInit(): void {
    this.initializeRoom();
    this.initializeForm();
    this.loadBookedSlots();
    this.generateTimeSlots();

    this.bookingForm.get('startDate')?.valueChanges.subscribe(() => {
      this.bookingForm.get('endDate')?.updateValueAndValidity();
    });
    this.bookingForm.get('startTime')?.valueChanges.subscribe(() => {
      this.bookingForm.get('endTime')?.updateValueAndValidity();
    });
  }

  protected minStartDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  protected isSaveDisabled(): boolean {
    return this.bookingForm.invalid || this.bookingForm.pristine || this.isLoading || this.isPreviousMeeting || !this.isMyBooking();
  }

  protected getSaveButtonText(): string {
    return this.booking ? 'Update ' : 'Save ';
  }

  protected getTitle(): string {
    if (this.isPreviousMeeting || !this.isMyBooking()) {
      return 'Room :';
    }
    return this.booking ? 'Edit Booking :' : 'Book Room :';
  }

  private isMyBooking(): boolean {
    return this.booking === null ? true : this.booking.isMyBooking;
  }

  protected saveBooking(): void {
    if (this.bookingForm.invalid) {
      return;
    }

    const formValue = this.bookingForm.value;
    const startDateTime: string = this.combineDateTime(formValue.startDate, formValue.startTime);
    const endDateTime: string = this.combineDateTime(formValue.endDate, formValue.endTime);

    const bookingData: Booking = {
      id: this.booking?.id ?? '',
      name: formValue.title,
      startTime: startDateTime,
      endTime: endDateTime,
      room: this.room,
      isMyBooking: false,
      user: { firstName: '' }
    };
    this.isLoading = true;
    if (!this.booking) {
      this.bookingService.createBooking(bookingData).subscribe({
        next: (result: Booking) => {
          this.isLoading = false;
          this.bookingSaved.emit(result);
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'Failed to create the booking. Please try again.';
          this.bookingError.emit(this.errorMessage);
        }
      });
    }
    else {
      this.bookingService.updateBooking(bookingData).subscribe({
        next: (result: Booking) => {
          this.isLoading = false;
          this.bookingSaved.emit(result);
        },
        error: () => {
          this.isLoading = false;
          this.errorMessage = 'Failed to update the booking. Please try again.';
          this.bookingError.emit(this.errorMessage);
        }
      });
    }
  }

  protected openDeleteModal(): void {
    this.isDeleteConfirmationVisible = true;
  }

  protected confirmDelete(): void {
    this.deleteBooking();
    this.closeModal();
  }

  protected cancelDelete(): void {
    this.isDeleteConfirmationVisible = false;
  }

  protected deleteBooking(): void {
    this.isLoading = true;
    this.bookingService.deleteBooking(this.booking?.id ?? '').subscribe({
      next: () => {
        this.isLoading = false;
        this.close();
        this.bookingDeleted.emit();
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Failed to delete the booking. Please try again.';
        this.bookingError.emit(this.errorMessage);
      }
    });
  }

  protected closeModal(): void {
    this.isDeleteConfirmationVisible = false;
  }

  protected isDeleteVisible(): boolean {
    return this.booking !== null && !this.isPreviousMeeting && this.isMyBooking();
  }

  protected isSaveVisible(): boolean {
    return (this.booking !== null && !this.isPreviousMeeting && this.isMyBooking())
      || (this.booking === null);
  }

  protected close(): void {
    this.bookingSaved.emit();
  }

  protected isBookingOverview(): boolean {
    return this.booking !== null
  }

  private combineDateTime(date: string, time: string): string {
    return `${date}T${time}:00`;
  }

  private loadBookedSlots(): void {
    this.bookingService.getBookingsByRoom(this.room.id).subscribe(bookings => {
      this.bookings = bookings;
      this.initilizeForm();
      this.bookingForm.get('endDate')?.setValidators([
        Validators.required,
        validateEndDate(),
        timeSlotBookedValidator(this.bookings)
      ]);
      this.bookingForm.get('endTime')?.setValidators([
        Validators.required,
        validateEndTime(),
        timeSlotBookedValidator(this.bookings)
      ]);

    });
  }

  private createForm(): void {
    this.bookingForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(25), noWhitespaceValidator]],
      startDate: ['', [Validators.required, minDateValidator()]],
      startTime: ['', [Validators.required, minTimeValidator()]],
      endDate: [''],
      endTime: ['', [Validators.required, validateEndTime()]]
    });
  }

  private initializeRoom(): void {
    this.room = this.room ?? (this.booking ? { id: this.booking.room.id, name: this.booking.room.name }
      : { id: '', name: '' });
  }

  private initializeForm(): void {
    if (this.booking && new Date(this.booking.startTime) < new Date()) {
      this.isPreviousMeeting = true;
    }

    if (this.booking && (!this.booking.isMyBooking || this.isPreviousMeeting)) {
      this.bookingForm.disable();
    } else {
      this.bookingForm.enable();
    }
  }

  private generateTimeSlots(): void {
    const startTime: Date = new Date();
    startTime.setHours(0, 0, 0, 0);

    for (let i = 0; i < 24 * 2; i++) {
      const hours = startTime.getHours().toString().padStart(2, '0');
      const minutes = startTime.getMinutes().toString().padStart(2, '0');
      this.timeSlots.push(`${hours}:${minutes}`);
      startTime.setMinutes(startTime.getMinutes() + 30);
    }
  }

  private initilizeForm(): void {
    const now: Date = new Date();
    let startDateTime: Date = this.roundToNearestQuarter(now);
    let bookedSlot: Booking | null = this.getBookedSlot(startDateTime);

    while (bookedSlot) {
      startDateTime = new Date(bookedSlot.endTime);
      bookedSlot = this.getBookedSlot(startDateTime);
    }

    const endDateTime: Date = new Date(startDateTime.getTime() + 30 * 60000);
    if (this.booking) {
      this.bookingForm.patchValue({
        title: this.booking.name,
        startDate: this.formatDate(new Date(this.booking.startTime)),
        startTime: this.formatTime(new Date(this.booking.startTime)),
        endDate: this.formatDate(new Date(this.booking.endTime)),
        endTime: this.formatTime(new Date(this.booking.endTime))
      })
    }
    else {
      this.bookingForm.patchValue({
        startDate: this.formatDate(startDateTime),
        startTime: this.formatTime(startDateTime),
        endDate: this.formatDate(endDateTime),
        endTime: this.formatTime(endDateTime)
      });
    }
  }

  private getBookedSlot(dateTime: Date): Booking | null {
    return this.bookings.find(booking =>
      dateTime >= new Date(booking.startTime) && dateTime < new Date(booking.endTime)
    ) || null;
  }

  private roundToNearestQuarter(date: Date): Date {
    const minutes: number = date.getMinutes();
    const roundedMinutes: number = Math.ceil(minutes / 30) * 30;
    const roundedDate: Date = new Date(date);
    roundedDate.setMinutes(roundedMinutes, 0, 0);
    return roundedDate;
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private formatTime(date: Date): string {
    return date.toTimeString().substring(0, 5);
  }

}
