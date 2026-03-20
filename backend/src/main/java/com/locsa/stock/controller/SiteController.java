package com.locsa.stock.controller;

import com.locsa.stock.dto.SiteRequest;
import com.locsa.stock.dto.SiteResponse;
import com.locsa.stock.entity.City;
import com.locsa.stock.service.SiteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sites")
@RequiredArgsConstructor
public class SiteController {

    private final SiteService siteService;

    @GetMapping
    public ResponseEntity<List<SiteResponse>> getAll(@RequestParam(required = false) City city) {
        if (city != null) {
            return ResponseEntity.ok(siteService.getSitesByCity(city));
        }
        return ResponseEntity.ok(siteService.getAllSites());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SiteResponse> create(@Valid @RequestBody SiteRequest request) {
        return ResponseEntity.ok(siteService.createSite(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SiteResponse> update(@PathVariable Long id, @Valid @RequestBody SiteRequest request) {
        return ResponseEntity.ok(siteService.updateSite(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        siteService.deleteSite(id);
        return ResponseEntity.noContent().build();
    }
}
