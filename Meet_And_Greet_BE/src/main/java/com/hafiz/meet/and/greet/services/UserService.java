package com.hafiz.meet.and.greet.services;


import com.hafiz.meet.and.greet.entities.User;
import com.hafiz.meet.and.greet.exception.DuplicateUserException;
import com.hafiz.meet.and.greet.exception.ResourceNotFoundException;
import com.hafiz.meet.and.greet.repositories.UserRepository;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;


@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public List<User> findAll() {
        log.info("Fetching all users");
        return userRepository.findAll();
    }

    public User findById(@NonNull UUID id) {
        log.info("fetching user with the Id, {}", id);
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User with ID " + id + " not found"));
    }

    public User findByEmail(@NonNull String email) {
        log.info("fetching user with the Email, {}", email);
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User with Email " + email + " not found"));
    }

    public User create(User user) {
        log.info("Creating a new user: {}", user.getFirstName());
        validateUserUniqueness(user);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);
        log.info("User created successfully {}", savedUser.getFirstName());
        return savedUser;
    }

    public User update(@NonNull UUID id, User updatedUser) throws DuplicateUserException {
        log.info("Updating user with ID: {}", id);
        return userRepository.findById(id)
                .map(existingUser -> {

                    validateUserEmailUniqueness(existingUser, updatedUser);
                    updateExistingUser(existingUser, updatedUser);
                    User savedUser = userRepository.save(existingUser);
                    log.info("User with email {} updated successfully", savedUser.getEmail());
                    return savedUser;
                })
                .orElseThrow(() -> new ResourceNotFoundException("User with id " + id + " not exists"));
    }

    public void delete(@NonNull UUID id) {
        log.info("Deleting user with ID: {}", id);
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User with ID " + id + " not found");
        }
        userRepository.deleteById(id);
        log.info("User with ID {} deleted successfully", id);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    private void validateUserEmailUniqueness(User existingUser, User updatedUser) {
        boolean isEmailChanged = !existingUser.getEmail().equals(updatedUser.getEmail());
        boolean isEmailExists = userRepository.existsByEmail(updatedUser.getEmail());
        if (isEmailChanged && isEmailExists) {
            log.error("Email {} already exists", updatedUser.getEmail());
            throw new DuplicateUserException("Email " + updatedUser.getEmail() + " already exists");
        }
    }

    private void updateExistingUser(User existingUser, User updatedUser) {
        existingUser.setFirstName(updatedUser.getFirstName());
        existingUser.setLastName(updatedUser.getLastName());
        existingUser.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        existingUser.setEmail(updatedUser.getEmail());
    }


    private void validateUserUniqueness(User user) {

        if (userRepository.existsByEmail(user.getEmail())) {
            log.error("User already exist with Email {} ", user.getEmail());
            throw new DuplicateUserException("User already exist with Email " + user.getEmail());
        }
    }

}
