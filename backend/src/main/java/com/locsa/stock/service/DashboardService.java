package com.locsa.stock.service;

import com.locsa.stock.dto.ActivityFeedItem;
import com.locsa.stock.dto.CityStockResponse;
import com.locsa.stock.dto.DashboardResponse;
import com.locsa.stock.dto.ProductCityStockResponse;
import com.locsa.stock.dto.TopProductResponse;
import com.locsa.stock.entity.City;
import com.locsa.stock.entity.Product;
import com.locsa.stock.entity.StockEntry;
import com.locsa.stock.entity.StockExit;
import com.locsa.stock.repository.ProductRepository;
import com.locsa.stock.repository.StockEntryRepository;
import com.locsa.stock.repository.StockExitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
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
        long lowStockCount = productRepository.findLowStockProducts().size();

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
                    Long meknes = cityStock(product.getId(), City.MEKNES);
                    Long casa   = cityStock(product.getId(), City.CASABLANCA);
                    return new ProductCityStockResponse(product.getName(), tanger, meknes, casa, tanger + meknes + casa);
                })
                .filter(p -> p.getTotalStock() > 0)
                .sorted((a, b) -> Long.compare(b.getTotalStock(), a.getTotalStock()))
                .collect(Collectors.toList());
    }

    public List<TopProductResponse> getTopProducts(City city) {
        List<Product> products = productRepository.findAll();
        return products.stream().map(p -> {
            Long entries = city != null
                    ? stockEntryRepository.getTotalEntriesByProductAndCity(p.getId(), city)
                    : stockEntryRepository.getTotalEntriesByProduct(p.getId());
            Long exits = city != null
                    ? stockExitRepository.getTotalExitsByProductAndCity(p.getId(), city)
                    : stockExitRepository.getTotalExitsByProduct(p.getId());
            long movement = (entries != null ? entries : 0L) + (exits != null ? exits : 0L);
            return new TopProductResponse(p.getName(), entries != null ? entries : 0L, exits != null ? exits : 0L, movement);
        })
        .filter(t -> t.getTotalMovement() > 0)
        .sorted((a, b) -> Long.compare(b.getTotalMovement(), a.getTotalMovement()))
        .limit(5)
        .collect(Collectors.toList());
    }

    public List<ActivityFeedItem> getActivityFeed(City city) {
        List<StockEntry> entries = city != null
                ? stockEntryRepository.findByCityOrderByDateEntryDesc(city).stream().limit(10).collect(Collectors.toList())
                : stockEntryRepository.findTop10ByOrderByDateEntryDesc();
        List<StockExit> exits = city != null
                ? stockExitRepository.findByCityOrderByDateExitDesc(city).stream().limit(10).collect(Collectors.toList())
                : stockExitRepository.findTop10ByOrderByDateExitDesc();

        List<ActivityFeedItem> feed = new ArrayList<>();
        entries.forEach(e -> feed.add(new ActivityFeedItem("ENTRY", e.getProduct().getName(), e.getQuantity(), e.getCity() != null ? e.getCity().name() : null, e.getCreatedBy(), e.getDateEntry(), e.getReference())));
        exits.forEach(e -> feed.add(new ActivityFeedItem("EXIT", e.getProduct().getName(), e.getQuantity(), e.getCity() != null ? e.getCity().name() : null, e.getCreatedBy(), e.getDateExit(), e.getReference())));

        feed.sort((a, b) -> b.getDate().compareTo(a.getDate()));
        return feed.stream().limit(15).collect(Collectors.toList());
    }

    private Long cityStock(Long productId, City city) {
        Long entries = stockEntryRepository.getTotalEntriesByProductAndCity(productId, city);
        Long exits   = stockExitRepository.getTotalExitsByProductAndCity(productId, city);
        if (entries == null) entries = 0L;
        if (exits   == null) exits   = 0L;
        return entries - exits;
    }
}
