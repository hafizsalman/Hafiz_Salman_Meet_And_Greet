package com.hafiz.meet.and.greet.services;


import com.hafiz.meet.and.greet.entities.Booking;
import com.hafiz.meet.and.greet.exception.ResourceNotFoundException;
import com.hafiz.meet.and.greet.exception.RoomUnavailableException;
import com.hafiz.meet.and.greet.repositories.BookingRepository;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;

    public List<Booking> findAll() {
        log.info("fetching all bookings");
        return bookingRepository.findAll();
    }

    public Booking findById(@NonNull UUID bookingId) {
        log.info("Fetching booking for booking id {}", bookingId);
        return bookingRepository.findById(bookingId).orElseThrow(() -> new ResourceNotFoundException("Booking not found for this id"));
    }

    public List<Booking> findByRoomId(@NonNull UUID roomId) {
        log.info("Fetching bookings for room ID {}", roomId);
        return bookingRepository.findByRoomId(roomId);
    }

    public List<Booking> findByUserId(@NonNull UUID userId) {
        log.info("fetching bookings for user id: {}", userId);
        return bookingRepository.findByUserId(userId);
    }

    public List<Booking> findTodayBookings() {
        log.info("fetching bookings for today");
        return bookingRepository.findAllTodayBookings();
    }

    public Booking create(Booking booking) {
        validateBookingTime(booking);
        log.info("Attempting to create a new booking  {} ", booking.getName());
        List<Booking> existingBookings = bookingRepository.findByRoomId(booking.getRoom().getId());
        for (Booking existingBooking : existingBookings) {
            if (isBookingOverlapped(booking, existingBooking)) {
                log.error("Room {} is already booked between {} and {}",
                        booking.getRoom().getName(), existingBooking.getStartTime(), existingBooking.getEndTime());
                throw new RoomUnavailableException("room is already booked for the given time duration");
            }
        }

        Booking savedBooking = bookingRepository.save(booking);
        log.info("Booking created successfully with ID {}", savedBooking.getId());
        return savedBooking;
    }

    public Booking update(@NonNull UUID bookingId, Booking updatedBooking) {
        log.info("updating booking for booking ID {}", bookingId);
        validateBookingTime(updatedBooking);

        return bookingRepository.findById(bookingId)
                .map(existingBooking -> {

                    validateRoomAvailability(existingBooking, updatedBooking);
                    updateExistingBooking(existingBooking, updatedBooking);
                    Booking savedBooking = bookingRepository.save(existingBooking);
                    log.info("Booking with Id {} successfully updated ", savedBooking.getId());
                    return savedBooking;
                })
                .orElseThrow(() -> {
                    log.error("Booking with ID {} not found", bookingId);
                    return new ResourceNotFoundException("Booking is not found for for given ID");
                });
    }

    public void delete(@NonNull UUID id) {
        log.info("Going to delete booking with Id: {}", id);
        if (!bookingRepository.existsById(id)) {
            log.error("Booking with id {} not found", id);
            throw new ResourceNotFoundException("Booking not found");
        }
        bookingRepository.deleteById(id);
        log.info("Booking with Id {} deleted successfully", id);
    }

    private boolean isBookingOverlapped(Booking newBooking, Booking existingBooking) {
        return newBooking.getStartTime().isBefore(existingBooking.getEndTime()) &&
                newBooking.getEndTime().isAfter(existingBooking.getStartTime());
    }

    private void validateBookingTime(Booking booking) {
        if (!booking.getStartTime().isBefore(booking.getEndTime())) {
            throw new IllegalArgumentException("Start time of booking must be before end time");
        }
    }

    private void validateRoomAvailability(Booking existingBooking, Booking updatedBooking) {
        if (!existingBooking.getRoom().getId().equals(updatedBooking.getRoom().getId()) ||
                !existingBooking.getStartTime().equals(updatedBooking.getStartTime()) ||
                !existingBooking.getEndTime().equals(updatedBooking.getEndTime())) {

            List<Booking> existingBookings = bookingRepository.findByRoomId(updatedBooking.getRoom().getId());
            for (Booking otherBooking : existingBookings) {
                if (!otherBooking.getId().equals(existingBooking.getId()) && isBookingOverlapped(updatedBooking, otherBooking)) {
                    log.error("Room {} is already for this time {} to {}",
                            updatedBooking.getRoom().getName(), otherBooking.getStartTime(), otherBooking.getEndTime());
                    throw new RoomUnavailableException("Room is already booked for the given time frame");
                }
            }
        }
    }

    private void updateExistingBooking(Booking existingBooking, Booking updatedBooking) {
        existingBooking.setRoom(updatedBooking.getRoom());
        existingBooking.setStartTime(updatedBooking.getStartTime());
        existingBooking.setEndTime(updatedBooking.getEndTime());
        existingBooking.setName(updatedBooking.getName());
    }

}
