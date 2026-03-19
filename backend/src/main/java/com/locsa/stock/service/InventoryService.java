package com.locsa.stock.service;

import com.locsa.stock.dto.InventoryRequest;
import com.locsa.stock.dto.InventoryResponse;
import com.locsa.stock.entity.*;
import com.locsa.stock.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final StockEntryRepository stockEntryRepository;
    private final StockExitRepository stockExitRepository;

    @Transactional
    public InventoryResponse createInventory(InventoryRequest request, String username, City city) {
        Product product = productRepository.findByNameIgnoreCase(request.getProductName().trim())
                .orElseThrow(() -> new RuntimeException("Produit introuvable : " + request.getProductName()));

        // System quantity = per-city stock
        Long cityEntries = stockEntryRepository.getTotalEntriesByProductAndCity(product.getId(), city);
        Long cityExits   = stockExitRepository.getTotalExitsByProductAndCity(product.getId(), city);
        if (cityEntries == null) cityEntries = 0L;
        if (cityExits   == null) cityExits   = 0L;
        long systemQty = cityEntries - cityExits;

        long realQty    = request.getRealQuantity();
        long difference = realQty - systemQty;

        Inventory inventory = Inventory.builder()
                .product(product)
                .systemQuantity(systemQty)
                .realQuantity(realQty)
                .difference(difference)
                .dateInventory(request.getDateInventory() != null ? request.getDateInventory() : LocalDate.now())
                .comment(request.getComment())
                .createdBy(username)
                .city(city)
                .build();

        return toResponse(inventoryRepository.save(inventory));
    }

    public List<InventoryResponse> getAllInventories(String username, boolean isAdmin, City city) {
        List<Inventory> list;
        if (isAdmin) {
            list = city != null
                    ? inventoryRepository.findByCityOrderByDateInventoryDesc(city)
                    : inventoryRepository.findAllByOrderByDateInventoryDesc();
        } else {
            list = city != null
                    ? inventoryRepository.findByCreatedByAndCityOrderByDateInventoryDesc(username, city)
                    : inventoryRepository.findByCreatedByOrderByDateInventoryDesc(username);
        }
        return list.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public InventoryResponse adjustStock(Long id, String adjustmentComment) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventaire introuvable"));

        Product product = inventory.getProduct();
        City city = inventory.getCity();

        // Re-compute current city stock
        Long cityEntries = stockEntryRepository.getTotalEntriesByProductAndCity(product.getId(), city);
        Long cityExits   = stockExitRepository.getTotalExitsByProductAndCity(product.getId(), city);
        if (cityEntries == null) cityEntries = 0L;
        if (cityExits   == null) cityExits   = 0L;
        long currentCityStock = cityEntries - cityExits;

        long realQty = inventory.getRealQuantity();
        long delta   = realQty - currentCityStock;

        if (delta > 0) {
            // Surplus: create corrective entry for this city
            StockEntry correction = StockEntry.builder()
                    .product(product)
                    .dateEntry(LocalDate.now())
                    .quantity(delta)
                    .comment("Ajustement inventaire : " + adjustmentComment)
                    .createdBy(inventory.getCreatedBy())
                    .city(city)
                    .build();
            stockEntryRepository.save(correction);
            product.setQuantity(product.getQuantity() + delta);
        } else if (delta < 0) {
            // Deficit: create corrective exit for this city
            StockExit correction = StockExit.builder()
                    .product(product)
                    .dateExit(LocalDate.now())
                    .quantity(-delta)
                    .beneficiary("Correction inventaire")
                    .comment("Ajustement inventaire : " + adjustmentComment)
                    .createdBy(inventory.getCreatedBy())
                    .city(city)
                    .build();
            stockExitRepository.save(correction);
            product.setQuantity(product.getQuantity() + delta);
        }

        productRepository.save(product);
        inventory.setSystemQuantity(realQty);
        inventory.setDifference(0L);
        inventory.setAdjustmentComment(adjustmentComment);
        return toResponse(inventoryRepository.save(inventory));
    }

    public InventoryResponse toResponse(Inventory inv) {
        return new InventoryResponse(
                inv.getId(),
                inv.getProduct().getName(),
                inv.getSystemQuantity(),
                inv.getRealQuantity(),
                inv.getDifference(),
                inv.getDateInventory(),
                inv.getComment(),
                inv.getAdjustmentComment(),
                inv.getCreatedBy(),
                inv.getCity() != null ? inv.getCity().name() : null
        );
    }

    public long countNegativeGap() {
        return inventoryRepository.countNegativeGap();
    }

    public long countPositiveGap() {
        return inventoryRepository.countPositiveGap();
    }
}
