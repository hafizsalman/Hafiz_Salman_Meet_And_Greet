package com.hafiz.meet.and.greet.controllers;


import com.hafiz.meet.and.greet.entities.Booking;
import com.hafiz.meet.and.greet.entities.User;
import com.hafiz.meet.and.greet.services.BookingService;
import com.hafiz.meet.and.greet.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {


    private final BookingService bookingService;

    private final UserService userService;


    @GetMapping
    public List<Booking> findAll() {
        log.info("Finding all booking");
        return bookingService.findAll();
    }

    @GetMapping("/{id}")
    public Booking findById(@PathVariable UUID id) {
        log.info("Finding Bookings for booking id {}", id);
        return bookingService.findById(id);
    }

    @GetMapping("/room/{roomId}")
    public List<Booking> findByRoomId(@PathVariable UUID roomId) {
        log.info("Finding Bookings for uoom Id: {}", roomId);
        return bookingService.findByRoomId(roomId);
    }

    @GetMapping("/user/{userId}")
    public List<Booking> findByUserId(@PathVariable UUID userId) {
        log.info("Finding Bookings for User Id {}", userId);
        return bookingService.findByUserId(userId);
    }

    @GetMapping("/user")
    public List<Booking> findByCurrentUser(Authentication authentication) {
        log.info("Finding Bookings for logged in user");
        return bookingService.findByUserId(this.getUserFromAuth(authentication).getId());
    }

    @GetMapping("/today")
    public List<Booking> findTodayBookings() {
        return bookingService.findTodayBookings();
    }

    @PostMapping
    public Booking create(@Valid @RequestBody Booking booking, Authentication authentication) {
        log.info("Creating Booking {}", booking.getName());
        booking.setUser(this.getUserFromAuth(authentication));
        return bookingService.create(booking);
    }

    @PutMapping("/{id}")
    public Booking update(@PathVariable UUID id, @Valid @RequestBody Booking booking, Authentication authentication) {
        log.info("update Booking {}", booking.getName());
        booking.setUser(this.getUserFromAuth(authentication));
        return bookingService.update(id,booking);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        bookingService.delete(id);
    }

    private User getUserFromAuth(Authentication authentication){
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return userService.findByEmail(userDetails.getUsername());
    }
}
