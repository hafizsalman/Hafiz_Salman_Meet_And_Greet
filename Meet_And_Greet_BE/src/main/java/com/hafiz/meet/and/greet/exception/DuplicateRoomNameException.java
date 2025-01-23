package com.hafiz.meet.and.greet.exception;

public class DuplicateRoomNameException extends RuntimeException {
    public DuplicateRoomNameException(String message) {
        super(message);
    }
}
