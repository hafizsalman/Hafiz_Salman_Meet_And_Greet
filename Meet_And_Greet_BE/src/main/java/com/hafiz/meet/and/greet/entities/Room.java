package com.hafiz.meet.and.greet.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.UUID;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @NotBlank(message = "Room name is mandatory")
    @Size(min = 3, max = 100, message = "Room name must be between 3 and 100 characters")
    @Column(nullable = false)
    private String name;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    @NotBlank(message = "Location is mandatory")
    @Size(min = 3, max = 100, message = "Location must be between 3 and 100 characters")
    @Column(nullable = false)
    private String location;

    @Min(value = 1, message = "Capacity must be at least 1")
    private int capacity;

    @JsonIgnore
    @Lob
    @Column(name = "image", columnDefinition="LONGBLOB")
    private byte[] image;

    private boolean deleted = false;

}
