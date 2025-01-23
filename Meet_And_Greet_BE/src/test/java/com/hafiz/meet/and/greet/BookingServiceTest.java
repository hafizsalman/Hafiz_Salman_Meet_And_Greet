package com.hafiz.meet.and.greet;

import com.hafiz.meet.and.greet.entities.Booking;
import com.hafiz.meet.and.greet.entities.Room;
import com.hafiz.meet.and.greet.entities.User;
import com.hafiz.meet.and.greet.exception.ResourceNotFoundException;
import com.hafiz.meet.and.greet.exception.RoomUnavailableException;
import com.hafiz.meet.and.greet.repositories.BookingRepository;
import com.hafiz.meet.and.greet.services.BookingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.*;

import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private BookingService bookingService;

    private Booking booking;
    private User user;
    private Room room;

    @BeforeEach
    void setUp() {
        room = Room.builder().id(UUID.randomUUID()).name("Testing Room").capacity(5)
                .description("desc").location("floor 2").build();
        user = User.builder().id(UUID.randomUUID()).email("test@gmail.com").firstName("hafiz")
                .password("12345678").build();
        booking = Booking.builder().id(UUID.randomUUID()).name("Onboarding")
                .user(user).room(room)
                .startTime(LocalDateTime.of(2024, 8, 10, 11, 0))
                .endTime(LocalDateTime.of(2024, 8, 10, 12, 0)).build();
    }

    @Test
    void findAll_shouldReturnAllBookings() {
        when(bookingRepository.findAll()).thenReturn(List.of(booking));

        List<Booking> bookings = bookingService.findAll();

        assertEquals(1, bookings.size());
        assertThat(bookings.getFirst(), equalTo(booking));
    }

    @Test
    void findById_shouldReturnBooking_whenBookingExists() {
        when(bookingRepository.findById(booking.getId())).thenReturn(Optional.of(booking));

        Booking foundBooking = bookingService.findById(booking.getId());

        assertThat(foundBooking, equalTo(booking));
    }

    @Test
    void findById_shouldThrowException_whenBookingDoesNotExist() {
        UUID randomUUID = UUID.randomUUID();
        when(bookingRepository.findById(randomUUID)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> bookingService.findById(randomUUID));
    }

    @Test
    void create_shouldSaveBooking_whenNoOverlapExists() {
        when(bookingRepository.findByRoomId(room.getId())).thenReturn(Collections.emptyList());
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);

        Booking createdBooking = bookingService.create(booking);
        ArgumentCaptor<Booking> saveBookingArgumentCaptor = ArgumentCaptor.forClass(Booking.class);
        verify(bookingRepository).save(saveBookingArgumentCaptor.capture());

        assertThat(createdBooking, equalTo(saveBookingArgumentCaptor.getValue()));
        assertEquals(booking.getId(), createdBooking.getId());
    }

    @Test
    void create_shouldThrowException_whenBookingOverlaps() {
        Booking overlappingBooking = Booking.builder().id(UUID.randomUUID()).name("Overlapping testing")
                .user(user).room(room)
                .startTime(LocalDateTime.of(2024, 8, 10, 11, 30))
                .endTime(LocalDateTime.of(2024, 8, 10, 12, 30)).build();
        when(bookingRepository.findByRoomId(room.getId())).thenReturn(List.of(booking));

        assertThrows(RoomUnavailableException.class, () -> bookingService.create(overlappingBooking));
    }

    @Test
    void create_shouldThrowException_whenTimeIsInvalid() {
        Booking invalidBooking = Booking.builder().id(UUID.randomUUID()).name("Overlapping testing")
                .user(user).room(room)
                .startTime(LocalDateTime.of(2024, 8, 10, 11, 30))
                .endTime(LocalDateTime.of(2024, 8, 10, 10, 30)).build();

        assertThrows(IllegalArgumentException.class, () -> bookingService.create(invalidBooking));
    }

    @Test
    void update_shouldUpdateBooking_whenBookingFound() {
        Booking updatedBooking = Booking.builder().id(booking.getId())
                .room(room).startTime(LocalDateTime.of(2024, 8, 10, 13, 0))
                .user(user).endTime(LocalDateTime.of(2024, 8, 10, 14, 0))
                .name("Updated meeting name").build();
        when(bookingRepository.findById(booking.getId())).thenReturn(Optional.of(booking));
        when(bookingRepository.findByRoomId(room.getId())).thenReturn(List.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);

        Booking result = bookingService.update(booking.getId(), updatedBooking);

        assertThat(result.getName(), equalTo("Updated meeting name"));
        assertThat(result.getStartTime(), equalTo(LocalDateTime.of(2024, 8, 10, 13, 0)));
        assertThat(result.getEndTime(), equalTo(LocalDateTime.of(2024, 8, 10, 14, 0)));
    }

    @Test
    void update_shouldThrowException_whenOverlappedBookingFound() {
        Booking updatedBooking = Booking.builder().id(booking.getId())
                .room(room).startTime(LocalDateTime.of(2024, 8, 10, 13, 0))
                .user(user).endTime(LocalDateTime.of(2024, 8, 10, 14, 0))
                .name("Updated meeting name").build();
        Booking overlappingBooking = Booking.builder().id(UUID.randomUUID()).name("Overlapping testing")
                .user(user).room(room)
                .startTime(LocalDateTime.of(2024, 8, 10, 13, 30))
                .endTime(LocalDateTime.of(2024, 8, 10, 14, 30)).build();

        when(bookingRepository.findById(booking.getId())).thenReturn(Optional.of(booking));
        when(bookingRepository.findByRoomId(room.getId())).thenReturn(List.of(overlappingBooking));

        assertThrows(RoomUnavailableException.class, () -> bookingService.update(booking.getId(), updatedBooking));


    }

    @Test
    void update_shouldThrowException_whenBookingNotFound() {
        UUID nonExistentId = UUID.randomUUID();
        when(bookingRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> bookingService.update(nonExistentId, booking));
    }

    @Test
    void delete_shouldRemoveBooking_whenBookingExists() {
        when(bookingRepository.existsById(booking.getId())).thenReturn(true);

        bookingService.delete(booking.getId());

        verify(bookingRepository).deleteById(booking.getId());
    }

    @Test
    void delete_shouldThrowException_whenBookingNotFound() {
        UUID nonExistentId = UUID.randomUUID();
        when(bookingRepository.existsById(nonExistentId)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> bookingService.delete(nonExistentId));
    }
}
