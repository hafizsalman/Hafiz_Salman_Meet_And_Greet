package com.hafiz.meet.and.greet.exception;

public class JwtTokenException extends RuntimeException {

    public JwtTokenException(String message) {
        super(message);
    }
}
