package com.hafiz.meet.and.greet.repositories;

import com.hafiz.meet.and.greet.entities.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.UUID;


public interface BookingRepository extends JpaRepository<Booking, UUID> {

    List<Booking> findByRoomId(UUID roomId);

    List<Booking> findByUserId(UUID userId);

    @Query("SELECT b FROM Booking b WHERE CURRENT_DATE BETWEEN DATE(b.startTime) AND DATE(b.endTime)")
    List<Booking> findAllTodayBookings();
}
