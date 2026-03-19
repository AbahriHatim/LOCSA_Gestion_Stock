package com.locsa.stock.controller;

import com.locsa.stock.dto.StockEntryRequest;
import com.locsa.stock.dto.StockEntryResponse;
import com.locsa.stock.entity.City;
import com.locsa.stock.entity.User;
import com.locsa.stock.repository.UserRepository;
import com.locsa.stock.service.StockEntryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/entries")
@RequiredArgsConstructor
public class StockEntryController {

    private final StockEntryService stockEntryService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<StockEntryResponse>> getAllEntries(
            Authentication auth,
            @RequestParam(required = false) String city) {
        boolean isAdmin = auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
        City cityEnum;
        if (isAdmin) {
            cityEnum = null;
            if (city != null && !city.isBlank()) {
                try { cityEnum = City.valueOf(city.toUpperCase()); } catch (IllegalArgumentException ignored) {}
            }
        } else {
            User user = userRepository.findByUsername(auth.getName()).orElseThrow();
            cityEnum = user.getCity();
        }
        return ResponseEntity.ok(stockEntryService.getAllEntries(auth.getName(), isAdmin, cityEnum));
    }

    @PostMapping
    public ResponseEntity<?> createEntry(@Valid @RequestBody StockEntryRequest request, Authentication auth) {
        boolean isAdmin = auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
        City forcedCity = null;
        if (!isAdmin) {
            User user = userRepository.findByUsername(auth.getName()).orElseThrow();
            forcedCity = user.getCity();
        }
        try {
            return ResponseEntity.ok(stockEntryService.createEntry(request, auth.getName(), forcedCity));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
