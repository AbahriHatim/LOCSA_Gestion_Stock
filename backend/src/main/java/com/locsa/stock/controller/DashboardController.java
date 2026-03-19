package com.locsa.stock.controller;

import com.locsa.stock.dto.CityStockResponse;
import com.locsa.stock.dto.DashboardResponse;
import com.locsa.stock.dto.ProductCityStockResponse;
import com.locsa.stock.dto.StatsResponse;
import com.locsa.stock.entity.City;
import com.locsa.stock.service.DashboardService;
import com.locsa.stock.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final StatsService statsService;

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard() {
        return ResponseEntity.ok(dashboardService.getDashboard());
    }

    @GetMapping("/stats")
    public ResponseEntity<StatsResponse> getStats(
            @RequestParam(defaultValue = "month") String period,
            @RequestParam(required = false) String city) {
        City cityEnum = null;
        if (city != null && !city.isBlank()) {
            try { cityEnum = City.valueOf(city.toUpperCase()); } catch (IllegalArgumentException ignored) {}
        }
        return ResponseEntity.ok(statsService.getStats(period, cityEnum));
    }

    @GetMapping("/by-city")
    public ResponseEntity<List<CityStockResponse>> getStockByCity() {
        return ResponseEntity.ok(dashboardService.getStockByCity());
    }

    @GetMapping("/by-product")
    public ResponseEntity<List<ProductCityStockResponse>> getStockByProduct() {
        return ResponseEntity.ok(dashboardService.getStockByProduct());
    }
}
