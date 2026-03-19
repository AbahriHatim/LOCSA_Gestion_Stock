package com.locsa.stock.controller;

import com.locsa.stock.dto.AdjustRequest;
import com.locsa.stock.dto.InventoryRequest;
import com.locsa.stock.dto.InventoryResponse;
import com.locsa.stock.entity.City;
import com.locsa.stock.entity.User;
import com.locsa.stock.repository.UserRepository;
import com.locsa.stock.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<InventoryResponse>> getAll(
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
        return ResponseEntity.ok(inventoryService.getAllInventories(auth.getName(), isAdmin, cityEnum));
    }

    @PostMapping
    public ResponseEntity<?> create(@Valid @RequestBody InventoryRequest request, Authentication auth) {
        boolean isAdmin = auth.getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
        City city;
        if (isAdmin) {
            // Admin must send city in request
            if (request.getCity() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "La ville est requise"));
            }
            city = request.getCity();
        } else {
            User user = userRepository.findByUsername(auth.getName()).orElseThrow();
            city = user.getCity();
        }
        try {
            return ResponseEntity.ok(inventoryService.createInventory(request, auth.getName(), city));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/adjust")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> adjust(@PathVariable Long id, @Valid @RequestBody AdjustRequest request) {
        try {
            return ResponseEntity.ok(inventoryService.adjustStock(id, request.getAdjustmentComment()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
