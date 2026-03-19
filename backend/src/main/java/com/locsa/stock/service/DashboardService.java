package com.locsa.stock.service;

import com.locsa.stock.dto.CityStockResponse;
import com.locsa.stock.dto.DashboardResponse;
import com.locsa.stock.dto.ProductCityStockResponse;
import com.locsa.stock.entity.City;
import com.locsa.stock.repository.ProductRepository;
import com.locsa.stock.repository.StockEntryRepository;
import com.locsa.stock.repository.StockExitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProductRepository productRepository;
    private final StockEntryRepository stockEntryRepository;
    private final StockExitRepository stockExitRepository;
    private final StockEntryService stockEntryService;
    private final StockExitService stockExitService;
    private final InventoryService inventoryService;

    public DashboardResponse getDashboard() {
        Long totalStock = productRepository.getTotalStock();
        if (totalStock == null) totalStock = 0L;

        long totalProducts = productRepository.count();
        long lowStockCount = productRepository.findLowStockProducts(5).size();

        return new DashboardResponse(
                totalStock,
                totalProducts,
                lowStockCount,
                stockEntryService.getRecentEntries(),
                stockExitService.getRecentExits(),
                inventoryService.countNegativeGap(),
                inventoryService.countPositiveGap()
        );
    }

    public List<CityStockResponse> getStockByCity() {
        return Arrays.stream(City.values()).map(city -> {
            Long entries = stockEntryRepository.getTotalByCity(city);
            Long exits   = stockExitRepository.getTotalByCity(city);
            if (entries == null) entries = 0L;
            if (exits   == null) exits   = 0L;
            return new CityStockResponse(city.name(), entries, exits, entries - exits);
        }).collect(Collectors.toList());
    }

    public List<ProductCityStockResponse> getStockByProduct() {
        return productRepository.findAll().stream()
                .map(product -> {
                    Long tanger = cityStock(product.getId(), City.TANGER);
                    Long fes    = cityStock(product.getId(), City.FES);
                    Long casa   = cityStock(product.getId(), City.CASABLANCA);
                    return new ProductCityStockResponse(product.getName(), tanger, fes, casa, tanger + fes + casa);
                })
                .filter(p -> p.getTotalStock() > 0)
                .sorted((a, b) -> Long.compare(b.getTotalStock(), a.getTotalStock()))
                .collect(Collectors.toList());
    }

    private Long cityStock(Long productId, City city) {
        Long entries = stockEntryRepository.getTotalEntriesByProductAndCity(productId, city);
        Long exits   = stockExitRepository.getTotalExitsByProductAndCity(productId, city);
        if (entries == null) entries = 0L;
        if (exits   == null) exits   = 0L;
        return entries - exits;
    }
}
