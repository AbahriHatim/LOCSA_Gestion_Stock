package com.locsa.stock.controller;

import com.locsa.stock.dto.AuthResponse;
import com.locsa.stock.dto.LoginRequest;
import com.locsa.stock.dto.RegisterRequest;
import com.locsa.stock.security.LoginAttemptService;
import com.locsa.stock.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final LoginAttemptService loginAttemptService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletResponse httpResponse) {
        String key = request.getEmail();
        if (loginAttemptService.isBlocked(key)) {
            long remaining = loginAttemptService.remainingLockSeconds(key);
            return ResponseEntity.status(429).body(Map.of(
                "error", "Compte temporairement bloqué après trop de tentatives. Réessayez dans " + remaining + " secondes."
            ));
        }
        try {
            AuthResponse response = authService.login(request);
            loginAttemptService.loginSucceeded(key);
            setJwtCookie(httpResponse, response.getToken());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            loginAttemptService.loginFailed(key);
            return ResponseEntity.status(401).body(Map.of("error", "Email ou mot de passe incorrect"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse httpResponse) {
        clearJwtCookie(httpResponse);
        return ResponseEntity.ok(Map.of("message", "Déconnecté"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email requis"));
        }
        authService.forgotPassword(email.trim());
        // Always return OK to not reveal if email exists
        return ResponseEntity.ok(Map.of("message", "Si cet email existe, un lien a été envoyé"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> body) {
        String token = body.get("token");
        String newPassword = body.get("newPassword");
        if (token == null || token.isBlank() || newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body(Map.of("error", "Données invalides"));
        }
        try {
            authService.resetPassword(token, newPassword);
            return ResponseEntity.ok(Map.of("message", "Mot de passe réinitialisé avec succès"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private void setJwtCookie(HttpServletResponse response, String token) {
        Cookie cookie = new Cookie("jwt", token);
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(8 * 60 * 60); // 8 hours
        // cookie.setSecure(true); // enable when HTTPS is in use
        response.addCookie(cookie);
    }

    private void clearJwtCookie(HttpServletResponse response) {
        Cookie cookie = new Cookie("jwt", "");
        cookie.setHttpOnly(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);
        response.addCookie(cookie);
    }
}
