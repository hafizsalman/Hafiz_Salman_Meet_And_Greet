package com.hafiz.meet.and.greet.dtos;

import com.hafiz.meet.and.greet.entities.Room;
import lombok.*;

import java.util.Base64;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor

public class RoomDTO {
    private UUID id;
    private String name;
    private String description;
    private String location;
    private int capacity;
    private String image;

    public static RoomDTO convertToDTO(Room room) {
        RoomDTO roomDTO = RoomDTO.builder().id(room.getId())
                .name(room.getName())
                .capacity(room.getCapacity())
                .description(room.getDescription())
                .location(room.getLocation())
                .build();
        if (room.getImage() != null) {
            roomDTO.setImage("data:image/jpeg;base64," + Base64.getEncoder().encodeToString(room.getImage()));
        }
        return roomDTO;
    }
}
