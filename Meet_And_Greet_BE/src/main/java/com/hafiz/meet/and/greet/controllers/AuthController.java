package com.hafiz.meet.and.greet.controllers;

import com.hafiz.meet.and.greet.dtos.LoginDTO;
import com.hafiz.meet.and.greet.entities.User;
import com.hafiz.meet.and.greet.services.AuthService;
import com.hafiz.meet.and.greet.utils.JwtUtil;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtUtil jwtUtil;

    private final AuthService authService;

    @PostMapping("/login")
    public String authenticate(@RequestBody LoginDTO user, HttpServletResponse response) {
        User authenticatedUser = authService.authenticate(user);
        Cookie cookie = jwtUtil.generateHttpOnlyCookieToken(authenticatedUser.getEmail());
        response.addCookie(cookie);
        return authenticatedUser.getFirstName();
    }

    @PostMapping("/logout")
    public void logout(HttpServletResponse response) {
        response.addCookie(jwtUtil.invalidateCookie());
    }


    @GetMapping("/status")
    public boolean checkAuthStatus(HttpServletRequest request) {
        return jwtUtil.validateJwtTokenFromRequest(request);
    }

    @PostMapping("/signup")
    public User signup(@RequestPart("user") User user) {
        return authService.signup(user);
    }

    @GetMapping("/user-exists")
    public boolean existsByEmail(@RequestParam String email) {
        return authService.existsByEmail(email);
    }

}
