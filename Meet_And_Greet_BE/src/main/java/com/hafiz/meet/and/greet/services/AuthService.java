package com.hafiz.meet.and.greet.services;

import com.hafiz.meet.and.greet.dtos.LoginDTO;
import com.hafiz.meet.and.greet.entities.User;
import com.hafiz.meet.and.greet.exception.InvalidCredentialsException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;

    private final UserService userService;

    public User authenticate(LoginDTO user) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(user.getEmail(), user.getPassword()));
        } catch (Exception ex) {
            throw new InvalidCredentialsException("Invalid email or password.");
        }

        return userService.findByEmail(user.getEmail());
    }

    public User signup(User user) {
        return userService.create(user);
    }

    public boolean existsByEmail(String email) {
        return userService.existsByEmail(email);
    }
}
