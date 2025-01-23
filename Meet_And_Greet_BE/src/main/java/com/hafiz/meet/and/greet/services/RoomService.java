package com.hafiz.meet.and.greet.services;


import com.hafiz.meet.and.greet.entities.Booking;
import com.hafiz.meet.and.greet.entities.Room;
import com.hafiz.meet.and.greet.exception.BookingConflictException;
import com.hafiz.meet.and.greet.exception.DuplicateRoomNameException;
import com.hafiz.meet.and.greet.exception.ResourceNotFoundException;
import com.hafiz.meet.and.greet.repositories.RoomRepository;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;
    private final BookingService bookingService;

    public List<Room> findAll() {
        log.info("fetching all rooms");
        return roomRepository.findAllByDeletedIsFalse();
    }

    public Room findById(@NonNull UUID id) {
        log.info("fetching room for the Id: {}", id);
        return roomRepository.findByIdAndDeletedIsFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("room with ID " + id + " not found"));
    }

    public Room create(Room room, MultipartFile image) throws IOException {
        log.info("creating Room; {}", room.getName());
        if (roomRepository.existsByNameAndLocationAndDeletedIsFalse(room.getName(), room.getLocation())) {
            log.error("Room {} already exists", room.getName());
            throw new DuplicateRoomNameException("Room with this name " + room.getName() + "  and location" + room.getLocation() + " already exists, it should be unique");
        }
        final byte[] imageBytes = image != null ? image.getBytes() : null;
        room.setImage(imageBytes);
        return roomRepository.save(room);
    }

    public Room update(@NonNull UUID id, Room updatedRoom, MultipartFile image) throws IOException {
        log.info("Updating room with Id: {}", id);

        final byte [] imageBytes=image!=null? image.getBytes(): null;
        return roomRepository.findById(id)
                .map(existingRoom -> {

                    validateRoomUniqueness(existingRoom, updatedRoom);
                    updateExistingRoom(existingRoom, updatedRoom);

                    existingRoom.setImage(imageBytes != null ? imageBytes : existingRoom.getImage());
                    Room savedRoom = roomRepository.save(existingRoom);
                    log.info("Room with Id {} updated successfully", savedRoom.getId());
                    return savedRoom;
                })
                .orElseThrow(() -> new ResourceNotFoundException("Room with Id " + id + " not found"));
    }

    public void delete(@NonNull UUID id) {
        log.info("Attempting to delete room for Id {}", id);

        Room room = roomRepository.findByIdAndDeletedIsFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room with Id " + id + " not found"));

        List<Booking> bookings = bookingService.findByRoomId(id);

        Optional<Booking> inProgressBooking = bookings.stream()
                .filter(booking -> booking.getStartTime().isBefore(LocalDateTime.now()) &&
                        booking.getEndTime().isAfter(LocalDateTime.now()))
                .findFirst();
        if (inProgressBooking.isPresent()) {
            String meetingName = inProgressBooking.get().getName();
            log.warn("Room with Id {} cannot be deleted as it has an in-progress meeting: {}", room.getName(), meetingName);
            throw new BookingConflictException("Room \"" + room.getName() + "\" cannot be deleted as it has an in-progress meeting: \"" + meetingName + "\"");
        }

        boolean hasFutureBookings = bookings.stream()
                .anyMatch(booking -> booking.getStartTime().isAfter(LocalDateTime.now()));
        if (hasFutureBookings) {
            log.warn("Room with Id {} cannot be deleted as it has future bookings", id);
            throw new BookingConflictException("Room \""+room.getName()+"\" cannot be deleted as it has future bookings.");
        }
        room.setDeleted(true);
        roomRepository.save(room);
        log.info("Room with Id {} has been permanently deleted", id);
    }

    public boolean isRoomNameAndLocationUnique(String name, String location, UUID id) {
        Optional<Room> room = roomRepository.findByNameAndLocationAndDeletedIsFalse(name, location);
        return room.map(value -> Objects.nonNull(id) && value.getId().equals(id)).orElse(true);
    }

    private void validateRoomUniqueness(Room existingRoom, Room updatedRoom) {
        boolean isNameOrLocationChanged = !existingRoom.getName().equals(updatedRoom.getName()) ||
                !existingRoom.getLocation().equals(updatedRoom.getLocation());
        boolean isRoomExists = roomRepository.existsByNameAndLocationAndDeletedIsFalse(updatedRoom.getName(), updatedRoom.getLocation());
        if (isNameOrLocationChanged && isRoomExists) {
            log.error("Room with name {} and location {} already exists", updatedRoom.getName(), updatedRoom.getLocation());
            throw new DuplicateRoomNameException("Room with name " + updatedRoom.getName() + " and location " +
                    updatedRoom.getLocation() + " already exists. Name and location should be unique.");
        }
    }

    private void updateExistingRoom(Room existingRoom, Room updatedRoom) {
        existingRoom.setName(updatedRoom.getName());
        existingRoom.setDescription(updatedRoom.getDescription());
        existingRoom.setLocation(updatedRoom.getLocation());
        existingRoom.setCapacity(updatedRoom.getCapacity());
        existingRoom.setDeleted(updatedRoom.isDeleted());
    }

}
