package com.flux.monitor.controller;

import com.flux.monitor.model.*;
import com.flux.monitor.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private UserRepository userRepo;
    @Autowired private JwtUtil jwtUtil;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // ── REGISTER ─────────────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String username = body.getOrDefault("username", "").trim();
        String password = body.getOrDefault("password", "");

        if (username.isBlank() || password.length() < 6)
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Username required & password min 6 chars"));

        if (userRepo.existsByUsername(username))
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Username already taken"));

        userRepo.save(new User(username, encoder.encode(password)));
        String token = jwtUtil.generateToken(username);
        return ResponseEntity.ok(Map.of("token", token, "username", username));
    }

    // ── LOGIN ─────────────────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        String username = body.getOrDefault("username", "").trim();
        String password = body.getOrDefault("password", "");

        return userRepo.findByUsername(username)
            .filter(u -> encoder.matches(password, u.getPassword()))
            .map(u -> ResponseEntity.ok(
                Map.of("token", jwtUtil.generateToken(username),
                       "username", username)))
            .orElse(ResponseEntity.status(401)
                .body(Map.of("error", "Invalid username or password")));
    }

    // ── VERIFY TOKEN ──────────────────────────────────────────────
    @GetMapping("/verify")
    public ResponseEntity<?> verify(
            @RequestHeader(value = "Authorization", required = false) String auth) {
        if (auth == null || !auth.startsWith("Bearer "))
            return ResponseEntity.status(401).build();
        String token = auth.substring(7);
        if (!jwtUtil.validateToken(token))
            return ResponseEntity.status(401).build();
        return ResponseEntity.ok(Map.of("username", jwtUtil.extractUsername(token)));
    }

    // ── CHANGE PASSWORD ───────────────────────────────────────────
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestBody Map<String, String> body) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer "))
                return ResponseEntity.status(401)
                    .body(Map.of("error", "Not authenticated"));

            String token = authHeader.substring(7);
            if (!jwtUtil.validateToken(token))
                return ResponseEntity.status(401)
                    .body(Map.of("error", "Invalid or expired token"));

            String username    = jwtUtil.extractUsername(token);
            String newPassword = body.getOrDefault("newPassword", "");

            if (newPassword.length() < 6)
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Password must be at least 6 characters"));

            return userRepo.findByUsername(username).map(user -> {
                user.setPassword(encoder.encode(newPassword));
                userRepo.save(user);
                return ResponseEntity.ok(
                    Map.of("message", "Password updated successfully"));
            }).orElse(ResponseEntity.status(404)
                .body(Map.of("error", "User not found")));

        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Server error: " + e.getMessage()));
        }
    }
}