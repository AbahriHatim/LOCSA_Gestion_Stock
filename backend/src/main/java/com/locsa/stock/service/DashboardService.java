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
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;
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
        // 6 batch queries total (2 per city) instead of 6N queries
        Map<Long, Long> entTanger = toBatchMap(stockEntryRepository.getTotalEntriesPerProductForCity(City.TANGER));
        Map<Long, Long> extTanger = toBatchMap(stockExitRepository.getTotalExitsPerProductForCity(City.TANGER));
        Map<Long, Long> entMeknes = toBatchMap(stockEntryRepository.getTotalEntriesPerProductForCity(City.MEKNES));
        Map<Long, Long> extMeknes = toBatchMap(stockExitRepository.getTotalExitsPerProductForCity(City.MEKNES));
        Map<Long, Long> entCasa   = toBatchMap(stockEntryRepository.getTotalEntriesPerProductForCity(City.CASABLANCA));
        Map<Long, Long> extCasa   = toBatchMap(stockExitRepository.getTotalExitsPerProductForCity(City.CASABLANCA));

        return productRepository.findAll().stream()
                .map(product -> {
                    long id     = product.getId();
                    long tanger = entTanger.getOrDefault(id, 0L) - extTanger.getOrDefault(id, 0L);
                    long meknes = entMeknes.getOrDefault(id, 0L) - extMeknes.getOrDefault(id, 0L);
                    long casa   = entCasa.getOrDefault(id, 0L)   - extCasa.getOrDefault(id, 0L);
                    return new ProductCityStockResponse(product.getName(), tanger, meknes, casa, tanger + meknes + casa);
                })
                .filter(p -> p.getTotalStock() > 0)
                .sorted((a, b) -> Long.compare(b.getTotalStock(), a.getTotalStock()))
                .collect(Collectors.toList());
    }

    public List<TopProductResponse> getTopProducts(City city) {
        // 2 batch queries instead of 2N
        Map<Long, Long> entriesMap;
        Map<Long, Long> exitsMap;
        if (city != null) {
            entriesMap = toBatchMap(stockEntryRepository.getTotalEntriesPerProductForCity(city));
            exitsMap   = toBatchMap(stockExitRepository.getTotalExitsPerProductForCity(city));
        } else {
            entriesMap = toBatchMap(stockEntryRepository.getTotalEntriesPerProduct());
            exitsMap   = toBatchMap(stockExitRepository.getTotalExitsPerProduct());
        }

        return productRepository.findAll().stream().map(p -> {
            long entries  = entriesMap.getOrDefault(p.getId(), 0L);
            long exits    = exitsMap.getOrDefault(p.getId(), 0L);
            long movement = entries + exits;
            return new TopProductResponse(p.getName(), entries, exits, movement);
        })
        .filter(t -> t.getTotalMovement() > 0)
        .sorted((a, b) -> Long.compare(b.getTotalMovement(), a.getTotalMovement()))
        .limit(5)
        .collect(Collectors.toList());
    }

    public List<ActivityFeedItem> getActivityFeed(City city) {
        // JOIN FETCH avoids lazy loading N+1 on product
        PageRequest top10 = PageRequest.of(0, 10);
        List<StockEntry> entries = city != null
                ? stockEntryRepository.findTop10ByCityWithProduct(city, top10)
                : stockEntryRepository.findTop10WithProduct(top10);
        List<StockExit> exits = city != null
                ? stockExitRepository.findTop10ByCityWithProduct(city, top10)
                : stockExitRepository.findTop10WithProduct(top10);

        List<ActivityFeedItem> feed = new ArrayList<>();
        entries.forEach(e -> feed.add(new ActivityFeedItem("ENTRY", e.getProduct().getName(), e.getQuantity(), e.getCity() != null ? e.getCity().name() : null, e.getCreatedBy(), e.getDateEntry(), e.getReference())));
        exits.forEach(e -> feed.add(new ActivityFeedItem("EXIT", e.getProduct().getName(), e.getQuantity(), e.getCity() != null ? e.getCity().name() : null, e.getCreatedBy(), e.getDateExit(), e.getReference())));

        feed.sort((a, b) -> b.getDate().compareTo(a.getDate()));
        return feed.stream().limit(15).collect(Collectors.toList());
    }

    private Map<Long, Long> toBatchMap(List<Object[]> rows) {
        Map<Long, Long> map = new HashMap<>();
        for (Object[] row : rows) {
            map.put((Long) row[0], ((Number) row[1]).longValue());
        }
        return map;
    }
}
