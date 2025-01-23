import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { uniqueRoomNameAndLocationValidator } from '../../validators/unique-room-name-location.validator';
import { positiveNumberValidator } from '../../validators/postive-number.validator';
import { noWhitespaceValidator } from '../../validators/white-space.validator';
import { RoomService } from '../../services/room.service';
import { catchError, of, Subscription } from 'rxjs';
import { Room } from '../../models/room.model';



@Component({
  selector: 'app-room',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './room.component.html',
  styleUrl: './room.component.scss'
})
export class RoomComponent implements OnInit, OnDestroy {

  @Input() public room: Room | null = null;

  @Output() public saveRoom = new EventEmitter<Room>();
  @Output() public saveError = new EventEmitter<string>();

  protected roomForm!: FormGroup;
  protected imagePreview: string | ArrayBuffer | null = null;
  protected selectedImage: File | null = null;
  protected isImageSubmitted: boolean = false;
  protected isSaveButtonDisabled: boolean = true;
  private subscription: Subscription | null = null;

  constructor(private fb: FormBuilder, private roomService: RoomService, private cdr: ChangeDetectorRef) {
    this.initializeValidator();
  }

  public ngOnInit(): void {
    this.initializeForm();
    this.subscribeToFormStatusChanges();
    this.subscribeToLocationChanges();
  }


  public ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.isImageSubmitted = false;
    this.selectedImage = null;
    this.imagePreview = null;
    this.roomForm.reset();
  }
  protected onImageChange(event: Event): void {
    const file: File | undefined = (event.target as HTMLInputElement)?.files?.[0];
    const control = this.roomForm.get('image');

    if (file) {
      this.selectedImage = file;
      const reader: FileReader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result;
      };
      reader.readAsDataURL(file);
      control?.setValue(file);
    }
    else {
      control?.setValue(null);
      this.isImageSubmitted = false;
      this.selectedImage = null;
      this.imagePreview = null;
    }
  }

  protected save(): void {
    if (this.isSaveButtonDisabled) {
      return;
    }

    this.isImageSubmitted = true;
    const trimmedFormValues: Room = {
      ...this.roomForm.value,
      name: this.roomForm.value.name.trim(),
      location: this.roomForm.value.location.trim(),
      description: this.roomForm.value.description?.trim() || ''
    };

    if (this.room) {
      this.updateRoom(trimmedFormValues);
    } else {
      this.addRoom(trimmedFormValues);
    }

  }

  protected close(): void {
    this.saveRoom.emit();
  }

  protected errorMessageForNameAndLocation(controlName: string): string | null {
    const control = this.roomForm.get(controlName);
    if (!control) return null;
    const errors = control.errors;
    if (!errors) return null;
    if (errors['whitespace']) {
      return 'This field cannot contain white spaces.';
    }
    else if (errors['required']) {
      return 'This field is required.';
    }
    else if (errors['minlength']) {
      return `Minimum length is ${errors['minlength'].requiredLength} characters.`;
    }
    else if (errors['maxlength']) {
      return `Maximum length is ${errors['maxlength'].requiredLength} characters.`;
    }
    else if (errors['roomNameAndLocationAlreadyTaken']) {
      return 'A room with this name and location already exists.';
    }
    return null;
  }

  private initializeValidator() {
    const validator = uniqueRoomNameAndLocationValidator(this.roomService);
    this.roomForm = this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(30), noWhitespaceValidator], [validator]],
      capacity: [1, [Validators.required, Validators.max(100), positiveNumberValidator()]],
      description: ['', [Validators.maxLength(100), noWhitespaceValidator]],
      location: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100), noWhitespaceValidator], [validator]],
      image: [null, [Validators.required]]
    }
    );
  }

  private initializeForm(): void {
    if (!this.room) {
      return;
    }

    this.preloadImage(this.room?.image).then(() => {
      this.imagePreview = this.room?.image ?? null;
      this.cdr.markForCheck();
    });

    this.roomForm.patchValue(this.room);

  }

  private preloadImage(url: string): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;
      img.onload = () => resolve();
    });
  }

  private subscribeToFormStatusChanges(): void {
    this.roomForm.statusChanges.subscribe(() => {
      this.roomForm.updateValueAndValidity();
      let isValid: boolean = true;
      for (const controlName in this.roomForm.controls) {
        const control = this.roomForm.get(controlName);
        if (control?.errors) {
          isValid = false;
        }
      }
      this.isSaveButtonDisabled = !isValid;
    });
  }

  private subscribeToLocationChanges(): void {
    this.roomForm.get('location')?.valueChanges.subscribe(() => {
      this.roomForm.get('name')?.updateValueAndValidity();
    });
  }

  private addRoom(trimmedFormValues: Room): void {
    if (!this.selectedImage) {
      return;
    }
    
    this.subscription = this.roomService.addRoom(trimmedFormValues, this.selectedImage).pipe(
      catchError(() => {
        this.saveError.emit('Failed to create the room. Please try again later.');
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        if (!response) {
          this.saveError.emit('Failed to create the room. Please try again later.');
          return;
        }
        this.saveRoom.emit(response as Room);
      }
    });
  }

  private updateRoom(trimmedFormValues: Room): void {
    const updatedRoom: Room = { ...trimmedFormValues, id: this.room?.id ?? '' };

    this.subscription = this.roomService.updateRoom(updatedRoom, this.selectedImage).pipe(
      catchError(() => {
        this.saveError.emit('Failed to update the room. Please try again later.');
        return of(null);
      })
    ).subscribe({
      next: (response) => {
        if (!response) {
          this.saveError.emit('Failed to update the room. Please try again later.');
          return;
        }
        this.saveRoom.emit(response as Room);
      }
    });
  }
}
