package com.hafiz.meet.and.greet.controllers;

import com.hafiz.meet.and.greet.dtos.RoomDTO;
import com.hafiz.meet.and.greet.entities.Room;
import com.hafiz.meet.and.greet.services.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    public List<RoomDTO> findAll() {
        log.info("Finding all rooms");
        return roomService.findAll().stream().map(RoomDTO::convertToDTO).collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public RoomDTO findById(@PathVariable UUID id) {
        log.info("Finding room with ID {}", id);
        return RoomDTO.convertToDTO(roomService.findById(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public RoomDTO create(@Valid @RequestPart Room room, @RequestPart("image") MultipartFile image) throws IOException {
        log.info("Creating Room {}", room.getName());
        return RoomDTO.convertToDTO(roomService.create(room, image));
    }

    @PutMapping("/{id}")
    public RoomDTO update(@PathVariable UUID id, @Valid @RequestPart("room") Room room, @RequestPart(value = "image", required = false)  MultipartFile image) throws IOException {
        log.info("Updating Room {}", room.getName());
        return RoomDTO.convertToDTO(roomService.update(id, room, image));
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        log.info("Deleting Room with ID {}", id);
        roomService.delete(id);
    }

    @GetMapping("/check-unique")
    public Boolean checkRoomUnique(@RequestParam String name, @RequestParam String location, @RequestParam(required = false) UUID id) {
        return roomService.isRoomNameAndLocationUnique(name, location, id);
    }
}