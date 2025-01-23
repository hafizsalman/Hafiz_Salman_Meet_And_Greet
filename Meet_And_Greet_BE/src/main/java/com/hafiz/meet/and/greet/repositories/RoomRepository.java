package com.hafiz.meet.and.greet.repositories;

import com.hafiz.meet.and.greet.entities.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RoomRepository extends JpaRepository<Room, UUID> {
    boolean existsByNameAndLocationAndDeletedIsFalse(String name, String location);
    Optional<Room> findByNameAndLocationAndDeletedIsFalse(String name, String location);
    List<Room> findAllByDeletedIsFalse();
    List<Room> findAllByDeletedIsTrue();

    Optional<Room> findByIdAndDeletedIsFalse(UUID id);
    Optional<Room> findByIdAndDeletedIsTrue(UUID id);




}
