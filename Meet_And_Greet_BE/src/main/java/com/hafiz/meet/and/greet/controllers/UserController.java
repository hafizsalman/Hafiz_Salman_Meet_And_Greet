package com.hafiz.meet.and.greet.controllers;


import com.hafiz.meet.and.greet.entities.User;
import com.hafiz.meet.and.greet.services.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public List<User> findAll() {
        log.info("Finding all users");
        return userService.findAll();
    }

    @GetMapping("/id/{id}")
    public User findById(@PathVariable UUID id) {
        log.info("Finding user with ID {}", id);
        return userService.findById(id);
    }

    @GetMapping("/email/{email}")
    public User findByEmail(@PathVariable String email) {
        log.info("Finding user with email: {}", email);
        return userService.findByEmail(email);
    }

    @PostMapping
    public User create(@Valid @RequestBody User user) {
        log.info("Creating user {}", user.getFirstName());
        return userService.create(user);
    }

    @PutMapping("/{id}")
    public User update(@PathVariable UUID id, @Valid @RequestBody User user) {
        log.info("Updating user with ID: {}", id);
        return userService.update(id, user);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable UUID id) {
        log.info("Deleting user with ID: {}", id);
        userService.delete(id);
    }


}
