package com.example.demo.controller;

import com.example.demo.jwt.JwtUtil;
import com.example.demo.model.LoginRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final JwtUtil jwtUtil;

    public AuthController(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        String username = loginRequest.getUsername();
        String password = loginRequest.getPassword();

        // Only one admin user: ABC / 1234
        if ("ABC".equals(username) && "1234".equals(password)) {
            String token = jwtUtil.generateToken(username, "ROLE_ADMIN");
            return ResponseEntity.ok(Map.of("token", token));
        }



        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("❌ Invalid credentials");
    }
}
